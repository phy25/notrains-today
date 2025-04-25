<script lang="ts">
import { getAlertBadgeSecondarySymbol, getEffect, getLineName, getPillName } from "$lib/mbta-display";
import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
import { MBTA_TIMEZONE, type MbtaAlert } from "$lib/mbta-types";
import { m } from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import { DateFormatter } from "@internationalized/date";


const { mainRouteId, color, textColor, branchRouteIds = [], unfilteredAlerts, currentServiceDate, noDowntownTransfer, lastTrainTime = undefined, isServiceEnded = false } = $props();
const filterdAlerts: MbtaAlert[] = $derived(unfilteredAlerts.filter((alert: MbtaAlert) =>
    alert.attributes.informed_entity.some(entity => entity.route === mainRouteId || branchRouteIds.includes(entity.route))
));
const branchesAlerts = $derived(filterdAlerts.filter((alert: MbtaAlert) =>
    alert.attributes.informed_entity.some(entity => branchRouteIds.includes(entity.route))
));
const lastTrainFormatted = $derived(lastTrainTime
    ? new DateFormatter(getLocale(), {timeStyle: 'short', timeZone: MBTA_TIMEZONE}).format(new Date(lastTrainTime))
    : null);
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
</script>

<div class="subway-route">
    <div class="badge-group">
        <MbtaRouteBadge pillLabel={getPillName(mainRouteId, {})} type="long" color={color} textColor={textColor} fullName={getLineName(mainRouteId)}></MbtaRouteBadge>
        {#if filterdAlerts.length == 0}
            {#if isServiceEnded}
                <span>💤︎</span>
            {:else if noDowntownTransfer}
                <span>🌙︎</span>
            {:else}
                <span>✅</span>
            {/if}
        {:else if false && branchesAlerts.length}
            <span>◤</span>
        {:else if filterdAlerts.length > 1}
            <span>⚠️</span>
        {:else}
            <span>{getAlertBadgeSecondarySymbol(filterdAlerts[0], currentServiceDate.toString())}</span>
        {/if}
    </div>

    {#if filterdAlerts.length == 0}
        {#if lastTrainFormatted}
            <div class="has-alert-text">{m.glanceLastTrainTime({time: lastTrainFormatted})}</div>
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