<script lang="ts">
import LanguagePicker from './language-picker.svelte';
import Calendar from './calendar.svelte';

import { m } from '$lib/paraglide/messages';
import type { PageProps } from './$types';
import { EFFECT_MESSAGES, LINE_NAMES, getEffectWithLineMessage } from '$lib/mbta-display';
import { MBTA_SERVICE_START_HOUR } from '$lib/calendar';
import MbtaRouteBadge from '$lib/mbta-route-badge.svelte';
import { QUERY_ROUTE_TYPE_MAPPING } from '$lib/mbta-types';

const { data }: PageProps = $props();
const trainStatus = $derived(data.data.length === 0);
</script>

<h1>{trainStatus ? m.trains_running_all() : m.trains_running_some()}</h1>

<p>
    {#each Object.keys(QUERY_ROUTE_TYPE_MAPPING) as type}
        <a href="/?route_type={type}">{type}</a>{' '}
    {/each}
</p>

{#if data.data.length > 0}
    <Calendar alerts={data.data} data_included={data.included} />
    <hr>
    {#each data.data as alert}
        {@const effect = alert.attributes.effect as keyof typeof EFFECT_MESSAGES}
        {@const line = alert.attributes.informed_entity[0].route as keyof typeof LINE_NAMES}
        <div>
            <div><mark>{getEffectWithLineMessage(effect, line)}</mark></div>
            <p>{alert.attributes.short_header}</p>
            <pre><code>{JSON.stringify(alert)}</code></pre>
        </div>
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