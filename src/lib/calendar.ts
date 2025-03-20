import type { MbtaAlert } from "./mbta-types";

export const MBTA_SERVICE_START_HOUR = 3;
// usually, end time is 2:59 and start time is 3:00
// we have also seen buses service hour on 3:30

export const getAlertsAsDays = (alerts: MbtaAlert[], routeMap: Map<string, any>) => {
    const days: Map<string, MbtaAlert[]> = new Map();
    alerts.forEach((alert) => {
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
                days.get(dateString)?.push(alert);

                // check next day MBTA_SERVICE_START_HOUR
                currentDate.setDate(currentDate.getDate() + 1);
            }
        });
    });
    // sort alerts
    days.forEach((alerts, _) => {
        alerts.sort((a, b) => {
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