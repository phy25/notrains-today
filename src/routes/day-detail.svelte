<script lang="ts">
import { getDateString, MBTA_SERVICE_START_HOUR } from "$lib/calendar";
import { EFFECT_MESSAGES, getEffect, getEffectWithLineMessage, getPillName } from "$lib/mbta-display";
import { MBTA_TIMEZONE, type MbtaAlert } from "$lib/mbta-types";
import { m } from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import { parseDate, DateFormatter } from "@internationalized/date";
import { fade } from "$lib/transition";
import MbtaRouteBadgeCompound from "$lib/mbta-route-badge-compound.svelte";

const { day, alerts, showNightOwl, routeMap, hideAuxiliary = false }: {
    day: string;
    alerts?: MbtaAlert[];
    showNightOwl: boolean;
    routeMap: Map<string, any>;
    hideAuxiliary?: boolean;
} = $props();

const dayObject = $derived(parseDate(day));
const dateFormatter = new DateFormatter(getLocale(), {
    weekday: "long",
    month: "short",
    day: "numeric",
});
const currentTime = new Date();
const currentServiceDate = new Date(currentTime);
if (showNightOwl) {
    currentServiceDate.setDate(currentServiceDate.getDate() - 1);
}
</script>

{#if !hideAuxiliary}
<h2>{dateFormatter.format(dayObject.toDate(MBTA_TIMEZONE))}{#if showNightOwl && day == getDateString(currentServiceDate)}<small>{m.toServiceEndingNightOwl({hour: MBTA_SERVICE_START_HOUR})}</small>{/if}</h2>
{/if}

{#each alerts || [] as alert}
    {@const effect = alert.attributes.effect as keyof typeof EFFECT_MESSAGES}
    {@const unique_routes = alert.attributes.informed_entity.map(entity => entity.route).filter((value, index, self) => self.indexOf(value) === index).sort((a, b) => a.localeCompare(b))}
    {@const descriptionArr = alert.attributes?.description?.split(/\r?\n/g) || []}
    <details transition:fade id={'alert-'+alert.id}>
        <summary>
            <!-- remove <p> to work with the marker. Temporary anyway. -->
            {#if unique_routes.length == 1}
                {@const route_id = unique_routes[0]}
                {@const attributes = (routeMap.get(route_id) as any)?.attributes}
                <span class="badge-group"><MbtaRouteBadgeCompound type="long" routeId={route_id} routeAttributes={attributes} /></span>
                <span class="alert-title">{getEffectWithLineMessage(effect, route_id, attributes)}</span>
            {:else}
                <div class="badge-groups">
                    {#each unique_routes as route_id}
                        {@const attributes = (routeMap.get(route_id) as any)?.attributes}
                        <span class="badge-group"><MbtaRouteBadgeCompound type="long" routeId={route_id} routeAttributes={attributes} /></span>
                    {/each}
                </div>
                <span class="alert-title">{getEffect(effect)}</span>
            {/if}
            <p>
                {alert.attributes.header}
            </p>
        </summary>

        {#if alert.attributes.image}
        <div class="alert-image-container">
            <img src={alert.attributes.image} alt={alert.attributes.image_alternative_text} loading="lazy" />
        </div>
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

        {#if alert.attributes?.url}
        <p><em>{m.learnMoreAt()}<a href={alert.attributes?.url} target="_blank">{alert.attributes?.url}</a> ({m.alert()} #{alert.id})</em></p>
        {:else}
        
        <p><em><a href="https://www.mbta.com/schedules/{unique_routes[0]}/alerts" target="_blank">{m.alert()} #{alert.id}</a></em></p>
        {/if}

    </details>
{:else}
{#if !hideAuxiliary}
    <p>{m.calendarDayNoAlerts()}</p>
{/if}
{/each}

<style>
h2 > small {
    padding-left: 0.5em;
}
summary {
    --badge-size: 1.3em;
}
summary .badge-groups {
    display: inline-flex;
    gap: 0.3em;
}
summary .badge-group {
    user-select: none;
}
summary .alert-title {
    font-weight: bold;
}
.alert-image-container {
    overflow-x: auto;
    max-width: 100%;
}
.alert-image-container img {
    max-width: 100%;
    max-height: 80vh;
}
/* this is based on the pixels of the image */
@media (max-width: 640px) {
    .alert-image-container img {
        max-width: 200%;
        width: 200%;
        max-height: none;
    }
}
</style>