<script lang="ts">
	import { isDebug } from "$lib/common";
	import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
	import { m } from "$lib/paraglide/messages";
    import { now, toCalendarDateTime, toTime } from "@internationalized/date";
	import GlanceSubwayRoute from "./glance-subway-route.svelte";
	import { MBTA_DOWNTOWN_CORE_LAST_TRANSFER_TIME, MBTA_TIMEZONE, type MbtaAlert } from "$lib/mbta-types";
	import { getLocale } from "$lib/paraglide/runtime";
	import { alertsToRouteRenderingList, getAlertsMapByEffect } from "$lib/calendar";
	import { getEffect } from "$lib/mbta-display";
	import MbtaRouteBadgeCompound from "$lib/mbta-route-badge-compound.svelte";
    

    const { alertsToday, currentServiceDate, isCurrentServiceNightOwl, routeMap } = $props();
    const expandedAlerts: MbtaAlert[] = $derived(alertsToday);
    const commuterRailAlertsByEffects = $derived(getAlertsMapByEffect(
        expandedAlerts.filter(alert => alert.attributes.informed_entity.some(entity => entity.route_type === 2))));
    
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
    <div class="route-expanded route-expanded-first">
        {#each commuterRailAlertsByEffects as [effect, alerts]}
            <div class="effect-item">
                <div class="has-alert-text">{getEffect(effect)}</div>
                <div class="badge-groups">
                    {#each alertsToRouteRenderingList(alerts, routeMap) as route}
                        <div class="badge-group">
                            <MbtaRouteBadgeCompound routeId={route.route_id} routeAttributes={route.attributes} />
                        </div>
                    {/each}
                </div>
            </div>
        {:else}
            <div class="badge-group">
                <MbtaRouteBadge pillLabel="Commuter Rail" type="long" color="#80276c" textColor="#FFF" />
                <div class="no-alert-text">{m.noAlert()}</div>
            </div>
        {/each}
    </div>
    {#if isDebug()}
        <div class="route-expanded">
            <div class="badge-group">
                <MbtaRouteBadge pillLabel="Bus" type="long" color="#ffc72c" textColor="#000"></MbtaRouteBadge>
            </div>
        </div>
        <div class="route-expanded">
            <div class="badge-group">
                <MbtaRouteBadge pillLabel="Ferry" type="long" color="#008eaa" textColor="#FFF"></MbtaRouteBadge>
            </div>
        </div>
    {/if}
</div>

{#if isCurrentServiceNightOwl}
<p>🌙︎ <em>{m.noDowntownTransferDescription({time: new Intl.DateTimeFormat(getLocale(), {
    timeStyle: "short",
  }).format(toCalendarDateTime(now(MBTA_TIMEZONE), MBTA_DOWNTOWN_CORE_LAST_TRANSFER_TIME).toDate(MBTA_TIMEZONE))})}<a href="https://www.mbta.com/lasttrip">{m.learnMore()}</a></em></p>
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
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5em 1em;
}
.glance-rapid-transit-grid > .route-expanded-first {
    padding-top: 0.5em;
}
.glance-rapid-transit-grid > .route-expanded .effect-item {
    display: inline-flex;
    flex-direction: row;
    gap: 0.5em;
}
.glance-rapid-transit-grid > .route-expanded .effect-item .badge-groups {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
.glance-rapid-transit-grid > .route-expanded .effect-item .badge-group {    
    margin-right: 0.2em;
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

.has-alert-text {
    display: inline-block;
    font-weight: bold;
}
.no-alert-text {
    display: inline-block;
    color: #1F6DA5;
}
</style>