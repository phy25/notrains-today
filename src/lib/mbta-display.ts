import { m } from '$lib/paraglide/messages';
import { parseDate, parseZonedDateTime, toCalendarDate } from "@internationalized/date";
import { MBTA_TIMEZONE, type MbtaAlert } from './mbta-types';

export const EFFECT_MESSAGES = {
    'DELAY': m['mbta_alert_effect.DELAY'],
    'SHUTTLE': m['mbta_alert_effect.SHUTTLE'],
    'STATION_CLOSURE': m['mbta_alert_effect.STATION_CLOSURE'],
    'STATION_ISSUE': m['mbta_alert_effect.STATION_ISSUE'],
    'SERVICE_CHANGE': m['mbta_alert_effect.SERVICE_CHANGE'],
    'ADDITIONAL_SERVICE': m['mbta_alert_effect.ADDITIONAL_SERVICE'],
    'TRACK_CHANGE': m['mbta_alert_effect.TRACK_CHANGE'],
};

export const EFFECT_WITH_LINE_MESSAGES: Record<string, (args: { line: string }) => string> = {
};

export const LINE_NAMES = {
    'Mattapan': m['mbta_lines_name.Mattapan'](),
    'Red': m['mbta_lines_name.Red'](),
    'Orange': m['mbta_lines_name.Orange'](),
    'Blue': m['mbta_lines_name.Blue'](),
    'Green': m['mbta_lines_name.Green'](),
}

const ROUTE_PILL_MAPPING: Record<string, string> = {
    'Mattapan': 'M',
    'Red': 'RL',
    'Orange': 'OL',
    'Blue': 'BL',
    'Green': 'GL',
    // Commuter Rail unofficial
    'CR-Fairmount': 'Fa',
    'CR-NewBedford': 'FR/NB',
    'CR-Fitchburg': 'Fi',
    'CR-Worcester': 'Fr/Wo',
    'CR-Franklin': 'Fr/Fo',
    'CR-Greenbush': 'Gr',
    'CR-Haverhill': 'Ha',
    'CR-Kingston': 'Ki',
    'CR-Lowell': 'Lo',
    'CR-Needham': 'Ne',
    'CR-Newburyport': 'Ne/Ro',
    'CR-Providence': 'Pr/St',
    'CR-Foxboro': 'FoEv',
};

export const SECONDARY_SYMBOLS: Record<string, {
    symbol: string;
    description_message_func: () => string;
}> = {

};

