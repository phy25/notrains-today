export const prerender = true;
export const ssr = false;

import { filterHighPriorityAlerts, overrideAlerts } from '$lib/mbta-overides';
import { DEFAULT_QUERY_ROUTE_TYPE, MBTA_TIMEZONE, QUERY_ROUTE_TYPE_MAPPING, RAPID_TRANSIT_BUS_ROUTES, RAPID_TRANSIT_QUERY_ROUTE_TYPE, type MbtaAlert } from '$lib/mbta-types';
import type { LayoutLoad } from './$types';
import { getAlertsAsDays, MBTA_SERVICE_START_HOUR } from '$lib/calendar';
import { now, parseDate, toCalendarDate } from "@internationalized/date";
import { captureException } from '@sentry/sveltekit';

let data_async_data: {
    data: MbtaAlert[];
    alertsByDay: Map<string, MbtaAlert[]>;
    routeMap: Map<string, any>;
    lastUpdated: string;
    rawResponse: any;
} | null = null;
let data_async_hash: string | null = null;
let date_async_lastUpdated: number = 0;

export const load: LayoutLoad = async ({ params, route, fetch }) => {
    // parse route_type from query string in browser
    let route_type = params.route_type || DEFAULT_QUERY_ROUTE_TYPE;

    const data_async_promise = new Promise<{
        data: MbtaAlert[],
        alertsByDay: ReturnType<typeof getAlertsAsDays>,
        routeMap: Map<string, any>,
        lastUpdated: string,
        rawResponse: any,
    }>(async (resolve, reject) => {
        // not including accessibility and parking alerts for now
        const url = 'https://api-v3.mbta.com/alerts?include=routes&filter%5Bactivity%5D=BOARD,EXIT,RIDE,BRINGING_BIKE&filter%5Broute_type%5D=' + QUERY_ROUTE_TYPE_MAPPING[route_type];

        if (data_async_data && data_async_hash === route_type && (Date.now() - date_async_lastUpdated) < 1000 * 10) {
            // if data is already fetched and not older than 10 seconds, use cached data
            resolve(data_async_data);
            return;
        }
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/vnd.api+json',
                }
            });
            const json = await response.json();
            const lastUpdated = response.headers.get('Last-Modified') || new Date().toUTCString();
            if (response.status >= 400) {
                reject(new Error('Error fetching data: ' + JSON.stringify(json)));
                return;
            }
            const overridenJson = (() => {
                const j = overrideAlerts(json || {});
                if (route_type !== RAPID_TRANSIT_QUERY_ROUTE_TYPE) {
                    return j;
                }
                return {
                    ...j,
                    data: j.data.filter(alert => {
                        if (alert.attributes.informed_entity.length === 0) {
                            return true;
                        }
                        if (alert.attributes.informed_entity[0].route_type !== 3) {
                            return true;
                        }
                        return alert.attributes.informed_entity.some((entity: any) => RAPID_TRANSIT_BUS_ROUTES.includes(entity.route));
                    })
                };
            })();
            const routeMap: Map<string, any> = new Map((overridenJson.included || [])
                .filter((entity: any) => entity.type === 'route')
                .map((route: any) => [route.id, route]));
            const alertsByDay = getAlertsAsDays(filterHighPriorityAlerts(overridenJson.data), routeMap);
            data_async_data = {
                data: filterHighPriorityAlerts(overridenJson.data),
                alertsByDay,
                routeMap,
                lastUpdated,
                rawResponse: json,
            };
            data_async_hash = route_type;
            date_async_lastUpdated = Date.now();
            resolve(data_async_data);
        } catch (err) {
            reject(err);
        }
    }).catch((err) => {
        captureException(err);
        throw err;
    });

    const data_async = () => data_async_promise;
    let data_async_awaited = false;
    if (data_async_data) {
        // SPA reload. Do not resolve page data until the new data is fetched
        await data_async_promise;
        data_async_awaited = true;
    }

    let currentServiceTime = now(MBTA_TIMEZONE);
    if (currentServiceTime.hour < MBTA_SERVICE_START_HOUR) {
        currentServiceTime = currentServiceTime.subtract({days: 1});
    }
    const currentServiceDate = (typeof localStorage !== 'undefined') && localStorage.getItem('debugDate')
        ? parseDate(localStorage.getItem('debugDate') || '')
        : toCalendarDate(currentServiceTime);
        
    let isNightOwl = currentServiceTime.hour < MBTA_SERVICE_START_HOUR || currentServiceTime.hour >= 23;
    if ((typeof localStorage !== 'undefined') && localStorage.getItem('debugNightOwl') === 'true') {
        isNightOwl = true;
    }
    if ((typeof localStorage !== 'undefined') && localStorage.getItem('debugNightOwl') === 'false') {
        isNightOwl = false;
    }

    let isEarlyBird = currentServiceTime.hour >= MBTA_SERVICE_START_HOUR && currentServiceTime.hour < 7;
    if ((typeof localStorage !== 'undefined') && localStorage.getItem('debugEarlyBird') === 'true') {
        isEarlyBird = true;
    }
    if ((typeof localStorage !== 'undefined') && localStorage.getItem('debugEarlyBird') === 'false') {
        isEarlyBird = false;
    }

    return {
        route_id: route.id,
        route_type: route_type,
        current_service_date: currentServiceDate,
        is_current_service_night_owl: isNightOwl,
        is_current_service_early_bird: isEarlyBird,
        data_async: data_async,
        data_async_awaited,
    };
};