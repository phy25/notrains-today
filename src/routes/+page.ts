import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
    const parentData = await parent();
    return {
        ...parentData,
        data_async: parentData.data_async,
    };
}) satisfies PageLoad;