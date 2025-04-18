import type { PageLoad } from './$types';
import { entries } from '../entry-generator';

export { entries };

export const load = (async ({ parent }) => {
    const parentData = await parent();
    const data = await parentData.data_async();
    return {
        ...parentData,
        ...data,
    };
}) satisfies PageLoad;