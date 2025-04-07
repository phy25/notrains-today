<script lang="ts">
import LanguagePicker from './language-picker.svelte';

import { m } from '$lib/paraglide/messages';
import type { PageProps } from './$types';
import { getEffectWithLineMessage, getPillName } from '$lib/mbta-display';
import { QUERY_ROUTE_TYPE_MAPPING } from '$lib/mbta-types';
import MbtaRouteBadge from '$lib/mbta-route-badge.svelte';
import Glance from './glance.svelte';
	import DayDetail from './day-detail.svelte';

const { data }: PageProps = $props();

const notrains_today = $derived(!!data.alertsByDay.get(data.current_service_date.toString())?.length);
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

<DayDetail
    day={data.current_service_date.toString()}
    alerts={data.alertsByDay.get(data.current_service_date.toString()) || []}
    routeMap={data.routeMap}
    showNightOwl={data.is_current_service_night_owl}
></DayDetail>

{#if data.data.length > 0}    
    <details>
        <summary>All alerts for troubleshooting</summary>

        {#each data.data as alert}
            {@const effect = alert.attributes.effect}
            {@const route_id = alert.attributes.informed_entity[0].route}
            {@const attributes = (data.routeMap.get(route_id) as any)?.attributes}
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