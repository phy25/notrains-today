<script lang="ts">
import { Calendar } from 'bits-ui';
import CalendarCell from './calendar-cell.svelte';

let { dayValue = $bindable(), onValueChange = undefined, minValue, maxValue, locale, alertsByDay, currentServiceDate, routeMap } = $props();
</script>

<Calendar.Root
    disableDaysOutsideMonth={false}
    type="single"
    bind:value={dayValue}
    onValueChange={onValueChange}
    minValue={minValue}
    maxValue={maxValue}
    locale={locale}
    preventDeselect={true}
>
    {#snippet children({ months, weekdays })}
    <div
        class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"
    >
        {#each months as month, i (i)}
        <Calendar.Grid class="w-full border-collapse select-none space-y-1">
            <Calendar.GridBody>
            {#each month.weeks as weekDates}
                {#if weekDates.find(day => day.compare(dayValue) === 0)}
                <Calendar.GridRow>
                    {#snippet child({ props })}
                    <tr {...props} class="calendar-row">
                        {#each weekDates as date}
                        <CalendarCell {date} {month} {alertsByDay} {currentServiceDate} {routeMap}></CalendarCell>
                        {/each}
                    </tr>
                    {/snippet}
                </Calendar.GridRow>
                {/if}
            {/each}
            </Calendar.GridBody>
        </Calendar.Grid>
        {/each}
    </div>
    {/snippet}
</Calendar.Root>

<style>
:global([data-bits-calendar-grid]) {table-layout: fixed; width: 100%;}
</style>