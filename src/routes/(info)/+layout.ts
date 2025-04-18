export const prerender = true;
export const ssr = false;

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ route }) => {
    return {
        route_id: route.id,
    };
};