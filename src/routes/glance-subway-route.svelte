<script lang="ts">
	import { getPillName } from "$lib/mbta-display";
import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
import { m } from "$lib/paraglide/messages";

const { mainRouteId, color, textColor, branchRouteIds = [], unfilteredAlerts } = $props();
</script>

<div class="subway-route">
    <MbtaRouteBadge pillLabel={getPillName(mainRouteId, {})} type="long" color={color} textColor={textColor}></MbtaRouteBadge>
    <span>◤</span> <span class="has-alert-text">{m[Math.random() > 0.5 ? "mbta_alert_effect.ADDITIONAL_SERVICE" : "mbta_alert_effect.DELAY"]()}</span>
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
}
.badge-group {
    display: inline-flex;
    gap: 0;
}
</style>