<script lang="ts">
import LanguagePicker from './language-picker.svelte';
import Calendar from './calendar.svelte';

import { m } from '$lib/paraglide/messages';
import type { PageProps } from './$types';
	import { EFFECT_MESSAGES, LINE_NAMES, EFFECT_WITH_LINE_MESSAGES, effectRawDisplayFormat, getEffectWithLineMessage } from '$lib/mbta-display';
	import { MBTA_SERVICE_START_HOUR } from '$lib/calendar';

const { data }: PageProps = $props();
const trainStatus = data.data.length === 0;
</script>

<h1>notrains.today</h1>
<p>{trainStatus ? m.trains_running_all() : m.trains_running_some()}</p>

{#if data.data.length > 0}
    {#each data.data as alert}
        {@const effect = alert.attributes.effect as keyof typeof EFFECT_MESSAGES}
        {@const line = alert.attributes.informed_entity[0].route as keyof typeof LINE_NAMES}
        <div>
            <div><mark>{getEffectWithLineMessage(effect, line)}</mark></div>
            <p>{alert.attributes.short_header}</p>
            <pre><code>{JSON.stringify(alert)}</code></pre>
        </div>
    {/each}

    <hr>
    <Calendar alerts={data.data} data_included={data.included} />
{/if}

<LanguagePicker />
<h3>{m.important_notes()}</h3>
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