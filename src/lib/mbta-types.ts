import {Time, getDayOfWeek, type AnyCalendarDate, type CalendarDate} from '@internationalized/date';
import { m } from './paraglide/messages';

export interface MbtaAlert {
    attributes: {
        active_period: { end?: string; start: string }[];
        banner: string | null;
        cause: string;
        created_at: string;
        description: string;
        duration_certainty: string;
        effect: string;
        header: string;
        image: string | null;
        image_alternative_text: string | null;
        informed_entity: {
            stop: string;
            route_type: number;
            route: string;
            activities: string[];
            trip: string | null;
            direction_id: number | null;
        }[];
        lifecycle: string;
        service_effect: string;
        severity: number;
        short_header: string;
        timeframe: string;
        updated_at: string;
        url: string | null;
    };
    id: string;
    links: {
        self: string;
    };
    type: string;
}

export const RAPID_TRANSIT_QUERY_ROUTE_TYPE = 'rapid-transit';
// https://github.com/mbta/dotcom/blob/78599a3b9c590675bfb35beb8324fb5bea125abc/lib/routes/route.ex#L92
export const RAPID_TRANSIT_BUS_ROUTES = ['741', '742', '743', '746', '749', '751'];

export const QUERY_ROUTE_TYPE_MAPPING: Record<string, string> = {
    'mbta': '0,1,2,3,4',
    'trains': '0,1,2',
    'subway': '0,1',
    [RAPID_TRANSIT_QUERY_ROUTE_TYPE]: '0,1,3',
    'bus': '3',
    'commuter-rail': '2',
    'ferry': '4',
};

export const QUERY_ROUTE_TYPE_DROPDOWN_M: Record<string, typeof m.routeTypeTrains> = {
    '': m.routeTypeMBTA,
    'trains': m.routeTypeTrains,
    'rapid-transit': m.routeTypeRapidTransit,
    'commuter-rail': m.routeTypeCommuterRail,
    'bus': m.routeTypeBus,
    'ferry': m.routeTypeFerry,
    'mbta': m.routeTypeMBTA,
};

export const QUERY_ROUTE_TYPE_WITH_SUBWAY = [
    'mbta',
    'trains',
    'subway',
    RAPID_TRANSIT_QUERY_ROUTE_TYPE,
];

export const DEFAULT_QUERY_ROUTE_TYPE = 'trains';

export const MBTA_TIMEZONE = 'America/New_York';

// To make the final train connections of the night, get to core downtown stations by
export const getMbtaDowntownCoreLastTransferTime = (date: AnyCalendarDate) => {
    const dayOfWeek = getDayOfWeek(date as CalendarDate, 'en-US'); // 0 = Sunday
    return dayOfWeek >= 0 && dayOfWeek <= 4 ? new Time(0, 35) : new Time(1, 30); // 12:35 AM or 1:30 AM
};
