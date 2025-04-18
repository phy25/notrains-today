import { QUERY_ROUTE_TYPE_MAPPING } from '$lib/mbta-types';
import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string) => {
	return param in QUERY_ROUTE_TYPE_MAPPING;
}) satisfies ParamMatcher;