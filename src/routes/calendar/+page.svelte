<script lang="ts">
import LanguagePicker from '../language-picker.svelte';
import Calendar from '../calendar.svelte';

import { m } from '$lib/paraglide/messages';
import type { PageProps } from '../$types';
import { EFFECT_MESSAGES, getEffectWithLineMessage, getPillName } from '$lib/mbta-display';
import { QUERY_ROUTE_TYPE_MAPPING } from '$lib/mbta-types';
import MbtaRouteBadge from '$lib/mbta-route-badge.svelte';

const { data }: PageProps = $props();
</script>

<div class="page-content">
{#if data.data.length > 0}
    <Calendar alertsByDay={data.alertsByDay} routeMap={data.routeMap} />
    
    <details>
        <summary>All alerts for troubleshooting</summary>

        {#each data.data as alert}
            {@const effect = alert.attributes.effect as keyof typeof EFFECT_MESSAGES}
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
        <a href="?route_type={type}">{type}</a>{' '}
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

.tab-wrapper {
    background: var(--background-color);
    --background-color: #165c96;
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
    border-radius: 0.3em;
}
.tab-item:hover {
    background: var(--background-color);
    --background-color: #DDD;
    color: #000;
}
.tab-item.selected {
    background: var(--background-color);
    --background-color: #FFF;
    color: #000;
}
.tab-item-heading {
    font-weight: bold;
}
.badge-group {
    display: inline-flex;
}
</style>