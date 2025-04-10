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
    <MbtaRouteBadge pillLabel={getPillName(mainRouteId, {})} type="long" color={color} textColor={textColor}></MbtaRouteBadge>
    {#if filterdAlerts.length == 0}
        <span>✅</span> <span class="no-alert-text">{m.no_alert()}</span>
    {:else if false && branchesAlerts.length}
        <span>◤</span> <span class="has-alert-text">{m[Math.random() > 0.5 ? "mbta_alert_effect.ADDITIONAL_SERVICE" : "mbta_alert_effect.DELAY"]()}</span>
    {:else if filterdAlerts.length > 1}
        <span>⚠️</span> <span class="has-alert-text">{m.multiple_alerts({count: filterdAlerts.length})}</span>
    {:else}
        <span>{getAlertBadgeSecondarySymbol(filterdAlerts[0], currentServiceDate.toString())}</span> <span class="has-alert-text">{getEffect(filterdAlerts[0].attributes.effect)}</span>
    {/if}
</div>

<style>
.subway-route {
    --badge-size: 1.2em;
    line-height: 1.2em;
    display: flex;
    flex-wrap: wrap;
    align-content: baseline;
    align-items: flex-start;
    gap: 0.2em 0.1em;
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
.badge-group {
    display: inline-flex;
    gap: 0;
}
</style>