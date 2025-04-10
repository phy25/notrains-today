<script lang="ts">
	import { Calendar } from "bits-ui";
    import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
    import { getAlertBadgeSecondarySymbol, getPillName } from "$lib/mbta-display";
	import type { MbtaAlert } from "$lib/mbta-types";
    import type { DateValue } from "@internationalized/date";
	import { expandAlertsToSingleRoute } from "$lib/calendar";

    interface CalendarCellProps {
        date: DateValue;
        month: any;
        alertsByDay: Map<string, MbtaAlert[]>;
        routeMap: Map<string, any>;
        currentServiceDate: DateValue;
        linkToCalendar?: boolean;
    };

    const {date, month, alertsByDay, routeMap, currentServiceDate, linkToCalendar = false}: CalendarCellProps = $props();
    const dateString = $derived(date.toString());
    const alerts: MbtaAlert[] = $derived.by(() => {
        if (alertsByDay.has(dateString) && currentServiceDate.toString() <= dateString) {
            return expandAlertsToSingleRoute(alertsByDay.get(dateString) || []);
        } else {
            return [];
        }
    });
    // TODO: we should not split routes upstream in the first place
    const alertsPrioritizedDedupeRoutes: MbtaAlert[] = $derived.by(() => {
        const appearedRoutes: Set<string> = new Set();
        return alerts.filter(alert => {
            const routeId = alert.attributes.informed_entity[0].route;
            if (appearedRoutes.has(routeId)) {
                return false;
            } else {
                appearedRoutes.add(routeId);
                return true;
            }
        });
    });
    const routeAlertsCount: Map<string, number> = $derived(alerts.reduce((accumulated, current) => {
        current.attributes?.informed_entity
            ?.map(entity => entity.route)
            ?.filter(
                // get unique route
                (route, index, arr) => route && arr.indexOf(route) === index
            )
            ?.forEach(routeId => {
                if (accumulated.has(routeId)) {
                    accumulated.set(routeId, accumulated.get(routeId) + 1);
                } else {
                    accumulated.set(routeId, 1);
                }
            });
        return accumulated;
    }, new Map()));
    
</script>

<Calendar.Cell {date} month={month.value}>
    {#snippet child({ props })}
        <td {...props} class="calendar-cell">
            <Calendar.Day
            class="rounded-9px text-foreground hover:border-foreground data-selected:bg-foreground data-disabled:text-foreground/30 data-selected:text-background data-unavailable:text-muted-foreground data-disabled:pointer-events-none data-outside-month:pointer-events-none data-selected:font-medium data-unavailable:line-through group relative inline-flex size-10 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal"
            >
                {#snippet child({ props })}
                    <a {...props} class="calendar-day {routeAlertsCount.size > 5 ? 'calendar-day--many-alerts' : ''}" href={(linkToCalendar && currentServiceDate.compare(date) !== 0 && props['data-disabled'] !== '') ? `./calendar#date=${dateString}` : undefined}>
                        <div>{date.day}</div>
                        {#if alertsPrioritizedDedupeRoutes.length}
                        <div>
                            {#each alertsPrioritizedDedupeRoutes as alert}
                                {@const route_id = alert.attributes.informed_entity[0].route}
                                {@const attributes = (routeMap.get(alert.attributes.informed_entity[0].route) as any)?.attributes}
                                {@const color = attributes?.color ? '#' + attributes?.color : 'inherit'}
                                {@const textColor = attributes?.text_color ? '#' + attributes?.text_color : 'inherit'}
                                {@const severityAsOpacity = 1}
                                <div class="badge-group">
                                    <MbtaRouteBadge type="auto" pillLabel={getPillName(route_id, attributes)} color={color} textColor={textColor} />
                                    <span class="badge-secondary-symbol" style:color={color} style:opacity={severityAsOpacity}>
                                        {(routeAlertsCount.get(route_id) || 0) > 1 ? (routeAlertsCount.get(route_id) + 'x') : getAlertBadgeSecondarySymbol(alert, dateString)}
                                    </span>
                                </div>
                                {' '}
                            {/each}
                        </div>
                        {/if}
                    </a>
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
    height: 2.5em;
    /* https://stackoverflow.com/a/11275916 height essentially is min-height, as tables always stretch */
    vertical-align: top;
}
.calendar-day {
    height: 100%;
    color: inherit;
    text-decoration: none;
    display: block;
}
.calendar-day:not([data-disabled]):not([data-unavailable]){
    cursor: pointer;
}
.calendar-day[data-selected] {
    background-color: #eee;
}
@media (prefers-color-scheme: dark) {
    .calendar-day[data-selected] {
        background-color: #333;
    }
}
.badge-secondary-symbol {
    font-family: math, sans-serif;
    vertical-align: middle;
    display: inline-block;
}
.calendar-day.calendar-day--many-alerts .badge-secondary-symbol {
    display: none;
}
</style>