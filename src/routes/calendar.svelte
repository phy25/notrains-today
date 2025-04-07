<script lang="ts">
import { getAlertsAsDays, MBTA_SERVICE_START_HOUR } from "$lib/calendar";
import { m } from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import DayDetail from "./day-detail.svelte";
import { Calendar } from "bits-ui";
import { now, toCalendarDate, parseDate, type DateValue } from "@internationalized/date";
import { MBTA_TIMEZONE } from "$lib/mbta-types";
import CalendarCell from "./calendar-cell.svelte";
	import CalendarOneweek from "./calendar-oneweek.svelte";

const { alerts = [], alertsByDay: _alertsByDay = null, routeMap } = $props();
const alertsByDay = $derived(_alertsByDay || getAlertsAsDays(alerts, routeMap));

let currentServiceTime = now(MBTA_TIMEZONE);

const showNightOwl = currentServiceTime.hour < MBTA_SERVICE_START_HOUR || currentServiceTime.hour >= 23;
if (currentServiceTime.hour < MBTA_SERVICE_START_HOUR) {
    currentServiceTime = currentServiceTime.subtract({days: 1});
}
const currentServiceDate = toCalendarDate(currentServiceTime);

const maxValue = $derived.by(() => {
    const fixedMaxValue = currentServiceDate.add({months: 2});
    const sortedDates = [...alertsByDay.keys()].sort();
    const maxAlertDate = sortedDates.length ? parseDate(sortedDates[sortedDates.length - 1]) : fixedMaxValue;
    return fixedMaxValue.compare(maxAlertDate) > 0 ? fixedMaxValue : maxAlertDate;
});

let dayValue = $state(currentServiceDate);
let dayString = $derived(dayValue.toString());

let mainCalendarDom: HTMLElement;
let stickyWeekDom: HTMLDivElement;
let mainCalendarEndY: number = -1;
let stickyWeekShowing = $state(false);
$effect(() => {
  dayValue; // re-run when dayValue changes
	if (mainCalendarDom && stickyWeekDom) {
    window.requestAnimationFrame(() => {
      mainCalendarEndY = mainCalendarDom.offsetHeight + mainCalendarDom.offsetTop - stickyWeekDom.offsetHeight;
      onWindowScroll();
    });
  }
});

const onWindowScroll = () => {
  stickyWeekShowing = window.scrollY >= mainCalendarEndY;
};

const onStickyWeekValueChange = (value?: DateValue) => {
  setTimeout(() => {
    window.scrollTo({
      top: mainCalendarEndY + 1,
    });
  }, 0);
};
</script>

<svelte:window on:scroll={onWindowScroll} />


<div bind:this={mainCalendarDom}>
  <Calendar.Root
    class="border-dark-10 bg-background-alt shadow-card mt-6 rounded-[15px] border p-[22px]"
    weekdayFormat="short"
    disableDaysOutsideMonth={false}
    type="single"
    bind:value={dayValue}
    minValue={currentServiceDate}
    maxValue={maxValue}
    locale={getLocale()}
    preventDeselect={true}
  >
    {#snippet children({ months, weekdays })}
      <Calendar.Header class="flex items-center justify-between">
        <Calendar.Heading class="text-[15px] font-medium" />
      </Calendar.Header>
      <div
        class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"
      >
        {#each months as month, i (i)}
          <Calendar.Grid class="w-full border-collapse select-none space-y-1">
            <Calendar.GridHead>
              <Calendar.GridRow class="mb-1 flex w-full justify-between">
                {#each weekdays as day}
                  <Calendar.HeadCell
                    class="text-muted-foreground font-normal! w-10 rounded-md text-xs"
                  >
                    <div>{day}</div>
                  </Calendar.HeadCell>
                {/each}
              </Calendar.GridRow>
            </Calendar.GridHead>
            <Calendar.GridBody>
              {#each month.weeks as weekDates}
                <Calendar.GridRow>
                  {#snippet child({ props })}
                    <tr {...props} class="calendar-row">
                      {#each weekDates as date}
                        <CalendarCell {date} {month} {alertsByDay} {currentServiceDate} {routeMap}></CalendarCell>
                      {/each}
                    </tr>
                  {/snippet}
                </Calendar.GridRow>
              {/each}
            </Calendar.GridBody>
          </Calendar.Grid>
        {/each}
      </div>
    {/snippet}
  </Calendar.Root>
</div>

<div class="calendar-sticky-week {stickyWeekShowing ? 'show' : ''}" bind:this={stickyWeekDom}>
  <CalendarOneweek
    bind:dayValue={dayValue}
    minValue={currentServiceDate}
    maxValue={maxValue}
    onValueChange={onStickyWeekValueChange}
    alertsByDay={alertsByDay}
    routeMap={routeMap}
    currentServiceDate={currentServiceDate}
    locale={getLocale()} />
</div>

<DayDetail alerts={alertsByDay.get(dayString)} day={dayString} showNightOwl={showNightOwl} routeMap={routeMap} />

<style>
.calendar-sticky-week {visibility: hidden; display: flex; position: fixed; top: 0; left: 0; width: 100%; padding: 0 8px; background: #fff; box-sizing: border-box;}
.calendar-sticky-week.show {visibility: visible; }
</style>