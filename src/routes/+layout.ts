export const prerender = true;
export const ssr = false;

import { filterHighPriorityAlerts, overrideAlerts } from '$lib/mbta-overides';
import { QUERY_ROUTE_TYPE_MAPPING, type MbtaAlert } from '$lib/mbta-types';
import type { LoadEvent } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

let data_async_data: {included: any[]; data: MbtaAlert[];} | null = null;

export const load: LayoutLoad = ({ route, fetch, url }: LoadEvent) => {
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
        data_async_data = {
            included: json.included,
            data: filterHighPriorityAlerts(overrideAlerts(json.data))
        };
        return data_async_data;
    };

	return {
		route_id: route.id,
        data_async: data_async,
	};
};