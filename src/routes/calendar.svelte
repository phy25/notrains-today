<script lang="ts">
import { getAlertsAsDays } from "$lib/calendar";
import { m } from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import DayDetail from "./day-detail.svelte";
import { Calendar } from "bits-ui";
import { endOfMonth, parseDate, type DateValue } from "@internationalized/date";
import CalendarCell from "./calendar-cell.svelte";
import CalendarOneweek from "./calendar-oneweek.svelte";

let { dayValue = $bindable(), alerts = [], alertsByDay: _alertsByDay = null, routeMap, currentServiceDate, showNightOwl } = $props();
const alertsByDay = $derived(_alertsByDay || getAlertsAsDays(alerts, routeMap));

const maxValue = $derived.by(() => {
    const fixedMaxValue = endOfMonth(currentServiceDate.add({ months: 1 }));
    const sortedDates = [...alertsByDay.keys()].sort();
    const maxAlertDate = sortedDates.length ? parseDate(sortedDates[sortedDates.length - 1]) : fixedMaxValue;
    return fixedMaxValue.compare(maxAlertDate) < 0 ? fixedMaxValue : maxAlertDate;
});

let dayString = $derived(dayValue.toString());

let mainCalendarDom: HTMLElement;
let stickyWeekDom: HTMLDivElement;
let mainCalendarEndY: number = $state(-1);
let stickyCalendarStartY: number = $state(-1);
let stickyWeekShowing = $state(false);

$effect(() => {
  dayValue; // re-run when dayValue changes
	
  if (mainCalendarDom && stickyWeekDom) { // re-run when mainCalendarDom or stickyWeekDom populate
    window.requestAnimationFrame(() => {
      onResize();      
    });
  }
});

const onResize = () => {
  if (mainCalendarDom && stickyWeekDom) {
    mainCalendarEndY = mainCalendarDom.offsetHeight + mainCalendarDom.offsetTop - stickyWeekDom.offsetHeight;

    const selectedCell = (mainCalendarDom.querySelector('[data-selected][data-bits-calendar-cell]') as HTMLElement);
    if (selectedCell) {
      stickyCalendarStartY = selectedCell?.getBoundingClientRect()?.y + window.scrollY - 1;
    } else {
      stickyCalendarStartY = mainCalendarEndY;
    }
  }

  onWindowScroll();
};

const onWindowScroll = () => {
  stickyWeekShowing = window.scrollY >= stickyCalendarStartY && stickyWeekDom.offsetHeight < window.innerHeight * 0.5;
};

export const scrollToDayDetail = () => {
  window.scrollTo({
    top: mainCalendarEndY + 2,
  });
};

const onStickyWeekValueChange = (value?: DateValue) => {
  window.requestAnimationFrame(() => {
    scrollToDayDetail();
  });
};
</script>

<svelte:window on:scroll={onWindowScroll} on:resize={onResize} />

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
      <Calendar.Header>
        {#snippet child({ props })}
        <div {...props} class="calendar-header">
          <Calendar.PrevButton>
            {#snippet child({ props })}
              <button {...props} class="calendar-header-btn">◀</button>
            {/snippet}
          </Calendar.PrevButton>
          <Calendar.Heading>
            {#snippet child({ props, headingValue })}
              <div {...props} class="calendar-heading">
                {headingValue}
              </div>
            {/snippet}
          </Calendar.Heading>
          <Calendar.NextButton>
            {#snippet child({ props })}
              <button {...props} class="calendar-header-btn">▶</button>
            {/snippet}
          </Calendar.NextButton>
        </div>
        {/snippet}
      </Calendar.Header>
      <div
        class=""
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
    weekdayFormat="short"
    alertsByDay={alertsByDay}
    routeMap={routeMap}
    currentServiceDate={currentServiceDate}
    locale={getLocale()} />
</div>

<DayDetail alerts={alertsByDay.get(dayString)} day={dayString} showNightOwl={showNightOwl} routeMap={routeMap} />

<style>
.calendar-header {
  display: flex;
  flex-direction: row;
}
.calendar-heading {
  text-align: center;
  margin: 0.5em 0;
  font-size: 1.1em;
  color: var(--color-accent);
  flex: 1;
}
.calendar-header-btn {
  appearance: none;
  background: none;
  border: solid 2px transparent;
  color: inherit;
  cursor: pointer;
  outline: none;
  padding: 0.2em 0.5em;
  border-radius: 0.25em;
  transition: background-color 0.2s ease;
  margin: 0.3em 0;

}
.calendar-header-btn:hover, .calendar-header-btn:focus {
  background: #CCC;
}
.calendar-header-btn:focus {
  border-color: #000;
}
.calendar-header-btn:disabled, .calendar-header-btn:disabled:hover {
  opacity: 0.3;
  cursor: not-allowed;
  background: none;
}
.calendar-row {
  height: 100%;
}

.calendar-sticky-week {
  visibility: hidden;
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: var(--background-color);
  box-sizing: border-box;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 8px;
}
.calendar-sticky-week.show {
  visibility: visible;
}
:global {
  .calendar-sticky-week > [data-bits-calendar-root] {
    width: 100%;
    max-width: var(--page-content-max-width);
    min-width: var(--page-content-min-width);
    margin: 0 auto;
    padding: 0 0.4em;
    box-sizing: border-box;
  }
}
</style>