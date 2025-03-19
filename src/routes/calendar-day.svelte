<script lang="ts">
import { getDateString, MBTA_SERVICE_START_HOUR } from "$lib/calendar";
	import { EFFECT_MESSAGES, LINE_NAMES, getEffectWithLineMessage } from "$lib/mbta-display";
import { m } from "$lib/paraglide/messages";

const { day, alerts, showNightOwl } = $props();

const currentTime = new Date();
const currentServiceDate = new Date(currentTime);
if (showNightOwl) {
    currentServiceDate.setDate(currentServiceDate.getDate() - 1);
}
</script>

{#if alerts && alerts.length > 0}
<h2>{day}{#if showNightOwl && day == getDateString(currentServiceDate)}<small>{m.until_next_day_service_ending({hour: MBTA_SERVICE_START_HOUR})}</small>{/if}</h2>
{#each alerts as alert}
    {@const effect = alert.attributes.effect as keyof typeof EFFECT_MESSAGES}
    {@const line = alert.attributes.informed_entity[0].route as keyof typeof LINE_NAMES}
    <div>{alert.id} <mark>{getEffectWithLineMessage(effect, line)}</mark> {alert.attributes.short_header}</div>
{/each}
{/if}

<style>
h2 > small {
    padding-left: 0.5em;
}
</style>