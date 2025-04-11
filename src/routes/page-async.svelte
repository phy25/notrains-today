<script lang="ts">
import { m } from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import { endOfWeek } from '@internationalized/date';
import CalendarOneweek from "./calendar-oneweek.svelte";
import DayDetail from "./day-detail.svelte";
import DebugAllAlerts from "./debug-all-alerts.svelte";
import Glance from "./glance.svelte";
import { MBTA_SERVICE_START_HOUR } from "$lib/calendar";

const { data, currentServiceDate, isCurrentServiceNightOwl } = $props();

const notrains_today = $derived(!!data.alertsByDay.get(currentServiceDate.toString())?.length);
const MBTA_PLACEHOLDER = '%%MBTA%%';
const notrains_today_text_array = $derived((notrains_today? m.trains_running_some({MBTA: MBTA_PLACEHOLDER}) : m.trains_running_all({MBTA: MBTA_PLACEHOLDER})).split(MBTA_PLACEHOLDER) || []);

const endOfWeekDate = $derived(endOfWeek(currentServiceDate, getLocale()));
const lookingAheadDateValue = $derived(currentServiceDate.compare(endOfWeekDate) < 0 ? currentServiceDate : endOfWeekDate.add({ days: 1 }));

const alertsToday = data.alertsByDay.get(currentServiceDate.toString()) || [];
</script>

<h1>
    {#each notrains_today_text_array as text, index}
        {#if index > 0}<a href="https://www.mbta.com/alerts">{m.mbta_abbreviation()}</a>{/if}{text}
    {/each}
</h1>

<Glance alertsToday={alertsToday} currentServiceDate={currentServiceDate}></Glance>

{#if alertsToday}
<DayDetail
    day={currentServiceDate.toString()}
    alerts={alertsToday}
    routeMap={data.routeMap}
    showNightOwl={isCurrentServiceNightOwl}
    hideAuxiliary={true}
/>
{:else}
<p>{m.calendar_day_no_alerts()}</p>
{/if}

<h2>{m.today_looking_ahead()}</h2>

<CalendarOneweek
    dayValue={lookingAheadDateValue}
    minValue={currentServiceDate}
    maxValue={currentServiceDate.add({ weeks: 1 })}
    weekdayFormat="short"
    alertsByDay={data.alertsByDay}
    routeMap={data.routeMap}
    currentServiceDate={currentServiceDate}
    locale={getLocale()}
    linkToCalendar={true} />

{#if isCurrentServiceNightOwl}
<p><em>{m.important_notes_service_day_end({hour: MBTA_SERVICE_START_HOUR-1})}</em></p>
{/if}

<DebugAllAlerts data={data.data} routeMap={data.routeMap}></DebugAllAlerts>

<style>
h1 {
    margin: 0.5em 0 0.7em;
    line-height: 1.2em;
    font-size: 1.1rem;
    font-weight: normal;
}
</style>