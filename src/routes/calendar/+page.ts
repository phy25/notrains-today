import type { PageLoad } from './$types';

export const ssr = false;

export const load = (async ({ parent }) => {
    const { data_async } = await parent();
    const data = await data_async();
    return {
        ...data,
    };
}) satisfies PageLoad;