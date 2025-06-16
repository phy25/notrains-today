import { isDebug } from '$lib/common';
import type { PageLoad } from './$types';

import { entries } from './entry-generator';
export { entries };

import { CalendarDate } from '@internationalized/date';

const loadServiceHours = async (type: 'start' | 'end', currentServiceDate: CalendarDate, fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>) => {
    return Promise.all([
        fetch('https://api-v3.mbta.com/schedules?page%5Blimit%5D=30&sort=' + (type === 'end' ? '-' : '') + 'time&filter%5Bdate%5D='+currentServiceDate.toString()+'&filter%5Bstop_sequence%5D=first&filter%5Broute%5D=Red%2CBlue%2COrange'),
        fetch('https://api-v3.mbta.com/schedules?page%5Blimit%5D=30&sort=' + (type === 'end' ? '-' : '') + 'time&filter%5Bdate%5D='+currentServiceDate.toString()+'&filter%5Bstop_sequence%5D=first&filter%5Broute%5D=Green-B%2CGreen-C%2CGreen-D%2CGreen-E')
    ]).then(async (responses) => {
        const lastTrainRedBlueOrange = await responses[0].json();
        const lastTrainGreen = await responses[1].json();
        const lastTrainTimes = new Map<string, string>();

        // https://github.com/mbta/dotcom/blob/dc0ecea7dfdba60bee1f633e663c69a6fbcff82b/lib/schedules/hours_of_operation.ex#L392
        // This will skip shuttle bus schedules; in fact I believe the MBTA dotcom API would fetch the headsign of the first trip of the day,
        // which is usually the shuttle rather than the train. They then use this headsign to determine the last train time,
        // which is not correct (shuttle closing earlier than the train).
        // For now when there is a shuttle bus, we do not show this time anyway because there is an alert.
        // The general idea is that we show the first departure time of the first/last train,
        // and then show the earlier time of both directions (done in dotcom FE
        // https://github.com/mbta/dotcom/blob/dc0ecea7dfdba60bee1f633e663c69a6fbcff82b/assets/ts/schedule/components/RapidTransitHoursOfOperation.tsx#L45),
        // Only difference from dotcom would be that we would also pick up trains that start midway.
        // Also, dotcom FE uses the actual date rather than the service date, which will return bad time after midnight.
        const lastDeparturesRedBlueOrange: any[] = lastTrainRedBlueOrange.data.filter((item: any) => item.attributes.departure_time);
        ['Red', 'Blue', 'Orange'].forEach((route) => {
            const lastDeparture0 = lastDeparturesRedBlueOrange.find((item: any) => item.relationships.route.data.id === route && item.attributes.direction_id == 0);
            const lastDeparture1 = lastDeparturesRedBlueOrange.find((item: any) => item.relationships.route.data.id === route && item.attributes.direction_id == 1);
            const lastDeparture = (lastDeparture0 && lastDeparture1) ? (
                // comparing text here, which is fine for ISO format
                lastDeparture0.attributes.departure_time < lastDeparture1.attributes.departure_time ? lastDeparture0 : lastDeparture1)
                : (lastDeparture0 || lastDeparture1);
            lastTrainTimes.set(route, lastDeparture ? lastDeparture.attributes.departure_time : undefined);
        });

        const lastDepartureGreen0: any = lastTrainGreen.data.find((item: any) => item.attributes.departure_time && item.attributes.direction_id == 0);
        const lastDepartureGreen1: any = lastTrainGreen.data.find((item: any) => item.attributes.departure_time && item.attributes.direction_id == 1);
        const lastDeparturesGreen = ['Green-B', 'Green-C', 'Green-D', 'Green-E'].flatMap((route) => {
            return [
                lastTrainGreen.data.find((item: any) => item.attributes.departure_time && item.relationships.route.data.id === route && item.attributes.direction_id == 0),
                lastTrainGreen.data.find((item: any) => item.attributes.departure_time && item.relationships.route.data.id === route && item.attributes.direction_id == 1),
            ];
        });
        lastDeparturesGreen.sort((a: any, b: any) => {
            const aTime = a?.attributes?.departure_time;
            const bTime = b?.attributes?.departure_time;
            if (aTime < bTime) {
                return -1;
            } else if (aTime > bTime) {
                return 1;
            } else {
                return 0;
            }
        });

        const lastDepartureGreen = (lastDepartureGreen0 && lastDepartureGreen1) ? (
            // comparing text here, which is fine for ISO format
            lastDepartureGreen0.attributes.departure_time < lastDepartureGreen1.attributes.departure_time ? lastDepartureGreen0 : lastDepartureGreen1)
            : (lastDepartureGreen0 || lastDepartureGreen1);
        lastTrainTimes.set('Green', lastDeparturesGreen[0] ? lastDeparturesGreen[0].attributes.departure_time : undefined);
        return lastTrainTimes;
    });
};

export const load = (async ({ parent, fetch }) => {
    const parentData = await parent();
    let lastTrainDataAsync = Promise.resolve(new Map<string, string>());

    if (parentData.is_current_service_night_owl) {
        // load last train data
        lastTrainDataAsync = loadServiceHours('end', parentData.current_service_date, fetch);
    }

    if (parentData.is_current_service_early_bird) {
        // load first train data
        lastTrainDataAsync = loadServiceHours('start', parentData.current_service_date, fetch);
    }

    if (parentData.data_async_awaited) {
        // SPA reload. Do not resolve page data until the new data is fetched
        await lastTrainDataAsync;
    }

    return {
        ...parentData,
        data_async: parentData.data_async,
        last_train_data_async: lastTrainDataAsync,
    };
}) satisfies PageLoad;