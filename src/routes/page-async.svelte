<script lang="ts">
import { m } from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import { DateFormatter, getDayOfWeek, type CalendarDate } from '@internationalized/date';
import CalendarOneweek from "./calendar-oneweek.svelte";
import DayDetail from "./day-detail.svelte";
import DebugAllAlerts from "./debug-all-alerts.svelte";
import Glance from "./glance.svelte";
import { getProcessedAlertsAsSingleRoute, MBTA_SERVICE_START_HOUR } from "$lib/calendar";
import { MBTA_TIMEZONE, type MbtaAlert } from "$lib/mbta-types";
import CalendarLink from "./(alerts)/[[route_type=route_type]]/calendar-link.svelte";
	import { isDebug } from "$lib/common";

const { data, lastTrainData, currentServiceDate, isCurrentServiceNightOwl, routeType }: {
    data: {
        data: MbtaAlert[],
        lastUpdated: string,
        alertsByDay: Map<string, MbtaAlert[]>,
        routeMap: Map<string, any>
    },
    lastTrainData: Map<string, string>,
    currentServiceDate: CalendarDate,
    isCurrentServiceNightOwl: boolean,
    routeType: string
} = $props();

const lastUpdatedTimeStr = $derived(
    new DateFormatter(getLocale(), {timeStyle: 'short', timeZone: MBTA_TIMEZONE})
        .format(new Date(data.lastUpdated)));
const notrains_today = $derived(!!data.alertsByDay.get(currentServiceDate.toString())?.length);
const MBTA_PLACEHOLDER = '%%MBTA%%';
const notrains_today_text_array = $derived(
    (
        notrains_today ?
        m.trainsRunningSome({MBTA: MBTA_PLACEHOLDER, time: lastUpdatedTimeStr}) :
        m.trainsRunningAll({MBTA: MBTA_PLACEHOLDER, time: lastUpdatedTimeStr})
    )
    .split(MBTA_PLACEHOLDER) || []);

const alertsToday = $derived(data.alertsByDay.get(currentServiceDate.toString()));
</script>

<h1>
    {#each notrains_today_text_array as text, index}
        {#if index > 0}<a href="https://www.mbta.com/alerts">{m.mbtaAbbreviation()}</a>{/if}{text}
    {/each}
</h1>

<Glance
    alertsToday={getProcessedAlertsAsSingleRoute(alertsToday || [])}
    currentServiceDate={currentServiceDate}
    isCurrentServiceNightOwl={isCurrentServiceNightOwl}
    lastTrainData={lastTrainData}
    routeMap={data.routeMap}
    routeType={routeType}
/>

{#if isDebug()}
<CalendarLink type="calendar" alertsByDay={data.alertsByDay} routeMap={data.routeMap} {currentServiceDate} />
{/if}

<div class="day-detail">
    {#if alertsToday}
    <DayDetail
        day={currentServiceDate.toString()}
        alerts={alertsToday}
        routeMap={data.routeMap}
        hideAuxiliary={true}
        showNightOwl={isCurrentServiceNightOwl}
    />
    {:else}
    <p>{m.calendarDayNoAlerts()}</p>
    {/if}
</div>

<div class="looking-ahead">
    <h2>{m.todayLookingAhead()}</h2>
    <CalendarOneweek
        dayValue={currentServiceDate}
        minValue={currentServiceDate}
        maxValue={currentServiceDate.add({ weeks: 1 })}
        weekStartsOn={getDayOfWeek(currentServiceDate, getLocale())}
        weekdayFormat="narrow"
        alertsByDay={data.alertsByDay}
        routeMap={data.routeMap}
        currentServiceDate={currentServiceDate}
        locale={getLocale()}
        linkToCalendar={true}
        alwaysShowSecondarySymbol={true}
        />
</div>

{#if isCurrentServiceNightOwl}
<p><em>{m.importantNotesServiceDayEnd({hour: MBTA_SERVICE_START_HOUR-1})}</em></p>
{/if}

<DebugAllAlerts data={data.data} routeMap={data.routeMap}></DebugAllAlerts>

<style>
h1 {
    margin: 0.5em 0 0.7em;
    line-height: 1.2em;
    font-size: 1.1rem;
    font-weight: normal;
}

.day-detail {
    margin: 1em 0;
}
</style>