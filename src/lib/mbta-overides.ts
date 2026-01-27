import { data as rawData } from '$lib/../data/mbta-overrides-alerts.json';
import { withScope } from '@sentry/sveltekit';
import { type MbtaAlert } from './mbta-types';
import { COMMUTER_RAIL_COMMON_ROUTES } from './mbta-display';

interface OverrideInsertEntry {
    type: 'insert';
    item: MbtaAlert;
    match_not_route?: string;
    match_not_service_dates?: string[];
    included: any[];
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

export const MBTA_URGENT_SEVERITY = 7;

const MBTA_SERVICE_CHANGE_LOW_SEVERITY = 3;

const MBTA_DIVERSION_EFFECTS = ['DETOUR', 'SHUTTLE', 'STOP_CLOSURE', 'STATION_CLOSURE', 'SUSPENSION'];

// hand curated to skip effects that have no delay impact
// mbta/screens priority list: shuttle stop_closure suspension station_closure detour stop_moved snow_route
const MBTA_NOTRAINS_EQUIVALENT_EFFECTS = [
    'CANCELLATION',
    'DELAY',
    'DETOUR',
    'DOCK_CLOSURE',
    'MODIFIED_SERVICE',
    'NO_SERVICE',
    'SCHEDULE_CHANGE',
    'SERVICE_CHANGE',
    'SHUTTLE',
    'SNOW_ROUTE',
    'STATION_CLOSURE',
    'STOP_CLOSURE',
    'SUSPENSION',
];

export const overrideAlerts = (json: {data?: MbtaAlert[]; included: any;}) => {
    const data: OverrideEntry[] = rawData as OverrideEntry[];
    const removeEntryMap: Map<string, OverrideRemoveEntry> = new Map();
    const replaceEntryMap: Map<string, OverrideReplaceEntry> = new Map();
    const removeRouteEntryMap: Map<string, OverrideRemoveRouteEntry> = new Map();
    const newEntryList: OverrideInsertEntry[] = [];

    data.forEach((override) => {
        if (override.type === 'remove') {
            removeEntryMap.set(override.match_id, override);
        }
        if (override.type === 'replace') {
            replaceEntryMap.set(override.match_id, override);
        }
        if (override.type === 'insert' && override.item) {
            newEntryList.push(override);
        }
        if (override.type === 'remove-route') {
            removeRouteEntryMap.set(override.match_id, override);
        }
    });

    const newAlerts: MbtaAlert[] = (json.data || [])
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
        })
        .map((alert: any) => {
            if (alert.attributes.informed_entity.length === COMMUTER_RAIL_COMMON_ROUTES.length) {
                // check if the alert contains all commuter rail routes
                const remainingRoutes = [...COMMUTER_RAIL_COMMON_ROUTES];
                alert.attributes.informed_entity
                    .filter((entity: any) => entity.route_type === 2 && !entity.stop)
                    .forEach((entity: any) => {
                        let index = remainingRoutes.findIndex((route) => route === entity.route);
                        if (index >= 0) {
                            remainingRoutes.splice(index, 1);
                        }
                    });
                if (remainingRoutes.length == 0) {
                    // remove all commuter rail routes
                    return {
                        ...alert,
                        attributes: {
                            ...alert.attributes,
                            informed_entity: [{
                                route_type: 2,
                                activities: alert.attributes.informed_entity[0].activities,
                                route: 'CR'
                            }]
                        }
                    };
                }
            }
            return alert;
        });        

    const included = json.included || [];

    newEntryList.forEach((override: OverrideInsertEntry) => {
        if (override.match_not_route) {
            const alert = override.item;
            const hitRoute = false; // TODO: loop through existing alerts and check if any match the new route
            if (hitRoute) {
                withScope(function (scope) {
                    scope.setExtra('alert', alert);
                    scope.captureMessage(
                        `Alert ${alert.id} not inserted due to rule mismatch, rule has match_not_route: ${override.match_not_route}`,
                        "warning");
                });
                return;
            }
        } else {
            newAlerts.push(override.item);
        }
        if (override.included) {
            included.push(...override.included);
        }
    });

    // add Green wihch does not always be included
    included.push({
        "attributes": {
            "color": "00843D",
            "description": "Rapid Transit",
            "direction_destinations": [
                "Westbound",
                "Eastbound"
            ],
            "direction_names": [
                "West",
                "East"
            ],
            "fare_class": "Rapid Transit",
            "long_name": "Green Line",
            "short_name": "",
            "sort_order": 10032,
            "text_color": "FFFFFF",
            "type": 0
        },
        "id": "Green",
        "links": {
            "self": "/routes/Green"
        },
        "relationships": {
            "agency": {
                "data": {
                    "id": "1",
                    "type": "agency"
                }
            },
            "line": {
                "data": {
                    "id": "line-Green",
                    "type": "line"
                }
            }
        },
        "type": "route"
    },{
        "attributes": {
            "color": "494f5b",
            "description": "Rapid Transit",
            "direction_destinations": [],
            "direction_names": [],
            "fare_class": "Rapid Transit",
            "long_name": "Subway",
            "short_name": "",
            "sort_order": 10000,
            "text_color": "FFFFFF",
            "type": 0
        },
        "id": "Subway",
        "links": {
            "self": "/routes/Subway"
        },
        "relationships": {
            "agency": {
                "data": {
                    "id": "1",
                    "type": "agency"
                }
            },
            "line": {
                "data": {
                    "id": "line-Subway",
                    "type": "line"
                }
            }
        },
        "type": "route"
    },
    {
        "attributes": {
            "color": "80276C",
            "description": "Regional Rail",
            "direction_destinations": ["Outbound", "Inbound"],
            "direction_names": ["Outbound", "Inbound"],
            "fare_class": "Commuter Rail",
            "long_name": "Commuter Rail",
            "short_name": "CR",
            "sort_order": 10000,
            "text_color": "FFFFFF",
            "type": 2
        },
        "id": "CR",
        "links": {
            "self": "/routes/CR"
        },
        "relationships": {
            "agency": {
                "data": {
                    "id": "1",
                    "type": "agency"
                }
            },
            "line": {
                "data": {
                    "id": "line-CR",
                    "type": "line"
                }
            }
        },
        "type": "route"
    },{
        "attributes": {
            "color": "ffc72c",
            "description": "Rapid Transit",
            "direction_destinations": [],
            "direction_names": [],
            "fare_class": "Rapid Transit",
            "long_name": "Bus",
            "short_name": "",
            "sort_order": 10000,
            "text_color": "000000",
            "type": 0
        },
        "id": "Bus",
        "links": {
            "self": "/routes/Bus"
        },
        "relationships": {
            "agency": {
                "data": {
                    "id": "1",
                    "type": "agency"
                }
            },
            "line": {
                "data": {
                    "id": "line-Bus",
                    "type": "line"
                }
            }
        },
        "type": "route"
    });

    return {
        ...json,
        data: newAlerts
    };
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
        if (alert.attributes.informed_entity.every(entity => entity.route_type == 2)
            && (alert.attributes.effect == 'TRACK_CHANGE' || alert.attributes.effect == 'STATION_ISSUE')) {
            // unfortunately we need to ignore MBTA_URGENT_SEVERITY if it is for commuter rail
            return false;
        }
        if (alert.attributes.severity >= MBTA_URGENT_SEVERITY) {
            return true;
        }
        if (alert.attributes.effect == 'ACCESS_ISSUE') {
            return false;
        }
        if (alert.attributes.effect == 'TRACK_CHANGE' || alert.attributes.effect == 'STATION_ISSUE') {
            // TODO: handle this downstream so that we can show it in the archive
            return false;
        }
        if (alert.attributes.effect === 'SCHEDULE_CHANGE' && alert.attributes.severity <= MBTA_SERVICE_CHANGE_LOW_SEVERITY) {
            return false;
        }
        return true;
    });
}