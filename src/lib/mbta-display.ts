import { m } from '$lib/paraglide/messages';
import type { MbtaAlert } from './mbta-types';

export const EFFECT_MESSAGES = {
    'SHUTTLE': m['mbta_alert_effect.SHUTTLE'](),
};

export const EFFECT_WITH_LINE_MESSAGES = {
    'SHUTTLE': m['mbta_alert_effect_with_line.SHUTTLE'],
    'SERVICE_CHANGE': m['mbta_alert_effect_with_line.SERVICE_CHANGE'],
    'DELAY': m['mbta_alert_effect_with_line.DELAY'],
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
};

export const effectRawDisplayFormat = (effect: string) => {
    return effect.replace('_', ' ')
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export const getEffectWithLineMessage = (
    effect: keyof typeof EFFECT_WITH_LINE_MESSAGES,
    line: keyof typeof LINE_NAMES) => {
    if (effect in EFFECT_WITH_LINE_MESSAGES) {
        return EFFECT_WITH_LINE_MESSAGES[effect]({
            line: getLineName(line),
        });
    }
    return m.mbta_alert_effect_with_line_default({
        effect: effectRawDisplayFormat(effect),
        line: getLineName(line),
    });
}

export const getLineName = (line: keyof typeof LINE_NAMES) => {
    if (line in LINE_NAMES) {
        return LINE_NAMES[line];
    }
    if (/^[0-9]+$/.test(line)) {
        return m['mbta_lines_name.bus_route']({ route: line });
    }
    // TODO: fall back to use official name; ID should not be displayed in general
    return line;
}

export const getPillName = (route_id: string, route_attributes: any) => {
    if (route_id in ROUTE_PILL_MAPPING) {
        return ROUTE_PILL_MAPPING[route_id];
    }
    return route_attributes?.short_name || route_attributes?.long_name || route_id;
}

export const getAlertBadgeSecondarySymbol = (alert: MbtaAlert) => {
    // if informed entities includes multiple lines, do not proceed and return a generic symbol
    const uniqueRoutes = alert.attributes.informed_entity
        .map((entity) => entity.route)
        .filter((route, index, arr) => route && arr.indexOf(route) === index);

    if (uniqueRoutes.length > 1) {
        return '';
    }
    // if informed entities includes a stop, attempt to determine direction
    if (alert.attributes.informed_entity.find((entity) => entity.stop)) {
        // red line alerts do not have branch information through route_pattern, determine branch
        if (uniqueRoutes[0] === 'Red') {
            return getAlertBadgeSecondarySymbolForRedLine(alert);
        }
        // TOOD: determine direction for general cases
        return '●';
    }
    return '▣';
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