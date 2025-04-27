<script lang="ts">
	import { isDebug } from "$lib/common";
	import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
	import { m } from "$lib/paraglide/messages";
    import { now, toCalendarDateTime, toTime, type AnyCalendarDate } from "@internationalized/date";
	import GlanceSubwayRoute from "./glance-subway-route.svelte";
	import { MBTA_DOWNTOWN_CORE_LAST_TRANSFER_TIME, MBTA_TIMEZONE, type MbtaAlert } from "$lib/mbta-types";
	import { getLocale } from "$lib/paraglide/runtime";
	import { alertsToRouteRenderingList, getAlertsMapByEffect } from "$lib/calendar";
	import { getAlertBadgeSecondarySymbol, getEffect } from "$lib/mbta-display";
	import MbtaRouteBadgeCompound from "$lib/mbta-route-badge-compound.svelte";
    

    const { alertsToday, lastTrainData, currentServiceDate, isCurrentServiceNightOwl, routeMap, routeType }: {
        alertsToday: MbtaAlert[],
        lastTrainData: Map<string, string>,
        currentServiceDate: AnyCalendarDate,
        isCurrentServiceNightOwl: boolean,
        routeMap: Map<string, any>,
        routeType: string
    } = $props();
    const expandedAlerts: MbtaAlert[] = $derived(alertsToday);
    const nonSubwayAlertsByEffects = $derived(getAlertsMapByEffect(
        expandedAlerts.filter(alert => alert.attributes.informed_entity.some(entity => entity.route_type !== 0 && entity.route_type !== 1))));
    
    const nowTime = toTime(now(MBTA_TIMEZONE));
    const noDowntownTransfer = $derived(isCurrentServiceNightOwl && MBTA_DOWNTOWN_CORE_LAST_TRANSFER_TIME.compare(nowTime) <= 0);
    const serviceEndedData = $derived.by(() => {
        const currentDate = Date.now();
        return new Map(lastTrainData.entries().map(([route, dateString]) => {
            return [route, +new Date(dateString) <= currentDate];
        }));
    });
    const noTransferPossible = $derived(serviceEndedData.values().filter((value) => !value).toArray().length <= 1);
</script>

<div class="glance-rapid-transit-grid">
    {#if routeType === 'subway' || routeType === 'trains' }
    <div class="route-with-branches">
        <GlanceSubwayRoute mainRouteId="Green" color="#00843d" textColor="#FFF" branchRouteIds={["Green-B", "Green-C", "Green-D", "Green-E"]} unfilteredAlerts={expandedAlerts} lastTrainTime={lastTrainData.get('Green')} isServiceEnded={serviceEndedData.get('Green')} {currentServiceDate} {noDowntownTransfer} />
    </div>
    <div class="route-with-branches">
        <GlanceSubwayRoute mainRouteId="Red" color="#da291c" textColor="#FFF" branchRouteIds={["Mattapan"]} unfilteredAlerts={expandedAlerts} lastTrainTime={lastTrainData.get('Red')} isServiceEnded={serviceEndedData.get('Red')} {currentServiceDate} {noDowntownTransfer} />
    </div>
    <div class="route-with-branches">
        <GlanceSubwayRoute mainRouteId="Orange" color="#ed8b00" textColor="#FFF" unfilteredAlerts={expandedAlerts} lastTrainTime={lastTrainData.get('Orange')} isServiceEnded={serviceEndedData.get('Orange')} {currentServiceDate} {noDowntownTransfer} />
    </div>
    <div class="route-with-branches">
        <GlanceSubwayRoute mainRouteId="Blue" color="#003da5" textColor="#FFF" unfilteredAlerts={expandedAlerts} lastTrainTime={lastTrainData.get('Blue')} isServiceEnded={serviceEndedData.get('Blue')} {currentServiceDate} {noDowntownTransfer} />
    </div>
    {/if}
    {#if routeType !== 'subway' }
    <div class="route-expanded route-expanded-first">
        {#each nonSubwayAlertsByEffects as [effect, alerts]}
            <div class="effect-item">
                <div class="has-alert-text">{getEffect(effect)}</div>
                <div class="badge-groups">
                    {#each alertsToRouteRenderingList(alerts, routeMap) as route}
                        {@const thisAlerts = alerts.filter(alert => alert.attributes.informed_entity.every(entity => entity.route == route.route_id))}
                        <div class="badge-group">
                            <MbtaRouteBadgeCompound type="long" routeId={route.route_id} routeAttributes={route.attributes} />
                            {#if thisAlerts.length > 2}
                            <span class="badge-secondary-symbol" style:color={route.attributes?.color ? ('#' + route.attributes?.color) : 'inherit'}>
                                {thisAlerts.length}x
                            </span>
                            {:else if route.attributes?.type === 2}
                                {#each thisAlerts as alert}
                                <span class="badge-secondary-symbol" style:color={route.attributes?.color ? ('#' + route.attributes?.color) : 'inherit'}>
                                    {getAlertBadgeSecondarySymbol(alert, currentServiceDate.toString(), currentServiceDate.toString())}
                                </span>
                                {/each}
                            {/if}
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
    {/if}
    {#if isCurrentServiceNightOwl && !noTransferPossible}
    <div class="route-expanded"><p>
        🌙︎ {m.noDowntownTransferDescription({time: new Intl.DateTimeFormat(getLocale(), {
        timeStyle: "short",
    }).format(toCalendarDateTime(now(MBTA_TIMEZONE), MBTA_DOWNTOWN_CORE_LAST_TRANSFER_TIME).toDate(MBTA_TIMEZONE))})}<a href="https://www.mbta.com/lasttrip">{m.learnMore()}</a></p>
    </div>
    {/if}
</div>

<style>
.glance-rapid-transit-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.3em;
    width: 100%;
    max-width: var(--page-content-max-width);
    min-width: var(--page-content-min-width);
    box-sizing: border-box;
}
.glance-rapid-transit-grid > .route-expanded {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5em 1em;
}
.glance-rapid-transit-grid > .route-expanded-first {
    
}
.glance-rapid-transit-grid > .route-expanded .effect-item {
    display: inline-flex;
    flex-direction: row;
    gap: 0.5em;
}
.glance-rapid-transit-grid > .route-expanded .effect-item > .has-alert-text {
    flex: none;
}
.glance-rapid-transit-grid > .route-expanded .effect-item .badge-groups {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.2em;
}

@media (max-width: 21rem) {
    .glance-rapid-transit-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.glance-rapid-transit-grid > div {
    padding: 0.3em 0.2em;
    --badge-size: 1.3em;
    line-height: 1.3em;
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
    color: var(--color-accent);
}
.route-expanded p {
    margin: 0;
}
</style>