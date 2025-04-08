<script lang="ts">
import { m } from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import { endOfWeek } from '@internationalized/date';
import CalendarOneweek from "./calendar-oneweek.svelte";
import DayDetail from "./day-detail.svelte";
import DebugAllAlerts from "./debug-all-alerts.svelte";
import Glance from "./glance.svelte";

const { data, current_service_date } = $props();

const notrains_today = $derived(!!data.alertsByDay.get(current_service_date.toString())?.length);
const MBTA_PLACEHOLDER = '%%MBTA%%';
const notrains_today_text_array = $derived((notrains_today? m.trains_running_some({MBTA: MBTA_PLACEHOLDER}) : m.trains_running_all({MBTA: MBTA_PLACEHOLDER})).split(MBTA_PLACEHOLDER) || []);

const endOfWeekDate = $derived(endOfWeek(current_service_date, getLocale()));
const lookingAheadDateValue = $derived(current_service_date.compare(endOfWeekDate) < 0 ? current_service_date : endOfWeekDate.add({ days: 1 }));

const alertsToday = data.alertsByDay.get(current_service_date.toString()) || [];
</script>

<h1>
    {#each notrains_today_text_array as text, index}
        {#if index > 0}<a href="https://www.mbta.com/alerts">{m.mbta_abbreviation()}</a>{/if}{text}
    {/each}
</h1>

<Glance alertsToday={alertsToday}></Glance>

{#if alertsToday}
<DayDetail
    day={current_service_date.toString()}
    alerts={alertsToday}
    routeMap={data.routeMap}
    showNightOwl={data.is_current_service_night_owl}
    hideAuxiliary={true}
/>
{:else}
<p>{m.calendar_day_no_alerts()}</p>
{/if}

<h2>{m.today_looking_ahead()}</h2>

<CalendarOneweek
    dayValue={lookingAheadDateValue}
    minValue={current_service_date}
    maxValue={current_service_date.add({ weeks: 1 })}
    alertsByDay={data.alertsByDay}
    routeMap={data.routeMap}
    currentServiceDate={current_service_date}
    locale={getLocale()}
    linkToCalendar={true} />

<DebugAllAlerts data={data.data} routeMap={data.routeMap}></DebugAllAlerts>

<style>
h1 {
    margin: 0.5em 0 0.7em;
    line-height: 1em;
    font-size: 1.1rem;
    font-weight: normal;
}
</style>