<script lang="ts">
import { getAlertBadgeSecondarySymbol, getEffect, getPillName } from "$lib/mbta-display";
import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
import type { MbtaAlert } from "$lib/mbta-types";
import { m } from "$lib/paraglide/messages";

const { mainRouteId, color, textColor, branchRouteIds = [], unfilteredAlerts, currentServiceDate } = $props();
const filterdAlerts: MbtaAlert[] = $derived(unfilteredAlerts.filter((alert: MbtaAlert) =>
    alert.attributes.informed_entity.some(entity => entity.route === mainRouteId || branchRouteIds.includes(entity.route))
));
const branchesAlerts = $derived(filterdAlerts.filter((alert: MbtaAlert) =>
    alert.attributes.informed_entity.some(entity => branchRouteIds.includes(entity.route))
));
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
    <div>
        <MbtaRouteBadge pillLabel={getPillName(mainRouteId, {})} type="long" color={color} textColor={textColor}></MbtaRouteBadge>
        {#if filterdAlerts.length == 0}
            <span>✅</span>
        {:else if false && branchesAlerts.length}
            <span>◤</span>
        {:else if filterdAlerts.length > 1}
            <span>⚠️</span>
        {:else}
            <span>{getAlertBadgeSecondarySymbol(filterdAlerts[0], currentServiceDate.toString())}</span>
        {/if}
    </div>

    {#if filterdAlerts.length == 0}
        <div class="no-alert-text">{m.no_alert()}</div>
    {:else if false && branchesAlerts.length}
        <div class="has-alert-text">{m[Math.random() > 0.5 ? "mbta_alert_effect.ADDITIONAL_SERVICE" : "mbta_alert_effect.DELAY"]()}</div>
    {:else if filterdAlerts.length > 1}
        <div class="has-alert-text">{m.multiple_alerts({count: filterdAlerts.length})}</div>
    {:else}
        <div class="has-alert-text">{getEffect(filterdAlerts[0].attributes.effect)}</div>
    {/if}
</div>

<style>
.subway-route {
    --badge-size: 1.2em;
    line-height: 1.2em;
    display: flex;
    align-content: baseline;
    align-items: flex-start;
    gap: 0.2em 0.1em;
}
@media (max-width: 56rem) {
    .subway-route {
        flex-direction: column;
    }
}
.has-alert-text {
    display: inline-block;
    font-weight: bold;
}
.no-alert-text {
    display: inline-block;
    color: #1F6DA5;
}
@media (prefers-color-scheme: dark) {
    .no-alert-text {
        color: #92C6EA;
    }
}
</style>