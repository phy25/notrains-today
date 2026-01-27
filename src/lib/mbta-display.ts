import { m } from '$lib/paraglide/messages';
import { DateFormatter, now, parseDate, parseZonedDateTime, toCalendarDate } from "@internationalized/date";
import { MBTA_TIMEZONE, type MbtaAlert } from './mbta-types';
import { MBTA_SERVICE_START_HOUR } from './calendar';
import { SECONDARY_SYMBOLS } from './mbta-symbols';
import { getLocale } from '$lib/paraglide/runtime';

export const EFFECT_MESSAGES = {
    'CANCELLATION': m['mbtaAlertEffectCancellation'],
    'DETOUR': m['mbtaAlertEffectDetour'],
    'DELAY': m['mbtaAlertEffectDelay'],
    'DOCK_CLOSURE': m['mbtaAlertEffectDockClosure'],
    'SHUTTLE': m['mbtaAlertEffectShuttle'],
    'SUSPENSION': m['mbtaAlertEffectSuspension'],
    'STATION_CLOSURE': m['mbtaAlertEffectStationClosure'],
    'STOP_CLOSURE': m['mbtaAlertEffectStopClosure'],
    'STOP_MOVE': m['mbtaAlertEffectStopMove'],
    'STATION_ISSUE': m['mbtaAlertEffectStationIssue'],
    'SERVICE_CHANGE': m['mbtaAlertEffectServiceChange'],
    'SCHEDULE_CHANGE': m['mbtaAlertEffectScheduleChange'],
    'ADDITIONAL_SERVICE': m['mbtaAlertEffectAdditionalService'],
    'EXTRA_SERVICE': m['mbtaAlertEffectExtraService'],
    'MODIFIED_SERVICE': m['mbtaAlertEffectModifiedService'],
    'TRACK_CHANGE': m['mbtaAlertEffectTrackChange'],
    'SNOW_ROUTE': m['mbtaAlertEffectSnowRoute'],
};

export const EFFECT_WITH_LINE_MESSAGES: Record<string, (args: { line: string }) => string> = {
};

export const LINE_NAMES = {
    'Mattapan': m['mbtaLineNameMattapan'](),
    'Red': m['mbtaLineNameRed'](),
    'Orange': m['mbtaLineNameOrange'](),
    'Blue': m['mbtaLineNameBlue'](),
    'Green': m['mbtaLineNameGreen'](),
    'CR': m.routeTypeCommuterRail(),
    'Subway': m.routeTypeSubway(),
}

const ROUTE_PILL_MAPPING: Record<string, string> = {
    'Mattapan': 'M',
    'Red': 'RL',
    'Orange': 'OL',
    'Blue': 'BL',
    'Green': 'GL',
    'Subway': 'T',
    // Commuter Rail unofficial
    // https://github.com/mbta/screens/blob/6331e5c587b0ba31c6965cc1ce7dc6bb374950dc/lib/screens/v2/widget_instance/serializer/route_pill.ex#L41
    'CR-Fairmount': 'FMT',
    'CR-NewBedford': 'FRV',
    'CR-Fitchburg': 'FBG',
    'CR-Worcester': 'WOR',
    'CR-Franklin': 'FRK',
    'CR-Greenbush': 'GRB',
    'CR-Haverhill': 'HVL',
    'CR-Kingston': 'KNG',
    'CR-Lowell': 'LWL',
    'CR-Needham': 'NDM',
    'CR-Newburyport': 'NBP',
    'CR-Providence': 'PVD',
    'CR-Foxboro': 'FOX',
    'Boat-F1': 'Hingham',
    'Boat-F4': 'CHS',
    'Boat-Lynn': 'Lynn',
    'Boat-EastBoston': 'EBos',
    'Boat-F6': 'Winthrop',
    'Boat-F7': 'Quincy',
};

export const COMMUTER_RAIL_COMMON_ROUTES = [
    'CR-Fairmount',
    'CR-NewBedford',
    'CR-Fitchburg',
    'CR-Worcester',
    'CR-Franklin',
    'CR-Greenbush',
    'CR-Haverhill',
    'CR-Kingston',
    'CR-Lowell',
    'CR-Needham',
    'CR-Newburyport',
    'CR-Providence',
];

export const SUBWAY_COMMON_ROUTES = [
    'Red',
    'Mattapan',
    'Orange',
    'Blue',
    'Green-B',
    'Green-C',
    'Green-D',
    'Green-E',
];

