<script lang="ts">
import LanguagePicker from './language-picker.svelte';
import Calendar from './calendar.svelte';

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
const notrains_today = Math.random() > 0.5; // testing
// const notrains_today = $derived(!!alertsByDay.get(currentServiceDate.toString())?.length);
const MBTA_PLACEHOLDER = '%%MBTA%%';
const notrains_today_text_array = $derived((notrains_today ? m.trains_running_some({MBTA: MBTA_PLACEHOLDER}) : m.trains_running_all({MBTA: MBTA_PLACEHOLDER})).split(MBTA_PLACEHOLDER) || []);
</script>

<div class="tab-wrapper">
    <div class="tab">
        <div class="tab-item selected">
            <div class="tab-item-heading">notrains.today</div>
            <div>
                {#if notrains_today}
                    <div class="badge-group">
                        <MbtaRouteBadge pillLabel="RL" type="long" color="#da291c" textColor="#FFF"></MbtaRouteBadge>
                        <MbtaRouteBadge pillLabel="M" type="secondary" color="#da291c" textColor="#FFF"></MbtaRouteBadge>
                    </div>
                {:else}
                    <span>✅</span> <span class="no-alert-text">{m.no_alert()}</span>
                {/if}
            </div>
        </div>
        <div class="tab-item">
            <div class="tab-item-heading">{m.calendar()}</div>
        </div>
    </div>
</div>

<div class="page-content">
<h1>
    {#each notrains_today_text_array as text, index}
        {#if index > 0}<a href="https://www.mbta.com/">{m.mbta_abbreviation()}</a>{/if}{text}
    {/each}
    (mock)
</h1>

<Glance></Glance>

<p>
    {#each Object.keys(QUERY_ROUTE_TYPE_MAPPING) as type}
        <a href="/?route_type={type}">{type}</a>{' '}
    {/each}
</p>

{#if data.data.length > 0}
    <Calendar alertsByDay={alertsByDay} routeMap={routeMap} />
    
    <details>
        <summary>All alerts for troubleshooting</summary>

        {#each data.data as alert}
            {@const effect = alert.attributes.effect as keyof typeof EFFECT_MESSAGES}
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
    font-size: 1.5rem;
}
mark {
    background-color: #ff0;
    color: #000;
}
pre {
    white-space: pre-wrap;
    word-wrap: break-word;
}

.tab-wrapper {
    background: #165c96;
    color: #FFF;
    padding: 0.4em;
    display: flex;
    justify-content: space-around;
}
@media (max-width: 480px) {
    .tab-wrapper {
        padding: 0.4em 0.2em;
    }
}
.tab {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    border: #FFF 1px solid;
    border-radius: 0.3em;
    padding: 0.2em;
    width: 100%;
    max-width: 56em;
}
.tab-item {
    flex: 1;
    padding: 0.3em 0.6em;
    line-height: 1.4;
    cursor: pointer;
}
.tab-item:first-child {
    border-radius: 0.3em 0 0 0.3em;
}
.tab-item:last-child {
    border-radius: 0 0.3em 0.3em 0;
}
.tab-item:hover {
    background: #DDD;
    color: #000;
}
.tab-item.selected {
    background: #FFF;
    color: #000;
}
.tab-item-heading {
    font-weight: bold;
}
.badge-group {
    display: inline-flex;
}
</style>