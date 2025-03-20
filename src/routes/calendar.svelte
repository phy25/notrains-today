<script lang="ts">
import { getAlertsAsDays, MBTA_SERVICE_START_HOUR } from "$lib/calendar";
import { m } from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
import { getAlertBadgeSecondarySymbol, getPillName } from "$lib/mbta-display";
import CalendarDay from "./calendar-day.svelte";
import { Calendar } from "bits-ui";
import { now, toCalendarDate, parseDate } from "@internationalized/date";

const { alerts = [], alertsByDay: _alertsByDay = null, routeMap } = $props();
const alertsByDay = $derived(_alertsByDay || getAlertsAsDays(alerts, routeMap));

let currentServiceTime = now('America/New_York');

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
</script>

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
                  <div>{day.slice(0, 2)}</div>
                </Calendar.HeadCell>
              {/each}
            </Calendar.GridRow>
          </Calendar.GridHead>
          <Calendar.GridBody>
            {#each month.weeks as weekDates}
              <Calendar.GridRow class="flex w-full">
                {#each weekDates as date}
                  {@const dateString = date.toString()}
                  <Calendar.Cell
                    {date}
                    month={month.value}
                  >
                    {#snippet child({ props })}
                        <td {...props} class="calendar-cell">
                            <Calendar.Day
                            class="rounded-9px text-foreground hover:border-foreground data-selected:bg-foreground data-disabled:text-foreground/30 data-selected:text-background data-unavailable:text-muted-foreground data-disabled:pointer-events-none data-outside-month:pointer-events-none data-selected:font-medium data-unavailable:line-through group relative inline-flex size-10 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal"
                            >
                                {#snippet child({ props })}
                                    <div {...props} class="calendar-day">
                                        <div>{date.day}</div>
                            
                                        {#if alertsByDay.has(dateString)}
                                        <div>
                                            {#each alertsByDay.get(dateString) || [] as alert}
                                                {@const route_id = alert.attributes.informed_entity[0].route}
                                                {@const attributes = (routeMap.get(alert.attributes.informed_entity[0].route) as any).attributes}
                                                {@const color = attributes?.color ? '#' + attributes?.color : 'inherit'}
                                                {@const textColor = attributes?.text_color ? '#' + attributes?.text_color : 'inherit'}
                                                <!-- map 0 to 10 severity to 0.2 to 1 -->
                                                {@const severityAsOpacity = alert.attributes.severity / 10 * 0.8 + 0.2}
                                                
                                                <div class="badge-group">
                                                    <MbtaRouteBadge type="auto" pillLabel={getPillName(route_id, attributes)} color={color} textColor={textColor} />
                                                    <span class="badge-secondary-symbol" style:color={color} style:opacity={severityAsOpacity}>
                                                        {getAlertBadgeSecondarySymbol(alert)}
                                                    </span>
                                                </div>
                                                {' '}
                                            {/each}
                                        </div>
                                        {/if}
                                    </div>
                                {/snippet}
                            </Calendar.Day>
                        </td>
                    {/snippet}
                  </Calendar.Cell>
                {/each}
              </Calendar.GridRow>
            {/each}
          </Calendar.GridBody>
        </Calendar.Grid>
      {/each}
    </div>
  {/snippet}
</Calendar.Root>

{#if alertsByDay.get(dayString)}
    <CalendarDay alerts={alertsByDay.get(dayString)} day={dayString} showNightOwl={showNightOwl} routeMap={routeMap} />
{:else}
    <p>{m.calendar_day_no_alerts()}</p>
{/if}

<style>
.badge-group {
    display: inline-block;
}
.calendar-cell{
    max-width: 100%;
    width: 9em;
    height: 2.5em;
    /* https://stackoverflow.com/a/11275916 height essentially is min-height, as tables always stretch */
    vertical-align: top;
}
.calendar-day {
    height: 100%;
}
.calendar-day:not([data-disabled]):not([data-unavailable]){
    cursor: pointer;
}
.calendar-day[data-selected] {
    background-color: #eee;
}
.badge-secondary-symbol {
    font-family: math;
    vertical-align: middle;
}
</style>