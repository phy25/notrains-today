import { m } from '$lib/paraglide/messages';

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