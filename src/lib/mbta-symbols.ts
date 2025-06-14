import { m } from '$lib/paraglide/messages';

export const SECONDARY_SYMBOLS: Record<string, {
    symbol: string;
    description_message_func: () => string;
}> = {
    ALERT_COLOR: {
        symbol: '⚠️',
        description_message_func: m['alert'],
    },
    ALL_GOOD_COLOR: {
        symbol: '✅',
        description_message_func: m['noAlert'],
    },
    MULTIPLE_ROUTES: {
        symbol: '…',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolMultipleRoutes'],
    },
    DETOUR: {
        symbol: '🚧︎',
        description_message_func: m['mbtaAlertEffectDetour'],
    },
    SHUTTLE: {
        symbol: '🚌︎',
        description_message_func: m['mbtaAlertEffectShuttle'],
    },
    DELAY: {
        symbol: '⧗',
        description_message_func: m['mbtaAlertEffectDelay'],
    },
    STOP_CLOSURE: {
        symbol: '↷',
        description_message_func: m['mbtaAlertEffectStopClosure'],
    },
    WHOLE_ROUTE: {
        symbol: '▣',
        description_message_func: m['mbtaAlertEffectWholeRoute'],
    },
    NIGHT: {
        symbol: '🌙︎',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolNight'],
    },
    SERVICE_ENDED: {
        symbol: '💤︎',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolServiceEnded'],
    },
    SOME_STOPS: {
        symbol: '•',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolSomeStops'],
    },
    OUTBOUND: {
        symbol: 'Out ',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolOutbound'],
    },
    INBOUND: {
        symbol: 'In ',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolInbound'],
    },
    RED_NORTH_OF_HARVARD: {
        symbol: '◤',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolRedNorthOfHarvard'],
    },
    RED_NORTHBOUND: {
        symbol: '▲',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolRedNorthbound'],
    },
    RED_ASHMONT_BRANCH: {
        symbol: '◣',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolRedAshmontBranch'],
    },
    RED_BRAINTREE_BRANCH: {
        symbol: '◢',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolRedBraintreeBranch'],
    },
    RED_BOTH_SOUTHBOUND_BRANCHES: {
        symbol: '▼',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolRedBothSouthboundBranches'],
    },
    ORANGE_NORTH_SHORE: {
        symbol: '◤',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolOrangeNorthShore'],
    },
    ORANGE_SOUTH: {
        symbol: '◣',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolOrangeSouth'],
    },
    ORANGE_SOUTH_AND_CORE: {
        symbol: '⇙',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolOrangeSouthAndCore'],
    },
    BLUE_BOWDOIN: {
        symbol: '◤',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolBlueBowdoin'],
    },
    BLUE_DOWNTOWN_TO_EAST_BOSTON_HARBOR: {
        symbol: '⇙',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolBlueDowntownToEastBostonHarbor'],
    },
    GREEN_BOSTON_COLLEGE: {
        symbol: '◣',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolGreenBostonCollege'],
    },
    GREEN_NORTH_OF_CORE: {
        symbol: '▲',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolGreenNorthOfCore'],
    },
    GREEN_GLX: {
        symbol: '◤',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolGreenGLX'],
    },
    GREEN_GLX_D: {
        symbol: '◤',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolGreenGLXD'],
    },
    GREEN_GLX_E: {
        symbol: '◥',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolGreenGLXE'],
    },
    CR_NORTH_INTO_BOSTON: {
        symbol: '▼',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolNorthIntoBoston'],
    },
    CR_NEWBURYPORT_INFO_BOSTON: {
        symbol: '◣',
        description_message_func: m['mbtaAlertBadgeSecondarySymbolNorthIntoBoston'],
    },
};