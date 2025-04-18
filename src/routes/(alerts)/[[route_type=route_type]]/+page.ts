import type { PageLoad } from './$types';

import { entries } from './entry-generator';
export { entries };

export const load = (async ({ parent }) => {
    const parentData = await parent();
    return {
        ...parentData,
        data_async: parentData.data_async,
    };
}) satisfies PageLoad;