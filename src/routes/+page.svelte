<script lang="ts">
import LanguagePicker from './language-picker.svelte';

import { m } from '$lib/paraglide/messages';
import type { PageProps } from './$types';
import { EFFECT_MESSAGES, getEffectWithLineMessage, getPillName } from '$lib/mbta-display';
import { getAlertsAsDays, MBTA_SERVICE_START_HOUR } from '$lib/calendar';
import { MBTA_TIMEZONE, QUERY_ROUTE_TYPE_MAPPING } from '$lib/mbta-types';
import { now, toCalendarDate } from "@internationalized/date";
import MbtaRouteBadge from '$lib/mbta-route-badge.svelte';
import Glance from './glance.svelte';

const { data }: PageProps = $props();
const routeMap: Map<string, any> = $derived(new Map(data.included
    .filter((entity: any) => entity.type === 'route')
    .map((route: any) => [route.id, route])));
const alertsByDay = $derived(getAlertsAsDays(data.data, routeMap));

let currentServiceTime = now(MBTA_TIMEZONE);
if (currentServiceTime.hour < MBTA_SERVICE_START_HOUR) {
    currentServiceTime = currentServiceTime.subtract({days: 1});
}
const currentServiceDate = toCalendarDate(currentServiceTime);
const notrains_today = $derived(!!alertsByDay.get(currentServiceDate.toString())?.length);
const MBTA_PLACEHOLDER = '%%MBTA%%';
const notrains_today_text_array = $derived((notrains_today ? m.trains_running_some({MBTA: MBTA_PLACEHOLDER}) : m.trains_running_all({MBTA: MBTA_PLACEHOLDER})).split(MBTA_PLACEHOLDER) || []);
</script>

<div class="page-content">
<h1>
    {#each notrains_today_text_array as text, index}
        {#if index > 0}<a href="https://www.mbta.com/">{m.mbta_abbreviation()}</a>{/if}{text}
    {/each}
</h1>

<Glance></Glance>

{#if data.data.length > 0}    
    <details>
        <summary>All alerts for troubleshooting</summary>

        {#each data.data as alert}
            {@const effect = alert.attributes.effect}
            {@const route_id = alert.attributes.informed_entity[0].route}
            {@const attributes = (routeMap.get(route_id) as any)?.attributes}
            {@const color = attributes?.color ? '#' + attributes?.color : 'inherit'}
            {@const textColor = attributes?.text_color ? '#' + attributes?.text_color : 'inherit'}
            <div>
                <MbtaRouteBadge type="long" pillLabel={getPillName(route_id, attributes)} color={color} textColor={textColor} />
                <mark>{getEffectWithLineMessage(effect, route_id)}</mark>
                {alert.id} {alert.attributes.short_header}
            </div>
            <pre><code>{JSON.stringify(alert)}</code></pre>
        {/each}
    </details>
{/if}

<p>
    {#each Object.keys(QUERY_ROUTE_TYPE_MAPPING) as type}
        <a href="/?route_type={type}">{type}</a>{' '}
    {/each}
</p>

<p>☺ notrains.today <LanguagePicker /></p>
</div>

<style>
.page-content {
    margin: 0 auto;
    padding: 0 0.4em;
    width: 100%;
    max-width: 56em;
    box-sizing: border-box;
}
h1 {
    margin: 0.5em 0 0.7em;
    line-height: 1em;
    font-size: 1.1rem;
    font-weight: normal;
}
mark {
    background-color: #ff0;
    color: #000;
}
pre {
    white-space: pre-wrap;
    word-wrap: break-word;
}
</style>