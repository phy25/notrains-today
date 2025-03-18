<script lang="ts">
    import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import type { PageProps } from './$types';
    
    let { data }: PageProps = $props();

    let trainStatus = $state(data.data.length === 0);

    const EFFECT_MESSAGES = {
        'SHUTTLE': m['mbta_alert_effect.SHUTTLE'](),
    };

    const EFFECT_WITH_LINE_MESSAGES = {
        'SHUTTLE': m['mbta_alert_effect_with_line.SHUTTLE'],
        'SERVICE_CHANGE': m['mbta_alert_effect_with_line.SERVICE_CHANGE'],
    };

    const LINE_NAMES = {
        'Mattapan': m['mbta_lines_name.Mattapan'](),
        'Red': m['mbta_lines_name.Red'](),
        'Orange': m['mbta_lines_name.Orange'](),
        'Blue': m['mbta_lines_name.Blue'](),
        'Green': m['mbta_lines_name.Green'](),
    }

    const effectRawDisplayFormat = (effect: string) => {
        return effect.replace('_', ' ')
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
     }
</script>

<h1>notrains.today {getLocale()}</h1>
<p>{trainStatus ? m.trains_running_all() : m.trains_running_some()}</p>

{#if data.data.length > 0}
    <ul>
        {#each data.data as alert}
            {@const effect = alert.attributes.effect as keyof typeof EFFECT_MESSAGES}
            {@const line = alert.attributes.informed_entity[0].route as keyof typeof LINE_NAMES}
            <li>
                <mark>{(effect in EFFECT_WITH_LINE_MESSAGES) ? EFFECT_WITH_LINE_MESSAGES[effect]({line:
                    line in LINE_NAMES ? LINE_NAMES[line] : line
                    }) : m.mbta_alert_effect_with_line_default({
                        effect: effectRawDisplayFormat(effect),
                        line: line in LINE_NAMES ? LINE_NAMES[line] : line
                    })}</mark>
                {alert.attributes.short_header}<br>
                <code>{JSON.stringify(alert)}</code>
            </li>
        {/each}
    </ul>
{/if}