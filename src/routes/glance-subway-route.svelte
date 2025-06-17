<script lang="ts">
import { mergeAlertInformedEntity } from "$lib/calendar";
import { getAlertBadgeSecondarySymbol, getAlertBadgeSecondarySymbolForGreenLineGlance, getAlertBadgeSecondarySymbolTime, getEffect, getLineName, getPillName } from "$lib/mbta-display";
import MbtaRouteBadgeCompound from "$lib/mbta-route-badge-compound.svelte";
import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
import { SECONDARY_SYMBOLS } from "$lib/mbta-symbols";
import { MBTA_TIMEZONE, type MbtaAlert } from "$lib/mbta-types";
import { m } from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import { DateFormatter } from "@internationalized/date";


const { mainRouteId, color, textColor, branchRouteIds = [], unfilteredAlerts, serviceDate, currentServiceDate, noDowntownTransfer, lastTrainTime = undefined, isServiceEnded = false, isCurrentServiceNightOwl = false } = $props();
const filterdAlerts: MbtaAlert[] = $derived(mergeAlertInformedEntity(unfilteredAlerts.filter((alert: MbtaAlert) =>
    alert.attributes.informed_entity.some(entity => entity.route === mainRouteId || branchRouteIds.includes(entity.route))
)));
const branchesAlerts = $derived(filterdAlerts.filter((alert: MbtaAlert) =>
    alert.attributes.informed_entity.some(entity => branchRouteIds.includes(entity.route))
));
const lastTrainFormatted = $derived(lastTrainTime
    ? new DateFormatter(getLocale(), {timeStyle: 'short', timeZone: MBTA_TIMEZONE})
        .format(new Date(lastTrainTime)).replace(" ", "\xa0") // non-breaking space for English
    : null);
const lastTrainMessage = $derived(!isCurrentServiceNightOwl ? m.glanceFirstTrainTime : m.glanceLastTrainTime);
const alertCountsPerRoute = $derived(filterdAlerts.reduce((accumulated, current) => {
    current.attributes?.informed_entity
        ?.map(entity => entity.route)
        ?.filter(
            // get unique route
            (route, index, arr) => route && arr.indexOf(route) === index
        )
        ?.forEach(routeId => {
            if (accumulated.has(routeId)) {
                accumulated.set(routeId, accumulated.get(routeId) + 1);
            } else {
                accumulated.set(routeId, 1);
            }
        });
    return accumulated;
}, new Map()));
const branchBadgeId = $derived.by(() => {
    const routeIds = new Set(filterdAlerts.flatMap(alert => alert.attributes.informed_entity).map(entity => entity.route));
    if (routeIds.size == 1) {
        const route = routeIds.values().next().value;
        return route === mainRouteId ? null : route;
    }
    return null;
});
</script>

<div class="subway-route">
    <div class="badge-group">
        {#if branchBadgeId}
            <MbtaRouteBadgeCompound routeId={branchBadgeId} type="long" routeAttributes={{
                color: color.replace('#', ''),
                text_color: textColor.replace('#', ''),
            }}></MbtaRouteBadgeCompound>
        {:else}
            <MbtaRouteBadge pillLabel={getPillName(mainRouteId, {})} type="long" color={color} textColor={textColor} fullName={getLineName(mainRouteId)}></MbtaRouteBadge>
        {/if}
        {#if isServiceEnded}
            <span>{SECONDARY_SYMBOLS.SERVICE_ENDED.symbol}</span>
        {:else if filterdAlerts.length == 0}
            {#if noDowntownTransfer}
                <span>{SECONDARY_SYMBOLS.NIGHT.symbol}</span>
            {:else}
                <span>{SECONDARY_SYMBOLS.ALL_GOOD_COLOR.symbol}</span>
            {/if}
        {:else if false && branchesAlerts.length}
            <span>◤</span>
        {:else if filterdAlerts.length > 2}
            <span>{SECONDARY_SYMBOLS.ALERT_COLOR.symbol}</span>
        {:else}
            {#each filterdAlerts as alert}
                {#if mainRouteId === 'Green'}
                <span>{getAlertBadgeSecondarySymbolForGreenLineGlance(alert) + 
                    getAlertBadgeSecondarySymbolTime(alert, serviceDate.toString(), currentServiceDate.toString())}</span>
                {:else}
                <span>{getAlertBadgeSecondarySymbol(alert, serviceDate.toString(), currentServiceDate.toString())}</span>
                {/if}
            {/each}
        {/if}
    </div>

    {#if filterdAlerts.length == 0}
        {#if isServiceEnded && lastTrainFormatted}
            <div class="has-alert-text">{lastTrainMessage({time: lastTrainFormatted})}</div>
        {:else if lastTrainFormatted}
            <div class="no-alert-text">{lastTrainMessage({time: lastTrainFormatted})}</div>
        {:else}
            <div class="no-alert-text">{m.noAlert()}</div>
        {/if}
    {:else if false && branchesAlerts.length}
        <div class="has-alert-text"></div>
    {:else if filterdAlerts.length > 1}
        <div class="has-alert-text">{m.multipleAlerts({count: filterdAlerts.length})}</div>
    {:else}
        <div class="has-alert-text">{getEffect(filterdAlerts[0].attributes.effect)}</div>
    {/if}
</div>

<style>
.subway-route {
    --badge-size: 1.3em;
    line-height: 1.3em;
    display: flex;
    align-content: baseline;
    align-items: baseline;
    gap: 0.2em 0.2em;
}
@media (max-width: 56rem) {
    .subway-route {
        flex-direction: column;
    }
}
.badge-group > span {
    vertical-align: top;
}
.has-alert-text {
    display: inline-block;
    font-weight: bold;
}
.no-alert-text {
    display: inline-block;
    color: var(--color-accent);
}
</style>