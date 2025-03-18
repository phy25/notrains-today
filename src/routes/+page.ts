import type { PageLoad } from './$types';

export const ssr = false;

export const load = (async ({ fetch }) => {
    const route_type = !!window ? parseInt(window.location.search.slice(1)) : '0';
    const response = await fetch('https://api-v3.mbta.com/alerts?filter%5Bactivity%5D=RIDE&filter%5Broute_type%5D=' + route_type, {
        headers: {
            'Accept': 'application/vnd.api+json',
        }
    });
    const json = await response.json();
    return json;
}) satisfies PageLoad;