<script lang="ts">
import { getAlertsAsDays, MBTA_SERVICE_START_HOUR } from "$lib/calendar";

const { alerts, data_included } = $props();
const alertsByDay = $derived(getAlertsAsDays(alerts));
const currentTime = new Date();
const showNightOwl = currentTime.getHours() < MBTA_SERVICE_START_HOUR || currentTime.getHours() >= 23;

const routeMap = $derived(new Map(data_included
    .filter((entity: any) => entity.type === 'route')
    .map((route: any) => [route.id, route])));

import { Calendar } from "bits-ui";
import { getLocalTimeZone, today } from "@internationalized/date";
	import CalendarDay from "./calendar-day.svelte";
	import { m } from "$lib/paraglide/messages";
	import { getLocale } from "$lib/paraglide/runtime";

let dayValue = $state(today(getLocalTimeZone()));
let dayString = $derived(dayValue.toString())
</script>

<Calendar.Root
  class="border-dark-10 bg-background-alt shadow-card mt-6 rounded-[15px] border p-[22px]"
  weekdayFormat="short"
  disableDaysOutsideMonth={false}
  type="single"
  bind:value={dayValue}
  locale={getLocale()}
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
                                                {@const color = (routeMap.get(alert.attributes.informed_entity[0].route) as any).attributes?.color}
                                                <span style="color: {color ? '#' + color : 'inherit'}">⬤</span>
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
    <CalendarDay alerts={alertsByDay.get(dayString)} day={dayString} showNightOwl={showNightOwl} />
{:else}
    <p>{m.calendar_day_no_alerts()}</p>
{/if}

<style>
.calendar-cell{
    max-width: 100%;
    width: 10em;
}
.calendar-day:not([data-disabled]):not([data-unavailable]){
    cursor: pointer;
}
.calendar-day[data-selected] {
    border: 1px solid #000;
}
</style>