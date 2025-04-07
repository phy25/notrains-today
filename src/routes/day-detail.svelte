<script lang="ts">
import { getDateString, MBTA_SERVICE_START_HOUR } from "$lib/calendar";
import { EFFECT_MESSAGES, getEffectWithLineMessage, getPillName } from "$lib/mbta-display";
import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
import { MBTA_TIMEZONE } from "$lib/mbta-types";
import { m } from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import { parseDate, DateFormatter } from "@internationalized/date";

const { day, alerts, showNightOwl, routeMap } = $props();

const dayObject = $derived(parseDate(day));
const dateFormatter = new DateFormatter(getLocale());
const currentTime = new Date();
const currentServiceDate = new Date(currentTime);
if (showNightOwl) {
    currentServiceDate.setDate(currentServiceDate.getDate() - 1);
}
</script>

<h2>{dateFormatter.format(dayObject.toDate(MBTA_TIMEZONE))}{#if showNightOwl && day == getDateString(currentServiceDate)}<small>{m.to_service_ending_night_owl({hour: MBTA_SERVICE_START_HOUR})}</small>{/if}</h2>
{#if alerts && alerts.length > 0}
{#each alerts as alert}
    {@const effect = alert.attributes.effect as keyof typeof EFFECT_MESSAGES}
    {@const route_id = alert.attributes.informed_entity[0].route}
    {@const attributes = (routeMap.get(route_id) as any).attributes}
    {@const color = attributes?.color ? '#' + attributes?.color : 'inherit'}
    {@const textColor = attributes?.text_color ? '#' + attributes?.text_color : 'inherit'}
    {@const descriptionArr = alert.attributes?.description?.split(/\r?\n/g) || []}
    <details>
        <summary>
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
        </summary>
        
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
    </details>
{/each}
{:else}
<p>{m.calendar_day_no_alerts()}</p>
{/if}

<style>
h2 > small {
    padding-left: 0.5em;
}
</style>