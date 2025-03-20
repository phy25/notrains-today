<script lang="ts">
import LanguagePicker from './language-picker.svelte';
import Calendar from './calendar.svelte';

import { m } from '$lib/paraglide/messages';
import type { PageProps } from './$types';
import { EFFECT_MESSAGES, getEffectWithLineMessage, getPillName } from '$lib/mbta-display';
import { getAlertsAsDays, MBTA_SERVICE_START_HOUR } from '$lib/calendar';
import { QUERY_ROUTE_TYPE_MAPPING } from '$lib/mbta-types';
import { now, toCalendarDate } from "@internationalized/date";
	import MbtaRouteBadge from '$lib/mbta-route-badge.svelte';

const { data }: PageProps = $props();
const routeMap: Map<string, any> = $derived(new Map(data.included
    .filter((entity: any) => entity.type === 'route')
    .map((route: any) => [route.id, route])));
const alertsByDay = $derived(getAlertsAsDays(data.data, routeMap));

let currentServiceTime = now('America/New_York');
if (currentServiceTime.hour < MBTA_SERVICE_START_HOUR) {
    currentServiceTime = currentServiceTime.subtract({days: 1});
}
const currentServiceDate = toCalendarDate(currentServiceTime);
const trainStatus = $derived(!alertsByDay.get(currentServiceDate.toString())?.length);
</script>

<h1>{trainStatus ? m.trains_running_all() : m.trains_running_some()}</h1>

<p>
    {#each Object.keys(QUERY_ROUTE_TYPE_MAPPING) as type}
        <a href="/?route_type={type}">{type}</a>{' '}
    {/each}
</p>

{#if data.data.length > 0}
    <Calendar alertsByDay={alertsByDay} routeMap={routeMap} />
    <hr>
    {#each data.data as alert}
        {@const effect = alert.attributes.effect as keyof typeof EFFECT_MESSAGES}
        {@const route_id = alert.attributes.informed_entity[0].route}
        {@const attributes = (routeMap.get(route_id) as any).attributes}
        {@const color = attributes?.color ? '#' + attributes?.color : 'inherit'}
        {@const textColor = attributes?.text_color ? '#' + attributes?.text_color : 'inherit'}
        <div>
            <MbtaRouteBadge type="long" pillLabel={getPillName(route_id, attributes)} color={color} textColor={textColor} />
            <mark>{getEffectWithLineMessage(effect, route_id)}</mark>
            {alert.id} {alert.attributes.short_header}
        </div>
        <pre><code>{JSON.stringify(alert)}</code></pre>
    {/each}
{/if}

<LanguagePicker />
<h2>notrains.today {m.important_notes()}</h2>
<p><em>{m.important_notes_service_day_end({hour: MBTA_SERVICE_START_HOUR - 1})}</em></p>

<style>
mark {
    background-color: #ff0;
    color: #000;
}
pre {
    white-space: pre-wrap;
    word-wrap: break-word;
}
</style>