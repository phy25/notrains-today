<script lang="ts">
import { getDateString, MBTA_SERVICE_START_HOUR } from "$lib/calendar";
	import { EFFECT_MESSAGES, LINE_NAMES, getEffectWithLineMessage, getPillName } from "$lib/mbta-display";
	import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
import { m } from "$lib/paraglide/messages";

const { day, alerts, showNightOwl, routeMap } = $props();

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
    {@const route_id = alert.attributes.informed_entity[0].route}
    {@const attributes = (routeMap.get(route_id) as any).attributes}
    {@const color = attributes?.color ? '#' + attributes?.color : 'inherit'}
    {@const textColor = attributes?.text_color ? '#' + attributes?.text_color : 'inherit'}
    {@const descriptionArr = alert.attributes?.description?.split(/\r?\n/g) || []}
    <div>
        <p>
            <MbtaRouteBadge type="long" pillLabel={getPillName(route_id, attributes)} color={color} textColor={textColor} />
            <mark>{getEffectWithLineMessage(effect, route_id)}</mark>
            {alert.id}
        </p>
        <p>
            {alert.attributes.header}
        </p>
        {#if alert.attributes.image}
        <p>
            <img src={alert.attributes.image} alt={alert.attributes.image_alternative_text} style="max-width: 100%; max-height: 50vh;" />
        </p>
        {/if}
        {#if descriptionArr.length > 0}
        <p>
            {#each descriptionArr as text, index}
                {#if index > 0}
                    <br />
                {/if}
                {text}
            {/each}
        </p>
        {/if}
    </div>
{/each}
{/if}

<style>
h2 > small {
    padding-left: 0.5em;
}
</style>