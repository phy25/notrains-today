export const prerender = true;

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ route }) => {
	return {
		route_id: route.id,
	};
};