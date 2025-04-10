export const prerender = true;
export const ssr = false;

import { filterHighPriorityAlerts, overrideAlerts } from '$lib/mbta-overides';
import { MBTA_TIMEZONE, QUERY_ROUTE_TYPE_MAPPING, type MbtaAlert } from '$lib/mbta-types';
import type { LayoutLoad } from './$types';
import { getAlertsAsDays, MBTA_SERVICE_START_HOUR } from '$lib/calendar';
import { now, parseDate, toCalendarDate } from "@internationalized/date";

let data_async_data: { data: MbtaAlert[]; alertsByDay: Map<string, MbtaAlert[]>; routeMap: Map<string, any> } | null = null;
let data_async_hash: string | null = null;

export const load: LayoutLoad = ({ route, fetch, url }) => {
    // parse route_type from query string in browser
    const query_route_type = url.searchParams.get('route_type');
    let route_type = 'subway';
    if (query_route_type && (query_route_type in QUERY_ROUTE_TYPE_MAPPING)) {
        route_type = query_route_type;
    }

    const data_async_promise = new Promise<{
        data: MbtaAlert[];
        alertsByDay: ReturnType<typeof getAlertsAsDays>;
        routeMap: Map<string, any>;
    }>(async (resolve, reject) => {
        const url = 'https://api-v3.mbta.com/alerts?include=routes&filter%5Broute_type%5D=' + QUERY_ROUTE_TYPE_MAPPING[route_type];

        if (data_async_data && data_async_hash === url) {
            resolve(data_async_data);
        }
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/vnd.api+json',
                }
            });
            const json = await response.json();
            if (response.status !== 200) {
                reject(json);
                return;
            }
            const routeMap: Map<string, any> = new Map((json.included || [])
                .filter((entity: any) => entity.type === 'route')
                .map((route: any) => [route.id, route]));
            const overridenData = overrideAlerts(json.data || []);
            const alertsByDay = getAlertsAsDays(overridenData, routeMap);
            data_async_data = {
                data: filterHighPriorityAlerts(overridenData),
                alertsByDay,
                routeMap,
            };
            data_async_hash = url;
            resolve(data_async_data);
        } catch (err) {
            reject(err);
        }
    });

    const data_async = async () => data_async_promise;

    let currentServiceTime = now(MBTA_TIMEZONE);
    const isNightOwl = currentServiceTime.hour < MBTA_SERVICE_START_HOUR || currentServiceTime.hour >= 23;
    if (currentServiceTime.hour < MBTA_SERVICE_START_HOUR) {
        currentServiceTime = currentServiceTime.subtract({days: 1});
    }
    const currentServiceDate = (typeof localStorage !== 'undefined') && localStorage.getItem('debugDate')
        ? parseDate(localStorage.getItem('debugDate') || '')
        : toCalendarDate(currentServiceTime);
    // localStorage.setItem('debugDate', '2025-04-26');

    return {
        route_id: route.id,
        current_service_date: currentServiceDate,
        is_current_service_night_owl: isNightOwl,
        data_async: data_async,
    };
};