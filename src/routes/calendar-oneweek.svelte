<script lang="ts">
import { Calendar } from 'bits-ui';
import CalendarCell from './calendar-cell.svelte';

let {
    dayValue = $bindable(),
    onValueChange = undefined,
    weekdayFormat = undefined,
    weekStartsOn = undefined,
    minValue,
    maxValue,
    locale,
    alertsByDay,
    currentServiceDate,
    routeMap,
    linkToCalendar = false,
    alwaysShowSecondarySymbol = false,
} = $props();
</script>

<Calendar.Root
    disableDaysOutsideMonth={false}
    weekStartsOn={weekStartsOn}
    weekdayFormat={weekdayFormat}
    type="single"
    bind:value={dayValue}
    onValueChange={onValueChange}
    minValue={minValue}
    maxValue={maxValue}
    locale={locale}
    preventDeselect={true}
>
    {#snippet children({ months, weekdays })}
        {#each months as month, i (i)}
        <Calendar.Grid class="w-full border-collapse select-none space-y-1">
            <Calendar.GridBody>
            {#each month.weeks as weekDates}
                {#if weekDates.find(day => day.compare(dayValue ? dayValue : minValue) === 0)}
                <Calendar.GridRow>
                    {#snippet child({ props })}
                    <tr {...props} class="calendar-row">
                        {#each weekDates as date, weekday_i}
                        <CalendarCell {date} {month} {alertsByDay} {currentServiceDate} {routeMap} {alwaysShowSecondarySymbol} linkToCalendar={linkToCalendar} weekday={weekdayFormat ? weekdays[weekday_i] : undefined}></CalendarCell>
                        {/each}
                    </tr>
                    {/snippet}
                </Calendar.GridRow>
                {/if}
            {/each}
            </Calendar.GridBody>
        </Calendar.Grid>
        {/each}
    {/snippet}
</Calendar.Root>

<style>
:global([data-bits-calendar-grid]) {
    table-layout: fixed;
    width: 100%;
    height: 100%;
}

.calendar-row {
    height: 100%;
}

</style>