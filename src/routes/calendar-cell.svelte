<script lang="ts">
	import { Calendar } from "bits-ui";
    import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
    import { getAlertBadgeSecondarySymbol, getPillName } from "$lib/mbta-display";

    const {date, month, alertsByDay, routeMap, currentServiceDate} = $props();
    const dateString = $derived(date.toString());
</script>

<Calendar.Cell {date} month={month.value}>
    {#snippet child({ props })}
        <td {...props} class="calendar-cell">
            <Calendar.Day
            class="rounded-9px text-foreground hover:border-foreground data-selected:bg-foreground data-disabled:text-foreground/30 data-selected:text-background data-unavailable:text-muted-foreground data-disabled:pointer-events-none data-outside-month:pointer-events-none data-selected:font-medium data-unavailable:line-through group relative inline-flex size-10 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal"
            >
                {#snippet child({ props })}
                    <div {...props} class="calendar-day">
                        <div>{date.day}</div>
                        {#if alertsByDay.has(dateString) && currentServiceDate.toString() <= dateString}
                        <div>
                            {#each alertsByDay.get(dateString) || [] as alert}
                                {@const route_id = alert.attributes.informed_entity[0].route}
                                {@const attributes = (routeMap.get(alert.attributes.informed_entity[0].route) as any)?.attributes}
                                {@const color = attributes?.color ? '#' + attributes?.color : 'inherit'}
                                {@const textColor = attributes?.text_color ? '#' + attributes?.text_color : 'inherit'}
                                {@const severityAsOpacity = 1}
                                
                                <div class="badge-group">
                                    <MbtaRouteBadge type="auto" pillLabel={getPillName(route_id, attributes)} color={color} textColor={textColor} />
                                    <span class="badge-secondary-symbol" style:color={color} style:opacity={severityAsOpacity}>
                                        {getAlertBadgeSecondarySymbol(alert, dateString)}
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