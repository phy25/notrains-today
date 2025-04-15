<script lang="ts">
	import { isDebug } from "$lib/common";
	import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
	import { m } from "$lib/paraglide/messages";
    import { now, toCalendarDateTime, toTime } from "@internationalized/date";
	import GlanceSubwayRoute from "./glance-subway-route.svelte";
	import { MBTA_DOWNTOWN_CORE_LAST_TRANSFER_TIME, MBTA_TIMEZONE } from "$lib/mbta-types";
	import { getLocale } from "$lib/paraglide/runtime";
    

    const { alertsToday, currentServiceDate, isCurrentServiceNightOwl } = $props();
    const expandedAlerts = $derived(alertsToday);
    
    const nowTime = toTime(now(MBTA_TIMEZONE));
    const noDowntownTransfer = $derived(isCurrentServiceNightOwl && MBTA_DOWNTOWN_CORE_LAST_TRANSFER_TIME.compare(nowTime) < 0);
</script>

<div class="glance-rapid-transit-grid">
    <div class="route-with-branches">
        <GlanceSubwayRoute mainRouteId="Green" color="#00843d" textColor="#FFF" branchRouteIds={["Green-B", "Green-C", "Green-D", "Green-E"]} unfilteredAlerts={expandedAlerts} {currentServiceDate} {noDowntownTransfer} />
    </div>
    <div class="route-with-branches">
        <GlanceSubwayRoute mainRouteId="Red" color="#da291c" textColor="#FFF" branchRouteIds={["Mattapan"]} unfilteredAlerts={expandedAlerts} {currentServiceDate} {noDowntownTransfer} />
    </div>
    <div class="route-with-branches">
        <GlanceSubwayRoute mainRouteId="Orange" color="#ed8b00" textColor="#FFF" unfilteredAlerts={expandedAlerts} {currentServiceDate} {noDowntownTransfer} />
    </div>
    <div class="route-with-branches">
        <GlanceSubwayRoute mainRouteId="Blue" color="#003da5" textColor="#FFF" unfilteredAlerts={expandedAlerts} {currentServiceDate} {noDowntownTransfer} />
    </div>
    {#if isDebug()}
        <div class="route-expanded route-expanded-first">
            <MbtaRouteBadge pillLabel="Bus" type="long" color="#ffc72c" textColor="#000"></MbtaRouteBadge>
        </div>
        <div class="route-expanded">
            <MbtaRouteBadge pillLabel="Commuter Rail" type="long" color="#80276c" textColor="#FFF"></MbtaRouteBadge>
        </div>
        <div class="route-expanded">
            <MbtaRouteBadge pillLabel="Ferry" type="long" color="#008eaa" textColor="#FFF"></MbtaRouteBadge>
        </div>
    {/if}
</div>

{#if isCurrentServiceNightOwl}
<p>🌙︎ <em>{m.no_downtown_transfer_description({time: new Intl.DateTimeFormat(getLocale(), {
    timeStyle: "short",
  }).format(toCalendarDateTime(now(MBTA_TIMEZONE), MBTA_DOWNTOWN_CORE_LAST_TRANSFER_TIME).toDate(MBTA_TIMEZONE))})}<a href="https://www.mbta.com/lasttrip">{m.learn_more()}</a></em></p>
{/if}

<style>
.glance-rapid-transit-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.3em;
    width: 100%;
    max-width: var(--page-content-max-width);
    min-width: var(--page-content-min-width);
    box-sizing: border-box;
    margin: 0 0 1em;
    padding-bottom: 0.5em;
    border-bottom: 1px solid #92C6EA;
}
.glance-rapid-transit-grid > .route-expanded {
    grid-column: 1 / -1;
}
.glance-rapid-transit-grid > .route-expanded-first {
    border-top: 1px solid #92C6EA;
    padding-top: 1em;
}

@media (max-width: 19rem) {
    .glance-rapid-transit-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.glance-rapid-transit-grid > div {
    padding: 0.3em 0.2em;
    --badge-size: 1.2em;
    line-height: 1.2em;
    /* background: #E4F1FA; */ /* not interactive yet */
    border-radius: 0.2em;
    box-sizing: border-box;
}
@media (min-width: 45rem) {
    .glance-rapid-transit-grid > div {
        padding: 0.5em 0.4em;
    }
}
</style>