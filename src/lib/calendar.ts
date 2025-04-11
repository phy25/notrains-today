import type { MbtaAlert } from "./mbta-types";

export const MBTA_SERVICE_START_HOUR = 3;
// usually, end time is 2:59 and start time is 3:00
// we have also seen buses service hour on 3:30

const insertSingleAlert = (alert: MbtaAlert, days: Map<string, MbtaAlert[]>, filterRoute?: string) => {
    alert.attributes.active_period.forEach((period) => {
        if (!period.start || !period.end) {
            // TODO: what to do with ferry alerts with no end time
            return;
        }
        const startDate = new Date(period.start);
        const endDate = new Date(period.end);
        const currentDate = new Date(startDate);
        // only when the change is after MBTA_SERVICE_START_HOUR we mark it on that day
        currentDate.setHours(MBTA_SERVICE_START_HOUR, 30, 0, 0);

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
    return (+new Date(alert.attributes.active_period[0].end) - Date.now()) <= 1000*60*60*3;
}

export const expandAlertsToSingleRoute = (alerts: MbtaAlert[]) => {
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

export const getAlertsAsDays = (alerts: MbtaAlert[], routeMap: Map<string, any>) => {
    const days: Map<string, MbtaAlert[]> = new Map();
    alerts.forEach((alert) => {
        insertSingleAlert(alert, days);
    });
    // sort alerts
    days.forEach((alerts, _) => {
        alerts.sort((a, b) => {
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

export const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
};
