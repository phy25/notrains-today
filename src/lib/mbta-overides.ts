import { data as rawData } from '$lib/../data/mbta-overrides-alerts.json';
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

interface OverrideReplaceEntry {
    type: 'replace';
    match_id: string;
    match_updated_at: string;
    item: object;
}

type OverrideEntry = OverrideInsertEntry | OverrideRemoveEntry | OverrideReplaceEntry;

const MBTA_URGENT_SEVERITY = 7;

const MBTA_SERVICE_CHANGE_LOW_SEVERITY = 3;

const MBTA_DIVERSION_EFFECTS = ['DETOUR', 'SHUTTLE', 'STOP_CLOSURE', 'STATION_CLOSURE', 'SUSPENSION'];

export const overrideAlerts = (alerts: MbtaAlert[]) => {
    const data: OverrideEntry[] = rawData as OverrideEntry[];
    const removeEntryMap: Map<string, OverrideRemoveEntry> = new Map();
    const replaceEntryMap: Map<string, OverrideReplaceEntry> = new Map();
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
    });

    const newAlerts = alerts
        .filter((alert: any) => {
            const removeEntry = removeEntryMap.get(alert.id);
            if (removeEntry) {
                if (removeEntry.match_updated_at === alert.attributes.updated_at) {
                    console.log('Removing alert: ' + alert.id);
                    return false;
                }
            }
            return true;
        })
        .map((alert: any) => {
            const replaceEntry = replaceEntryMap.get(alert.id);
            if (replaceEntry) {
                if (replaceEntry.match_updated_at === alert.attributes.updated_at) {
                    console.log('Replacing alert: ' + alert.id);
                    return replaceEntry.item;
                }
                return alert;
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