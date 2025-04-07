export const prerender = true;
export const ssr = false;

import { filterHighPriorityAlerts, overrideAlerts } from '$lib/mbta-overides';
import { MBTA_TIMEZONE, QUERY_ROUTE_TYPE_MAPPING, type MbtaAlert } from '$lib/mbta-types';
import type { LayoutLoad } from './$types';
import { getAlertsAsDays, MBTA_SERVICE_START_HOUR } from '$lib/calendar';
import { now, toCalendarDate } from "@internationalized/date";

let data_async_data: { data: MbtaAlert[]; alertsByDay: Map<string, MbtaAlert[]>; routeMap: Map<string, any> } | null = null;

export const load: LayoutLoad = ({ route, fetch, url }) => {
    // parse route_type from query string in browser
    const query_route_type = new URLSearchParams(url.search).get('route_type');
    let route_type = 'subway';
    if (query_route_type && (query_route_type in QUERY_ROUTE_TYPE_MAPPING)) {
        route_type = query_route_type;
    }

    const data_async = async () => {
        if (data_async_data !== null) {
            return data_async_data;
        }
        const response = await fetch('https://api-v3.mbta.com/alerts?include=routes&filter%5Broute_type%5D=' + QUERY_ROUTE_TYPE_MAPPING[route_type], {
            headers: {
                'Accept': 'application/vnd.api+json',
            }
        });
        const json = await response.json();
        const routeMap: Map<string, any> = new Map(json.included
            .filter((entity: any) => entity.type === 'route')
            .map((route: any) => [route.id, route]));
        const alertsByDay = getAlertsAsDays(json.data, routeMap);
        data_async_data = {
            data: filterHighPriorityAlerts(overrideAlerts(json.data)),
            alertsByDay,
            routeMap,
        };
        return data_async_data;
    };

    let currentServiceTime = now(MBTA_TIMEZONE);
    if (currentServiceTime.hour < MBTA_SERVICE_START_HOUR) {
        currentServiceTime = currentServiceTime.subtract({days: 1});
    }
    const currentServiceDate = toCalendarDate(currentServiceTime);

    return {
        route_id: route.id,
        current_service_date: currentServiceDate,
        data_async: data_async,
    };
};