export const effectRawDisplayFormat = (effect: string) => {
    return effect.replace('_', ' ')
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export const getEffectWithLineMessage = (
    effect: string,
    line: string) => {
    if (effect in EFFECT_WITH_LINE_MESSAGES) {
        return EFFECT_WITH_LINE_MESSAGES[effect as keyof typeof EFFECT_WITH_LINE_MESSAGES]({
            line: getLineName(line),
        });
    }
    return m.mbta_alert_effect_with_line_default({
        effect: getEffect(effect),
        line: getLineName(line),
    });
}

export const getEffect = (effect: string) => {
    if (effect in EFFECT_MESSAGES) {
        return EFFECT_MESSAGES[effect as keyof typeof EFFECT_MESSAGES]();
    }
    return effectRawDisplayFormat(effect);
}

export const getLineName = (line: string, route_attributes?: any) => {
    if (line in LINE_NAMES) {
        return LINE_NAMES[line as keyof typeof LINE_NAMES];
    }
    if (/^[0-9]+$/.test(line)) {
        return m['mbta_lines_name.bus_route']({ route: line });
    }
    // TODO: fall back to use official name; ID should not be displayed in general
    if (route_attributes?.long_name) {
        return route_attributes?.long_name;
    }
    return line;
}

export const getPillName = (route_id: string, route_attributes: any) => {
    if (route_id in ROUTE_PILL_MAPPING) {
        return ROUTE_PILL_MAPPING[route_id];
    }
    return route_attributes?.short_name || route_attributes?.long_name || route_id;
}

export const getAlertBadgeSecondarySymbol = (alert: MbtaAlert, serviceDayString: string) => {
    const uniqueRoutes = alert.attributes.informed_entity
        .map((entity) => entity.route)
        .filter((route, index, arr) => route && arr.indexOf(route) === index);
    // if informed entities includes multiple lines, do not proceed and return a generic symbol
    if (uniqueRoutes.length > 1) {
        return '…';
    }

    // if informed entities includes a stop, attempt to determine direction
    if (alert.attributes.informed_entity.find((entity) => entity.stop)) {
        // red line alerts do not have branch information through route_pattern, determine branch
        if (uniqueRoutes[0] === 'Red') {
            return getAlertBadgeSecondarySymbolForRedLine(alert) + getAlertBadgeSecondarySymbolTime(alert, serviceDayString);
        }
        if (uniqueRoutes[0] === 'Blue') {
            return getAlertBadgeSecondarySymbolForBlueLine(alert) + getAlertBadgeSecondarySymbolTime(alert, serviceDayString);
        }
        if (uniqueRoutes[0].startsWith('Green')) {
            return getAlertBadgeSecondarySymbolForGreenLine(alert) + getAlertBadgeSecondarySymbolTime(alert, serviceDayString);
        }

        // detour impacting multiple stops, show detour symbol
        if (alert.attributes.informed_entity.every(entity => entity.stop) && alert.attributes.informed_entity.length > 1) {
            if (alert.attributes.effect === 'DETOUR') {
                return '🚧︎' + getAlertBadgeSecondarySymbolTime(alert, serviceDayString);
            }
        }

        if (alert.attributes.effect === 'STOP_CLOSURE') {
            return '↷' + getAlertBadgeSecondarySymbolTime(alert, serviceDayString);
        }

        // TODO: determine direction for general cases
        return '•' + getAlertBadgeSecondarySymbolTime(alert, serviceDayString);
    }

    if (alert.attributes.effect === 'DELAY') {
        return '⧗' + getAlertBadgeSecondarySymbolTime(alert, serviceDayString);
    }

    if (alert.attributes.effect === 'SHUTTLE') {
        return '🚌︎' + getAlertBadgeSecondarySymbolTime(alert, serviceDayString);
    }

    return '▣' + getAlertBadgeSecondarySymbolTime(alert, serviceDayString);
}

export const getAlertBadgeSecondarySymbolTime = (alert: MbtaAlert, serviceDayString: string) => {
    // find the time range we are currently in
    const serviceDay = parseDate(serviceDayString);

    const periodStartingAtCurrentDay = alert.attributes.active_period.filter((period => {
        const startTime = parseZonedDateTime(period.start + '[' + MBTA_TIMEZONE + ']');
        const endTime = parseZonedDateTime(period.end + '[' + MBTA_TIMEZONE + ']');
        return toCalendarDate(startTime).compare(serviceDay) == 0 && serviceDay.compare(toCalendarDate(endTime)) <= 0;
    }));
    if (periodStartingAtCurrentDay.length === 0) {
        return '';
    }
    const currentPeriodStart = new Date(periodStartingAtCurrentDay[0].start);
    if (currentPeriodStart.getHours() > 17) {
        return '🌙︎';
    }
    return '';
}

// https://api-v3.mbta.com/trips/canonical-Red-C2-0?include=stops matching place-
// order from north to south
const RED_LINE_SHARED_STOP_IDS = [
    "place-alfcl",
    "place-davis",
    "place-portr",
    "place-harsq",
    "place-cntsq",
    "place-knncl",
    "place-chmnl",
    "place-pktrm",
    "place-dwnxg",
    "place-sstat",
    "place-brdwy",
    "place-andrw",
    "place-jfk",
];

// https://api-v3.mbta.com/trips/canonical-Red-C2-0?include=stops matching place-
// order from north to south
const RED_LINE_ASHMONT_STOP_IDS = [
    "place-shmnl",
    "place-fldcr",
    "place-smmnl",
    "place-asmnl"
];

// https://api-v3.mbta.com/trips/canonical-Red-C1-0?include=stops matching place-
// order from north to south
const RED_LINE_BRAINTREE_STOP_IDS = [
    "place-nqncy",
    "place-wlsta",
    "place-qnctr",
    "place-qamnl",
    "place-brntn"
];

const getAlertBadgeSecondarySymbolForRedLine = (alert: MbtaAlert) => {
    // for now we do a simple check by checking if the alert impacts all stop on a branch rather than some
    // TODO: check stop by stop to determine range intersection
    const informedStops = alert.attributes.informed_entity.filter((entity) => entity.stop).map((entity) => entity.stop);

    const hasSharedNorthBranch = (
        RED_LINE_SHARED_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    const hasAshmontBranch = (
        RED_LINE_ASHMONT_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    const hasBraintreeBranch = (
        RED_LINE_BRAINTREE_STOP_IDS.every((stop) => informedStops.includes(stop))
    );

    if (!hasAshmontBranch && !hasBraintreeBranch && !hasSharedNorthBranch) {
        return '•'; // can't determine branch
    }
    if (hasSharedNorthBranch && !hasAshmontBranch && !hasBraintreeBranch) {
        return '▲'; // northbound branch
    }
    if (!hasSharedNorthBranch && hasAshmontBranch && !hasBraintreeBranch) {
        return '◣'; // Ashmont branch
    }
    if (!hasSharedNorthBranch && !hasAshmontBranch && hasBraintreeBranch) {
        return '◢'; // Braintree branch
    }
    if (!hasSharedNorthBranch && hasAshmontBranch && hasBraintreeBranch) {
        return '▼'; // both southbound branches
    }
    // assume all stops are affected. we could be wrong
    return '▣';
}

const getAlertBadgeSecondarySymbolForBlueLine = (alert: MbtaAlert) => {
    // single stop, Bowdoin TODO this needs to be more generalized
    if (alert.attributes.informed_entity
        .filter(entity => entity.stop && entity.stop.startsWith('place-'))
        .every(entity => entity.stop === 'place-bomnl')) {
        return '◤';
    }
    return '•';
}

const GREEN_LINE_GLX_D_SEGMENT_STOP_IDS = [
    'place-unsqu',
];
const GREEN_LINE_GLX_E_SEGMENT_STOP_IDS = [
    'place-mdftf',
    'place-balsq',
    'place-mgngl',
    'place-gilmn',
    'place-esomr'
];
const GREEN_LINE_DE_SHARED_SEGMENT_STOP_IDS = [
    'place-lech',
    'place-spmnl',
    'place-north',
    'place-haecl'
];
const GREEN_LINE_CORE_SEGMENT_STOP_IDS = [
    'place-gover',
    'place-pktrm',
    'place-boyls',
    'place-armnl',
    'place-coecl'
];

const getAlertBadgeSecondarySymbolForGreenLine = (alert: MbtaAlert) => {
    // for now we do a simple check by checking if the alert impacts all stop on a branch rather than some
    // TODO: check stop by stop to determine range intersection
    const informedStops = alert.attributes.informed_entity.filter((entity) => entity.stop).map((entity) => entity.stop);

    // single stop, Boston College TODO this needs to be more generalized
    if (informedStops.every(stop => stop === 'place-lake')) {
        return '◣';
    }

    // TODO: Green line is the most complicated one. We build as new alerts surface.
    const hasGLXDSegment = (
        GREEN_LINE_GLX_D_SEGMENT_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    const hasGLXESegment = (
        GREEN_LINE_GLX_E_SEGMENT_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    const hasDESharedSegment = (
        GREEN_LINE_DE_SHARED_SEGMENT_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    // Core = Copley to Gov Center
    const hasCoreSegment = (
        GREEN_LINE_CORE_SEGMENT_STOP_IDS.every((stop) => informedStops.includes(stop))
    );

    if (hasGLXDSegment && hasDESharedSegment && !hasCoreSegment) {
        // Green line has split branch routes on the same alert. This will show up alongside D.
        return '▲'; // north of core, D
    }
    if (hasGLXESegment && hasDESharedSegment && !hasCoreSegment) {
        // Green line has split branch routes on the same alert. This will show up alongside E.
        return '▲'; // north of core, E
    }
    if (hasGLXDSegment && !hasCoreSegment) {
        // Green line has split branch routes on the same alert. This will show up alongside D.
        return '◤'; // GLX D or charles river outage
    }
    if (hasGLXESegment && !hasCoreSegment) {
        // Green line has split branch routes on the same alert. This will show up alongside E.
        return '◤'; // GLX E or charles river outage
    }
    // can't determine branch
    return '•';
}

const alertHasAllGreenLineBranches = (alert: MbtaAlert) => {
    if (alert.attributes.informed_entity.every(entity => entity.route && entity.route.startsWith('Green'))) {
        const branches = ['B', 'C', 'D', 'E'];
        const perBranchCount = branches
            .map(branch => alert.attributes.informed_entity.filter(
                entity => entity.route && entity.route === 'Green-' + branch).length)
            .reduce((prev, curr) => prev === curr ? curr : -1);
        return (alert.attributes.informed_entity.length === perBranchCount * branches.length)
            || (alert.attributes.informed_entity.length === perBranchCount * (branches.length + 1));
    }
    return false;
}

/**
 * Merge alerts that affect all branches of a line without a specific station impact.
 * Green line and red line have inconsistent treatments even though they both have branches.
 * Green line routes have branch variants. Red line does not.
 * Ideally we should split red line routes but we need to patch routeMap as well.
 * Right now we leave them as is. Red will be a unified route. Green will be separate routes.
 */
export const isSplitBranchRouteAlert = (alert: MbtaAlert) => {
    return alertHasAllGreenLineBranches(alert);
}

export const mergeSplitBranchRouteAlerts = (alerts: MbtaAlert[]) => {
    return alerts.map(alert => {
        // Merge Green
        if (alertHasAllGreenLineBranches(alert)) {
            let new_informed_entities = alert.attributes.informed_entity
                .filter(entity => entity.route && !entity.route.startsWith('Green-'));
            if (new_informed_entities.filter(entity => entity.route === 'Green').length == 0) {
                alert.attributes.informed_entity
                    .filter(entity => entity.route === 'Green-B')
                    .map(entity => new_informed_entities.push(
                        {
                            ...entity,
                            route: 'Green',
                        }
                    ));
            }
            return {
                ...alert,
                attributes: {
                    ...alert.attributes,
                    informed_entity: new_informed_entities,
                }
            };
        }

        return alert;
    });
}