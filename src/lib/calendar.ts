import type { MbtaAlert } from "./mbta-types";
import { isSplitBranchRouteAlert, mergeSplitBranchRouteAlerts } from "./mbta-display";

export const MBTA_SERVICE_START_HOUR = 3;
// to be deprecated with a Time object
// usually, end time is 2:59 and start time is 3:00
// we have also seen buses service hour on 3:30

const insertSingleAlert = (alert: MbtaAlert, days: Map<string, MbtaAlert[]>, filterRoute?: string) => {
    alert.attributes.active_period.forEach((period) => {
        const startDate = new Date(period.start);
        // TODO: what to do with ferry alerts with no end time
        // for now, we will need to at least insert them to today for indefinite emergencies
        const currentDate = new Date(startDate);
        // only when the change is after MBTA_SERVICE_START_HOUR we mark it on that day
        currentDate.setHours(MBTA_SERVICE_START_HOUR, 30, 0, 0);
        const endDate = new Date(period.end || currentDate);

        while (currentDate <= endDate) {
            const dateString = getDateString(currentDate);
            if (!days.has(dateString)) {
                days.set(dateString, []);
            }
            if (!filterRoute) {
                days.get(dateString)?.push(alert);
            } else {
                days.get(dateString)?.push({
                    ...alert,
                    attributes: {
                        ...alert.attributes,
                        informed_entity: alert.attributes.informed_entity.filter(
                            (entity) => entity.route === filterRoute),
                    }
                });
            }

            // check next day MBTA_SERVICE_START_HOUR
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });
}

const hasShortTermImpact = (alert: MbtaAlert) => {
    if (alert.attributes.active_period.length !== 1) {
        return false;
    }
    return !alert.attributes.active_period[0].end || (+new Date(alert.attributes.active_period[0].end) - Date.now()) <= 1000*60*60*3;
}

export const getProcessedAlertsAsSingleRoute = (alerts: MbtaAlert[]) => {
    const processedAlertsWithBranches = mergeSplitBranchRouteAlerts(alerts.filter(isSplitBranchRouteAlert));
    // TODO: need to handle this more upstream so that it doesn't break sorting
    return processedAlertsWithBranches.concat(
        expandAlertsToSingleRoute(alerts.filter(alert => !isSplitBranchRouteAlert(alert))));
}

const expandAlertsToSingleRoute = (alerts: MbtaAlert[]) => {
    return alerts.flatMap(alert => {
        // generate a list of unique routes
        const uniqueRoutes = alert.attributes.informed_entity
            .filter(entity => entity.route)
            .map(entity => entity.route)
            .filter((route, index, arr) => arr.indexOf(route) === index)
            .sort((a, b) => {
                return a.localeCompare(b);
            });
        
        return uniqueRoutes.map(route => {
            return {
                ...alert,
                attributes: {
                    ...alert.attributes,
                    informed_entity: alert.attributes.informed_entity.filter(
                        (entity) => entity.route === route),
                }
            };
        });
    });
}

/**
 * Used for Glance to merge branch routes to show the correct alert count.
 * 
 * @param alerts alerts already split by route
 * @returns alerts with branch routes merged
 */
export const mergeAlertInformedEntity = (alerts: MbtaAlert[]) => {
    const uniqueAlertIds = alerts
        .map(alert => alert.id)
        .filter((value, index, self) => self.indexOf(value) === index);
    return uniqueAlertIds.map(alertId => {
        const firstAlert = alerts.find(alert => alert.id === alertId);
        if (!firstAlert) {
            return null;
        }
        return {
            ...firstAlert,
            attributes: {
                ...firstAlert.attributes,
                informed_entity: alerts.filter(alert => alert.id === alertId)
                    .flatMap(alert => alert.attributes.informed_entity)
            }
        };
    }).filter(alert => alert !== null);
};

export const getAlertsAsDays = (alerts: MbtaAlert[], routeMap: Map<string, any>) => {
    const days: Map<string, MbtaAlert[]> = new Map();
    alerts.forEach((alert) => {
        insertSingleAlert(alert, days);
    });
    // sort alerts
    days.forEach((alerts, _) => {
        alerts.sort((a, b) => {
            // sort by route type (0 first), unless it is a banner alert
            // (commuter rails usually abuses severity so it was outranking other alerts)
            const routeTypeDiff = a.attributes.informed_entity[0].route_type - b.attributes.informed_entity[0].route_type;
            const bannerDiff = (b.attributes.banner ? 1 : 0) - (a.attributes.banner ? 1 : 0);
            if (bannerDiff !== 0) {
                return bannerDiff;
            }
            if (routeTypeDiff !== 0) {
                return routeTypeDiff;
            }
            if (hasShortTermImpact(a) && !hasShortTermImpact(b)) {
                return -1;
            }
            if (!hasShortTermImpact(a) && hasShortTermImpact(b)) {
                return 1;
            }
            const severityDiff = b.attributes.severity - a.attributes.severity;
            const lineOrderDiff = routeMap.get(a.attributes.informed_entity[0].route)?.attributes.sort_order -
                routeMap.get(b.attributes.informed_entity[0].route)?.attributes.sort_order;
            return severityDiff || lineOrderDiff;
        });
    });
    return days;
}

export const getAlertsMapByEffect = (alerts: MbtaAlert[]) => {
    const effects: Map<string, MbtaAlert[]> = new Map();
    alerts.forEach((alert) => {
        if (!effects.has(alert.attributes.effect)) {
            effects.set(alert.attributes.effect, []);
        }
        effects.get(alert.attributes.effect)?.push(alert);
    });
    // not sorting because getAlertsAsDays is already sorting the alerts
    return effects;
}

export const getDateString = (date: Date) => {
    // get local time string in YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const alertsToRouteRenderingList = (alerts: MbtaAlert[], routeMap: Map<string, any>) => {
    return alerts?.flatMap(alert => 
        alert.attributes.informed_entity.sort((a, b) => (a.route_type - b.route_type) || a.route.localeCompare(b.route)))
        ?.map(entity => entity.route)
        ?.filter(route_id => !!route_id)
        ?.filter((value, index, self) => self.indexOf(value) === index)
        ?.map(route_id => {
            return {
                route_id,
                attributes: routeMap.get(route_id)?.attributes,
            }
        });
};

export const getBannerAlerts = (alerts: MbtaAlert[]) => {
    return alerts.filter(alert => alert.attributes.banner)
        .sort((a, b) => {
            // sort by severity
            return b.attributes.severity - a.attributes.severity;
        });
}