export const getFormattedTime = (timeString: string) => {
    const date = new Date(timeString);
    return new DateFormatter(getLocale(), { timeStyle: 'short', timeZone: MBTA_TIMEZONE }).format(date);
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
    line: string,
    line_attributes?: any) => {
    if (effect in EFFECT_WITH_LINE_MESSAGES) {
        return EFFECT_WITH_LINE_MESSAGES[effect as keyof typeof EFFECT_WITH_LINE_MESSAGES]({
            line: getLineName(line, line_attributes),
        });
    }
    return m.mbtaAlertEffectWithLineDefault({
        effect: getEffect(effect),
        line: getLineName(line, line_attributes),
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
    if (route_attributes?.route_type === 3) {
        return m['mbtaLineNameBusRoute']({ route: route_attributes?.short_name || line });
    }
    // TODO: fall back to use official name; ID should not be displayed in general
    if (route_attributes?.short_name) {
        return route_attributes?.short_name;
    }
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

export const getAlertBadgeSecondarySymbol = (alert: MbtaAlert, serviceDayString: string, currentServiceDayString?: string) => {
    const uniqueRoutes = alert.attributes.informed_entity
        .map((entity) => entity.route)
        .filter((route, index, arr) => route && arr.indexOf(route) === index);
    // if informed entities includes multiple lines, do not proceed and return a generic symbol
    if (uniqueRoutes.length > 1) {
        return SECONDARY_SYMBOLS.MULTIPLE_ROUTES.symbol;
    }
    return getAlertBadgeSecondarySymbolWithoutTime(alert, uniqueRoutes)
         + getAlertBadgeSecondarySymbolTime(alert, serviceDayString, currentServiceDayString);
}

const getAlertBadgeSecondarySymbolWithoutTime = (alert: MbtaAlert, uniqueRoutes: string[]) => {
    // if informed entities includes a stop, attempt to determine direction
    if (alert.attributes.informed_entity.find((entity) => entity.stop)) {
        // red line alerts do not have branch information through route_pattern, determine branch
        if (uniqueRoutes[0] === 'Red') {
            return getAlertBadgeSecondarySymbolForRedLine(alert);
        }
        if (uniqueRoutes[0] === 'Orange') {
            return getAlertBadgeSecondarySymbolForOrangeLine(alert);
        }
        if (uniqueRoutes[0] === 'Blue') {
            return getAlertBadgeSecondarySymbolForBlueLine(alert);
        }
        if (uniqueRoutes[0].startsWith('Green')) {
            return getAlertBadgeSecondarySymbolForGreenLine(alert);
        }
        if (uniqueRoutes[0].startsWith('CR-')) {
            return getAlertBadgeSecondarySymbolForCommuterRail(alert);
        }

        // detour impacting multiple stops, show detour symbol
        if (alert.attributes.informed_entity.every(entity => entity.stop) && alert.attributes.informed_entity.length > 1) {
            if (alert.attributes.effect === 'DETOUR') {
                return SECONDARY_SYMBOLS.DETOUR.symbol;
            }
        }

        if (alert.attributes.effect === 'STOP_CLOSURE') {
            return SECONDARY_SYMBOLS.STOP_CLOSURE.symbol;
        }

        // TODO: determine direction for general cases
        return SECONDARY_SYMBOLS.SOME_STOPS.symbol;
    }
    if (uniqueRoutes.length == 1 && uniqueRoutes[0] === 'Red') {
        // try detecting branch for red line even without stop information
        return getAlertBadgeSecondarySymbolForRedLine(alert);
    }
    if (uniqueRoutes[0].startsWith('CR-') && alert.attributes.informed_entity.every(entity => entity.trip)) {
        // if it impacts a trip, show inbound/outbound symbol
        return getAlertBadgeSecondarySymbolForCommuterRail(alert);
    }

    const effectSymbol = getAlertBadgeSecondarySymbolForEffect(alert);
    if (effectSymbol) {
        return effectSymbol;
    }

    return SECONDARY_SYMBOLS.WHOLE_ROUTE.symbol;
}

const getAlertBadgeSecondarySymbolForEffect = (alert: MbtaAlert) => {
    if (alert.attributes.effect === 'DELAY') {
        return SECONDARY_SYMBOLS.DELAY.symbol;
    }

    if (alert.attributes.effect === 'SHUTTLE') {
        return SECONDARY_SYMBOLS.SHUTTLE.symbol;
    }

    return null;
}

export const getAlertBadgeSecondarySymbolTime = (alert: MbtaAlert, serviceDayString: string, currentServiceDayString?: string) => {
    // find the time range we are currently in
    const serviceDay = parseDate(serviceDayString);

    const periodStartingAtCurrentDay = alert.attributes.active_period.map((period => {
        const startTime = parseZonedDateTime(period.start + '[' + MBTA_TIMEZONE + ']');
        const endTime = parseZonedDateTime((period.end || period.start) + '[' + MBTA_TIMEZONE + ']');
        if (toCalendarDate(startTime).compare(serviceDay) == 0 && serviceDay.compare(toCalendarDate(endTime)) <= 0) {
            // this check does not respect after midnight cases yet
            return {
                start: startTime,
                end: endTime,
            };
        } else {
            return null;
        }
    })).filter(period => period !== null);
    if (periodStartingAtCurrentDay.length === 0) {
        return '';
    }
    // show night symbol if the alert starts at night
    // - if it is for today, we should be outside active period
    // - if it is not for today, always show night symbol
    const currentPeriodIsAtNight = periodStartingAtCurrentDay[0].start.hour > 17 || periodStartingAtCurrentDay[0].start.hour < MBTA_SERVICE_START_HOUR;
    const currentPeriodIsThisServiceDay = serviceDayString === currentServiceDayString;
    const currentTime = now(MBTA_TIMEZONE);
    const currentPeriodNotStarted = currentTime.compare(periodStartingAtCurrentDay[0].start) <= 0;
    if (currentPeriodIsAtNight && (!currentPeriodIsThisServiceDay || currentPeriodNotStarted)) {
        return SECONDARY_SYMBOLS.NIGHT.symbol;
    }
    return '';
}

// https://api-v3.mbta.com/trips/canonical-Red-C2-0?include=stops matching place-
// order from north to south
const RED_LINE_NORTH_STOP_IDS = [
    "place-alfcl",
    "place-davis",
    "place-portr",
    "place-harsq",
];
const RED_LINE_SHARED_STOP_IDS = [
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

const RED_LINE_ALERT_KEYWORD_BRANCH_PREFIX = "red line ";
const RED_LINE_ALERT_KEYWORD_ASHMONT = "ashmont branch";
const RED_LINE_ALERT_KEYWORD_BRAINTREE = "braintree branch";

const getAlertBadgeSecondarySymbolForRedLine = (alert: MbtaAlert) => {
    // for now we do a simple check by checking if the alert impacts all stop on a branch rather than some
    // TODO: check stop by stop to determine range intersection
    const informedStops = alert.attributes.informed_entity
        .filter((entity) => entity.stop && entity.stop.startsWith('place-'))
        .map((entity) => entity.stop);

    const hasSharedHarvardNorthBranch = (
        RED_LINE_NORTH_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    const hasSharedBranch = (
        RED_LINE_SHARED_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    const hasAshmontBranch = (
        RED_LINE_ASHMONT_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    const hasBraintreeBranch = (
        RED_LINE_BRAINTREE_STOP_IDS.every((stop) => informedStops.includes(stop))
    );

    if (hasSharedHarvardNorthBranch && !hasSharedBranch && !hasAshmontBranch && !hasBraintreeBranch) {
        return SECONDARY_SYMBOLS.RED_NORTH_OF_HARVARD.symbol; // northbound branch, north of Harvard
    }
    if (hasSharedHarvardNorthBranch && hasSharedBranch && !hasAshmontBranch && !hasBraintreeBranch) {
        return SECONDARY_SYMBOLS.RED_NORTHBOUND.symbol; // northbound branch
    }
    if (!hasSharedHarvardNorthBranch && !hasSharedBranch && hasAshmontBranch && !hasBraintreeBranch) {
        return SECONDARY_SYMBOLS.RED_ASHMONT_BRANCH.symbol; // Ashmont branch
    }
    if (!hasSharedHarvardNorthBranch && !hasSharedBranch && !hasAshmontBranch && hasBraintreeBranch) {
        return SECONDARY_SYMBOLS.RED_BRAINTREE_BRANCH.symbol; // Braintree branch
    }
    if (!hasSharedHarvardNorthBranch && !hasSharedBranch && hasAshmontBranch && hasBraintreeBranch) {
        return SECONDARY_SYMBOLS.RED_BOTH_SOUTHBOUND_BRANCHES.symbol; // both southbound branches
    }
    // check shared branch
    if (!hasAshmontBranch && !hasBraintreeBranch && informedStops.length) {
        if (informedStops.every((stop) => RED_LINE_SHARED_STOP_IDS.includes(stop))) {
            return SECONDARY_SYMBOLS.RED_CORE.symbol; // red core
        }
    }

    const header = (alert?.attributes?.header || '').toLowerCase();

    if (header.includes(RED_LINE_ALERT_KEYWORD_BRANCH_PREFIX + RED_LINE_ALERT_KEYWORD_ASHMONT)
        && !header.includes(RED_LINE_ALERT_KEYWORD_BRAINTREE)) {
        return SECONDARY_SYMBOLS.RED_ASHMONT_BRANCH.symbol; // Ashmont branch
    }
    if (header.includes(RED_LINE_ALERT_KEYWORD_BRANCH_PREFIX + RED_LINE_ALERT_KEYWORD_BRAINTREE)
        && !header.includes(RED_LINE_ALERT_KEYWORD_ASHMONT)) {
        return SECONDARY_SYMBOLS.RED_BRAINTREE_BRANCH.symbol; // Braintree branch
    }

    // assume all stops are affected. we could be wrong
    return SECONDARY_SYMBOLS.WHOLE_ROUTE.symbol;
}

// north of north station, north to south
const ORANGE_LINE_NORTH_STOP_IDS = [
    'place-ogmnl',
    'place-mlmnl',
    'place-welln',
    'place-astao',
    'place-sull',
    'place-ccmnl',
    'place-north',
];

const ORANGE_LINE_CORE_STOP_IDS = [
    'place-haecl',
    'place-state',
    'place-dwnxg',
    'place-chncl',
    'place-tumnl',
    'place-bbsta',
];

const ORANGE_LINE_SOUTH_STOP_IDS = [
    'place-masta',
    'place-rugg',
    'place-rcmnl',
    'place-jaksn',
    'place-sbmnl',
    'place-grnst',
    'place-forhl',
];

const getAlertBadgeSecondarySymbolForOrangeLine = (alert: MbtaAlert) => {
    // I am too lazy to build out everything for now
    // TODO: check stop by stop to determine range intersection
    const informedStops = alert.attributes.informed_entity
        .filter((entity) => entity.stop && entity.stop.startsWith('place-'))
        .map((entity) => entity.stop);

    const hasNorthSegment = (
        ORANGE_LINE_NORTH_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    const hasCoreSegment = (
        ORANGE_LINE_CORE_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    const hasSouthSegment = (
        ORANGE_LINE_SOUTH_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    if (hasNorthSegment && !hasCoreSegment && !hasSouthSegment) {
        return SECONDARY_SYMBOLS.ORANGE_NORTH_SHORE.symbol; // north of north station
    }
    if (!hasNorthSegment && !hasCoreSegment && hasSouthSegment) {
        return SECONDARY_SYMBOLS.ORANGE_SOUTH.symbol; // south branch
    }
    if (!hasNorthSegment && hasCoreSegment && hasSouthSegment) {
        return SECONDARY_SYMBOLS.ORANGE_SOUTH_AND_CORE.symbol; // south and core segments
    }
    // Alert # 651168, this peculiar service pattern :shrug: between Wellington and Back Bay
    if (!hasNorthSegment && hasCoreSegment && !hasSouthSegment) {
        // check if the rest of the informed stops are in north
        let remainingStops = informedStops.filter((stop) => !ORANGE_LINE_CORE_STOP_IDS.includes(stop));
        if (remainingStops.length && remainingStops.every((stop) => ORANGE_LINE_NORTH_STOP_IDS.includes(stop))) {
            return SECONDARY_SYMBOLS.ORANGE_NORTH_AND_CORE.symbol; // north and core segments
        }
    }

    return SECONDARY_SYMBOLS.SOME_STOPS.symbol;
}

const BLUE_LINE_DOWNTOWN_STOP_IDS = [
    'place-bomnl',
    'place-gover',
    'place-state',
    'place-aqucl',
];

const BLUE_LINE_EAST_BOSTON_SHORE_STOP_IDS = [
    'place-mvbcl',
    'place-aport',
];

const BLUE_LINE_CARHOUSE_OUTBOUND_STOP_IDS = [
    'place-sdmnl',
    'place-bmmnl',
    'place-rbmnl',
    'place-wondl',
];

const getAlertBadgeSecondarySymbolForBlueLine = (alert: MbtaAlert) => {
    // single stop, Bowdoin TODO this needs to be more generalized
    if (alert.attributes.informed_entity
        .filter(entity => entity.stop && entity.stop.startsWith('place-'))
        .every(entity => entity.stop === 'place-bomnl')) {
        return SECONDARY_SYMBOLS.BLUE_BOWDOIN.symbol;
    }

    const informedStops = alert.attributes.informed_entity.filter((entity) => entity.stop).map((entity) => entity.stop);

    const hasDowntownSegments = (
        BLUE_LINE_DOWNTOWN_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    const hasEastBostonShoreSegments = (
        BLUE_LINE_EAST_BOSTON_SHORE_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    const hasCarhouseOutboundSegments = (
        BLUE_LINE_CARHOUSE_OUTBOUND_STOP_IDS.every((stop) => informedStops.includes(stop))
    );
    if (hasDowntownSegments && hasEastBostonShoreSegments && !hasCarhouseOutboundSegments) {
        return SECONDARY_SYMBOLS.BLUE_DOWNTOWN_TO_EAST_BOSTON_HARBOR.symbol; // downtown to east boston shore (mid-route)
    }
    return SECONDARY_SYMBOLS.SOME_STOPS.symbol;
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

/**
 * We assume this symbol always show up alongside a branch, rather than a single Green.
 * 
 * @param alert Green line alert
 * @returns symbol
 */
export const getAlertBadgeSecondarySymbolForGreenLine = (alert: MbtaAlert) => {
    // for now we do a simple check by checking if the alert impacts all stop on a branch rather than some
    // TODO: check stop by stop to determine range intersection
    const informedStops = alert.attributes.informed_entity
        .filter((entity) => entity.stop && entity.stop.startsWith('place-'))
        .map((entity) => entity.stop);

    // single stop, Boston College TODO this needs to be more generalized
    if (informedStops.length && informedStops.every(stop => stop === 'place-lake')) {
        return SECONDARY_SYMBOLS.GREEN_BOSTON_COLLEGE.symbol;
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
        return SECONDARY_SYMBOLS.GREEN_NORTH_OF_CORE.symbol; // north of core, D
    }
    if (hasGLXESegment && hasDESharedSegment && !hasCoreSegment) {
        // Green line has split branch routes on the same alert. This will show up alongside E.
        return SECONDARY_SYMBOLS.GREEN_NORTH_OF_CORE.symbol; // north of core, E
    }
    if (hasGLXDSegment && !hasCoreSegment) {
        // Green line has split branch routes on the same alert. This will show up alongside D.
        return SECONDARY_SYMBOLS.GREEN_GLX.symbol; // GLX D or charles river outage
    }
    if (hasGLXESegment && !hasCoreSegment) {
        // Green line has split branch routes on the same alert. This will show up alongside E.
        return SECONDARY_SYMBOLS.GREEN_GLX.symbol; // GLX E or charles river outage
    }
    // if we only get hits in core, show core symbol
    if (informedStops.length && informedStops.every((stop) => GREEN_LINE_CORE_SEGMENT_STOP_IDS.includes(stop))) {
        return SECONDARY_SYMBOLS.GREEN_CORE.symbol; // core segment
    }
    // can't determine branch
    return SECONDARY_SYMBOLS.SOME_STOPS.symbol;
}

/**
 * Used for Glance where we show all branches of Green line as a single route.
 * @param alert 
 */
export const getAlertBadgeSecondarySymbolForGreenLineGlance = (alert: MbtaAlert) => {
    const effectSymbol = getAlertBadgeSecondarySymbolForEffect(alert);
    // if informed entities includes a stop, attempt to determine direction
    if (alert.attributes.informed_entity.find((entity) => entity.stop)) {
        const informedStops = alert.attributes.informed_entity
            .filter((entity) => entity.stop && entity.stop.startsWith('place-'))
            .map((entity) => entity.stop);

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

        if (hasGLXDSegment && hasGLXESegment && hasDESharedSegment && !hasCoreSegment) {
            return SECONDARY_SYMBOLS.GREEN_NORTH_OF_CORE.symbol; // north of core, D+E
        }
        if (hasGLXDSegment && !hasGLXESegment && !hasDESharedSegment && !hasCoreSegment) {
            return SECONDARY_SYMBOLS.GREEN_GLX_D.symbol; // D only
        }
        if (hasGLXESegment && !hasGLXDSegment && !hasDESharedSegment && !hasCoreSegment) {
            // Green line has split branch routes on the same alert. This will show up alongside E.
            return SECONDARY_SYMBOLS.GREEN_GLX_E.symbol; // E only
        }
        // if we only get hits in core, show core symbol
        if (informedStops.length && informedStops.every((stop) => GREEN_LINE_CORE_SEGMENT_STOP_IDS.includes(stop))) {
            return SECONDARY_SYMBOLS.GREEN_CORE.symbol; // core segment
        }
        // TODO: charles river outage 🦆

        if (effectSymbol) {
            return effectSymbol;
        }
        return SECONDARY_SYMBOLS.ALERT_COLOR.symbol;
    }
    
    if (effectSymbol) {
        return effectSymbol;
    }
    return SECONDARY_SYMBOLS.WHOLE_ROUTE.symbol;
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

const HAVENHILL_SOUTH_PARENT_STOP_IDS = [
    'place-north',
    'place-mlmnl',
    'place-ogmnl',
];

const LOWELL_SOUTH_PARENT_STOP_IDS = [
    'place-north',
    'place-NHRML-0055',
    'place-NHRML-0073',
    'place-NHRML-0078',
    'place-NHRML-0127',
];

const NEWBURYPORT_SOUTH_PARENT_STOP_IDS = [
    'place-north',
    'place-chels',
    'place-ER-0099',
    'place-ER-0117',
    'place-ER-0128',
];

const WORCESTER_EAST_TO_FRAMINGHAM_PARENT_STOP_IDS = [
    'place-sstat',
    'place-bbsta',
    'place-WML-0025',
    'place-WML-0035',
    'place-WML-0081',
    'place-WML-0091',
    'place-WML-0102',
    'place-WML-0125',
    'place-WML-0135',
    'place-WML-0147',
    'place-WML-0177',
    'place-WML-0199',
    'place-WML-0214',
];

const getAlertBadgeSecondarySymbolForCommuterRail = (alert: MbtaAlert) => {
    // if it impacts a trip, show inbound/outbound symbol
    if (alert.attributes.informed_entity.every(entity => entity.trip)) {
        // Fallback if we don't have direction symbols
        // currently all CR trips put outbound at 0
        if (alert.attributes.informed_entity.every(entity => entity.trip && entity.direction_id === 0)) {
            return SECONDARY_SYMBOLS.OUTBOUND.symbol; // outbound
        }
        if (alert.attributes.informed_entity.every(entity => entity.trip && entity.direction_id === 1)) {
            return SECONDARY_SYMBOLS.INBOUND.symbol; // inbound
        }
    }
    // for now we do a simple check by checking if the alert impacts all stop on a branch rather than some
    // TODO: check stop by stop to determine range intersection
    const informedStops = alert.attributes.informed_entity.filter((entity) => entity.stop).map((entity) => entity.stop);

    const hasHavenhillSouthSegment = (
        HAVENHILL_SOUTH_PARENT_STOP_IDS.every((stop) => informedStops.includes(stop))
    );

    const hasLowellSouthSegment = (
        LOWELL_SOUTH_PARENT_STOP_IDS.every((stop) => informedStops.includes(stop))
    );

    const hasNewburyportSouthSegment = (
        NEWBURYPORT_SOUTH_PARENT_STOP_IDS.every((stop) => informedStops.includes(stop))
    );

    const hasWorcesterEastToFraminghamSegment = (
        WORCESTER_EAST_TO_FRAMINGHAM_PARENT_STOP_IDS.every((stop) => informedStops.includes(stop))
    );

    if (hasHavenhillSouthSegment || hasLowellSouthSegment) {
        return SECONDARY_SYMBOLS.CR_NORTH_INTO_BOSTON.symbol;
    }

    if (hasNewburyportSouthSegment) {
        return SECONDARY_SYMBOLS.CR_NEWBURYPORT_INFO_BOSTON.symbol;
    }

    if (hasWorcesterEastToFraminghamSegment) {
        return SECONDARY_SYMBOLS.CR_WORCESTER_EAST_FROM_FRAMINGHAM.symbol;
    }

    // can't determine branch
    return SECONDARY_SYMBOLS.SOME_STOPS.symbol;
}

export const mergeUniqueRoutesForDisplay = (routes: string[]) => {
    if (routes.length == SUBWAY_COMMON_ROUTES.length) {
        if (routes.every(route => SUBWAY_COMMON_ROUTES.includes(route))) {
            // if all routes are common subway routes, return a single route
            return ['Subway'];
        }
    }
    return routes;
}