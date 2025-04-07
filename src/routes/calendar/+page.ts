import { filterHighPriorityAlerts, overrideAlerts } from '$lib/mbta-overides';
import { QUERY_ROUTE_TYPE_MAPPING } from '$lib/mbta-types';
import type { PageLoad } from './$types';

export const ssr = false;

export const load = (async ({ fetch, url }) => {
    // parse route_type from query string in browser
    const query_route_type = new URLSearchParams(url.search).get('route_type');
    let route_type = 'subway';
    if (query_route_type && (query_route_type in QUERY_ROUTE_TYPE_MAPPING)) {
        route_type = query_route_type;
    }

    const response = await fetch('https://api-v3.mbta.com/alerts?include=routes&filter%5Broute_type%5D=' + QUERY_ROUTE_TYPE_MAPPING[route_type], {
        headers: {
            'Accept': 'application/vnd.api+json',
        }
    });
    const json = await response.json();
    return {
        ...json,
        data: filterHighPriorityAlerts(overrideAlerts(json.data)),
    };
}) satisfies PageLoad;