import { QUERY_ROUTE_TYPE_MAPPING } from "$lib/mbta-types";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
    return [
        { route_type: undefined },
        ...Object.keys(QUERY_ROUTE_TYPE_MAPPING).map((route_type) => ({
            route_type: route_type as string,
        })),
    ];
};