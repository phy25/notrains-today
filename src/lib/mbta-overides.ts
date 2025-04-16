import { data as rawData } from '$lib/../data/mbta-overrides-alerts.json';
import { withScope } from '@sentry/sveltekit';
import type { MbtaAlert } from './mbta-types';

interface OverrideInsertEntry {
    type: 'insert';
    item: object;
}

interface OverrideRemoveEntry {
    type: 'remove';
    match_id: string;
    match_updated_at: string;
}

interface OverrideRemoveRouteEntry {
    type: 'remove-route';
    match_id: string;
    match_updated_at: string;
    route_ids: string[];
}

interface OverrideReplaceEntry {
    type: 'replace';
    match_id: string;
    match_updated_at: string;
    item: object;
}

type OverrideEntry = OverrideInsertEntry | OverrideRemoveEntry | OverrideReplaceEntry | OverrideRemoveRouteEntry;

const MBTA_URGENT_SEVERITY = 7;

const MBTA_SERVICE_CHANGE_LOW_SEVERITY = 3;

const MBTA_DIVERSION_EFFECTS = ['DETOUR', 'SHUTTLE', 'STOP_CLOSURE', 'STATION_CLOSURE', 'SUSPENSION'];

export const overrideAlerts = (alerts: MbtaAlert[]) => {
    const data: OverrideEntry[] = rawData as OverrideEntry[];
    const removeEntryMap: Map<string, OverrideRemoveEntry> = new Map();
    const replaceEntryMap: Map<string, OverrideReplaceEntry> = new Map();
    const removeRouteEntryMap: Map<string, OverrideRemoveRouteEntry> = new Map();
    const newEntryList: object[] = [];

    data.forEach((override) => {
        if (override.type === 'remove') {
            removeEntryMap.set(override.match_id, override);
        }
        if (override.type === 'replace') {
            replaceEntryMap.set(override.match_id, override);
        }
        if (override.type === 'insert' && override.item) {
            newEntryList.push(override.item);
        }
        if (override.type === 'remove-route') {
            removeRouteEntryMap.set(override.match_id, override);
        }
    });

    const newAlerts = alerts
        .filter((alert: any) => {
            const removeEntry = removeEntryMap.get(alert.id);
            if (removeEntry) {
                if (removeEntry.match_updated_at && removeEntry.match_updated_at !== alert.attributes.updated_at) {
                    withScope(function (scope) {
                        scope.setExtra('alert', alert);
                        scope.captureMessage(
                            `Alert ${alert.id} not removed due to rule mismatch, rule has match_updated_at: ${removeEntry.match_updated_at}`,
                            "warning");
                    });
                }
                if (!removeEntry.match_updated_at || removeEntry.match_updated_at === alert.attributes.updated_at) {
                    console.log('Removing alert: ' + alert.id + ' with rule match_updated_at: ' + removeEntry.match_updated_at);
                    return false;
                }
            }
            return true;
        })
        .map((alert: any) => {
            const replaceEntry = replaceEntryMap.get(alert.id);
            if (replaceEntry) {
                if (replaceEntry.match_updated_at && replaceEntry.match_updated_at !== alert.attributes.updated_at) {
                    withScope(function (scope) {
                        scope.setExtra('alert', alert);
                        scope.captureMessage(
                            `Alert ${alert.id} not replaced due to rule mismatch, rule has match_updated_at: ${replaceEntry.match_updated_at}`,
                            "warning");
                    });
                }
                if (!replaceEntry.match_updated_at || replaceEntry.match_updated_at === alert.attributes.updated_at) {
                    console.log('Replacing alert: ' + alert.id + ' with rule match_updated_at: ' + replaceEntry.match_updated_at);
                    return {
                        ...alert,
                        ...replaceEntry.item,
                        attributes: {
                            ...alert.attributes,
                            ...((replaceEntry.item as MbtaAlert)?.attributes || {}),
                        }
                    };
                }
                return alert;
            }

            const removeRouteEntry = removeRouteEntryMap.get(alert.id);
            if (removeRouteEntry) {
                if (removeRouteEntry.match_updated_at && removeRouteEntry.match_updated_at !== alert.attributes.updated_at) {
                    withScope(function (scope) {
                        scope.setExtra('alert', alert);
                        scope.captureMessage(
                            `Alert ${alert.id} not removed due to rule mismatch, rule has match_updated_at: ${removeRouteEntry.match_updated_at}`,
                            "warning");
                    });
                }
                if (!removeRouteEntry.match_updated_at || removeRouteEntry.match_updated_at === alert.attributes.updated_at) {
                    console.log('Removing routes from alert: ' + alert.id + ' with rule match_updated_at: ' + removeRouteEntry.match_updated_at);
                    return {
                        ...alert,
                        attributes: {
                            ...alert.attributes,
                            informed_entity: alert.attributes.informed_entity.filter(
                                (entity: any) => !removeRouteEntry.route_ids.includes(entity.route)),
                        }
                    };
                }
            }
            return alert;
        });

    newAlerts.push(...newEntryList);
    return newAlerts;
}

export const filterHighPriorityAlerts = (alerts: MbtaAlert[]) => {
    return alerts.filter((alert) => {
        // https://github.com/mbta/dotcom/blob/main/lib/alerts/priority.ex
        // although we need to adapt it to fit calendar use cases
        if (alert.attributes.cause == 'TRAFFIC') {
            return true;
        }
        if (MBTA_DIVERSION_EFFECTS.includes(alert.attributes.effect)) {
            return true;
        }
        if (alert.attributes.effect == 'DELAY') {
            return true;
        }
        if (alert.attributes.effect == 'CANCELLATION') {
            return true;
        }
        if (alert.attributes.severity >= MBTA_URGENT_SEVERITY) {
            return true;
        }
        if (alert.attributes.effect == 'ACCESS_ISSUE') {
            return false;
        }
        if (alert.attributes.effect === 'SCHEDULE_CHANGE' && alert.attributes.severity <= MBTA_SERVICE_CHANGE_LOW_SEVERITY) {
            return false;
        }
        return true;
    });
}