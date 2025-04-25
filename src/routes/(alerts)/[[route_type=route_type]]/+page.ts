import type { PageLoad } from './$types';

import { entries } from './entry-generator';
export { entries };

export const load = (async ({ parent, fetch }) => {
    const parentData = await parent();
    let lastTrainDataAsync = Promise.resolve(new Map<string, string>());

    if (parentData.is_current_service_night_owl) {
        // load last train data
        lastTrainDataAsync = Promise.all([
            fetch('https://api-v3.mbta.com/schedules?page%5Blimit%5D=30&sort=-time&filter%5Bdate%5D='+parentData.current_service_date.toString()+'&filter%5Broute%5D=Red%2CBlue%2COrange'),
            fetch('https://api-v3.mbta.com/schedules?page%5Blimit%5D=10&sort=-time&filter%5Bdate%5D='+parentData.current_service_date.toString()+'&filter%5Broute%5D=Green-B%2CGreen-C%2CGreen-D%2CGreen-E')
        ]).then(async (responses) => {
            const lastTrainRedBlueOrange = await responses[0].json();
            const lastTrainGreen = await responses[1].json();
            const lastTrainTimes = new Map<string, string>();

            const lastDeparturesRedBlueOrange: any[] = lastTrainRedBlueOrange.data.filter((item: any) => item.attributes.departure_time);
            ['Red', 'Blue', 'Orange'].forEach((route) => {
                const lastDeparture = lastDeparturesRedBlueOrange.find((item: any) => item.relationships.route.data.id === route);
                lastTrainTimes.set(route, lastDeparture ? lastDeparture.attributes.departure_time : undefined);
            });

            const lastDeparturesGreen: any[] = lastTrainGreen.data.filter((item: any) => item.attributes.departure_time);
            lastTrainTimes.set('Green', lastDeparturesGreen[0] ? lastDeparturesGreen[0].attributes.departure_time : undefined);

            return lastTrainTimes;
        });
    }
    return {
        ...parentData,
        data_async: parentData.data_async,
        last_train_data_async: lastTrainDataAsync,
    };
}) satisfies PageLoad;