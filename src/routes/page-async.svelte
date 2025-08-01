<script lang="ts">
import { m } from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import { getDayOfWeek, type CalendarDate } from '@internationalized/date';
import CalendarOneweek from "./calendar-oneweek.svelte";
import DayDetail from "./day-detail.svelte";
import DebugAllAlerts from "./debug-all-alerts.svelte";
import Glance from "./glance.svelte";
import { getProcessedAlertsAsSingleRoute, MBTA_SERVICE_START_HOUR } from "$lib/calendar";
import { type MbtaAlert } from "$lib/mbta-types";
import CalendarLink from "./(alerts)/[[route_type=route_type]]/calendar-link.svelte";
import { invalidateAll } from "$app/navigation";
import Alert from "$lib/alert.svelte";
import { resolveRoute } from "$app/paths";
import { page } from "$app/state";
	import { SECONDARY_SYMBOLS } from "$lib/mbta-symbols";

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

const lastUpdatedDate = $derived(new Date(data.lastUpdated));

const alertsToday = $derived(data.alertsByDay.get(currentServiceDate.toString()));
const tomorrowDate = $derived(currentServiceDate.add({ days: 1 }));
const lookingAheadHas7Days = $derived.by(() => {
    let d = tomorrowDate;
    for (let i = 0; i < 7; i++) {
        if (data.alertsByDay.has(d.toString()) && data.alertsByDay.get(d.toString())?.length) {
            return true;
        }
        d = d.add({ days: 1 });
    }
    return false;
});

let isOutdated = $state(false);
let isOutdatedInvervalChecker: ReturnType<typeof setTimeout>|undefined = $state(undefined);
$effect(() => {
    data.lastUpdated;
    // when lastUpdated changes, reset isOutdated
    // which means if the page hasn't refreshed yet, do not remove isOutdated flag
    isOutdated = false;
    isOutdatedInvervalChecker = setInterval(() => {
        if (Date.now() - lastUpdatedDate.getTime() < 1000 * 60 * 5) {
            return;
        }
        isOutdated = true;
        if (isOutdatedInvervalChecker) {
            clearInterval(isOutdatedInvervalChecker);
            isOutdatedInvervalChecker = undefined;
        }
    }, 1000 * 2);
});
</script>

<Glance
    alertsToday={getProcessedAlertsAsSingleRoute(alertsToday || [])}
    serviceDate={currentServiceDate}
    currentServiceDate={currentServiceDate}
    isCurrentServiceNightOwl={isCurrentServiceNightOwl}
    lastTrainData={lastTrainData}
    routeMap={data.routeMap}
    routeType={routeType}
/>

{#if alertsToday}
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
    <p>{SECONDARY_SYMBOLS.ALL_GOOD_COLOR.symbol} {m.calendarDayNoAlerts()}</p>
    {/if}
</div>

<div class="looking-ahead">
    {#if lookingAheadHas7Days}
    <a class="title-link" href={resolveRoute('/[[route_type]]/calendar', { route_type: page.params.route_type }) + '#date=' + tomorrowDate.toString()}>
        <h2>{m.tomorrowAndBeyondOneWeek()}</h2>
        <div class="link-icon">›</div>
    </a>
    <CalendarOneweek
        dayValue={null}
        minValue={tomorrowDate}
        maxValue={tomorrowDate.add({ weeks: 1})}
        weekStartsOn={getDayOfWeek(tomorrowDate, getLocale(), 'sun')}
        weekdayFormat="narrow"
        alertsByDay={data.alertsByDay}
        routeMap={data.routeMap}
        currentServiceDate={currentServiceDate}
        locale={getLocale()}
        linkToCalendar={true}
        alwaysShowSecondarySymbol={true}
        />
    {:else if !alertsToday}
    <CalendarLink type="calendar" alertsByDay={data.alertsByDay} routeMap={data.routeMap} {currentServiceDate} />
    {/if}
</div>

{#if isCurrentServiceNightOwl}
<p><em>{m.importantNotesServiceDayEnd({hour: MBTA_SERVICE_START_HOUR-1})}</em></p>
{/if}

<DebugAllAlerts data={data.data} routeMap={data.routeMap}></DebugAllAlerts>

{#if isOutdated}
<Alert
    sticky={true}
    onclick={(event: MouseEvent) => {event.preventDefault();invalidateAll();return false;}}
    clickBtnText={m.refreshReminderButton()}>
    {m.refreshReminder()}
</Alert>
{/if}

<style>
.day-detail {
    margin: 1em 0;
}

.title-link {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    text-decoration: none;
    margin: 0 0 0.6em 0;
}

.title-link h2 {
    margin: 0;
}

.title-link .link-icon {
    font-size: 1.5em;
}
</style>