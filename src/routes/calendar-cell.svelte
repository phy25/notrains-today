<script lang="ts">
	import { Calendar } from "bits-ui";
    import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
    import { getAlertBadgeSecondarySymbol, getLineName, getPillName } from "$lib/mbta-display";
	import { type MbtaAlert } from "$lib/mbta-types";
    import type { DateValue } from "@internationalized/date";
	import { getProcessedAlertsAsSingleRoute } from "$lib/calendar";
	import { page } from "$app/state";
	import { resolveRoute } from "$app/paths";

    interface CalendarCellProps {
        date: DateValue;
        month: any;
        weekday?: string;
        alertsByDay: Map<string, MbtaAlert[]>;
        routeMap: Map<string, any>;
        currentServiceDate: DateValue;
        linkToCalendar?: boolean;
        alwaysShowSecondarySymbol?: boolean;
    };

    const {date, month, weekday, alertsByDay, routeMap, currentServiceDate, linkToCalendar = false, alwaysShowSecondarySymbol = false}: CalendarCellProps = $props();
    const dateString = $derived(date.toString());
    const alerts: MbtaAlert[] = $derived.by(() => {
        if (alertsByDay.has(dateString) && currentServiceDate.toString() <= dateString) {
            return getProcessedAlertsAsSingleRoute(alertsByDay.get(dateString) || []);
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
    const calendarPath = resolveRoute('/[[route_type]]/calendar', { route_type: page.params.route_type });
    
</script>

<Calendar.Cell {date} month={month.value}>
    {#snippet child({ props })}
        <td {...props} class="calendar-cell">
            <Calendar.Day
            class="rounded-9px text-foreground hover:border-foreground data-selected:bg-foreground data-disabled:text-foreground/30 data-selected:text-background data-unavailable:text-muted-foreground data-disabled:pointer-events-none data-outside-month:pointer-events-none data-selected:font-medium data-unavailable:line-through group relative inline-flex size-10 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal"
            >
                {#snippet child({ props })}
                    <a
                        {...props}
                        class="calendar-day {routeAlertsCount.size > 5 && !alwaysShowSecondarySymbol ? 'calendar-day--many-alerts' : ''} {routeAlertsCount.size > 10 && !alwaysShowSecondarySymbol ? 'calendar-day--too-many-alerts' : ''}"
                        href={(linkToCalendar && props['data-disabled'] !== '') ? `${calendarPath}#date=${dateString}` : undefined}
                        role="button"
                    >
                        <div class="day-row">
                            <div class="day notranslate">{date.day}</div>
                            <div class="weekday">{weekday}</div>
                            <div class="right"></div>
                        </div>
                        {#if alertsPrioritizedDedupeRoutes.length}
                        <div class="badge-groups">
                            {#each alertsPrioritizedDedupeRoutes as alert}
                                {@const route_id = alert.attributes.informed_entity[0].route}
                                {@const attributes = (routeMap.get(alert.attributes.informed_entity[0].route) as any)?.attributes}
                                {@const color = attributes?.color ? '#' + attributes?.color : 'inherit'}
                                {@const textColor = attributes?.text_color ? '#' + attributes?.text_color : 'inherit'}
                                {@const severityAsOpacity = 1}
                                <div class="badge-group">
                                    <MbtaRouteBadge type="auto" pillLabel={getPillName(route_id, attributes)} color={color} textColor={textColor} fullName={getLineName(route_id, attributes)} />
                                    <span class="badge-secondary-symbol" style:color={color} style:opacity={severityAsOpacity}>
                                        {(routeAlertsCount.get(route_id) || 0) > 1 ? (routeAlertsCount.get(route_id) + 'x') : getAlertBadgeSecondarySymbol(alert, dateString, currentServiceDate.toString())}
                                    </span>
                                </div>
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
.badge-groups {
    display: flex;
    flex-wrap: wrap;
    gap: 0 0.2em;
}
@media (max-width: 21rem) {
    .badge-groups {
        gap: 0 0.1em;
    }
}
.calendar-cell{
    height: 100%;
    /* https://stackoverflow.com/a/49797662 */
    /* https://stackoverflow.com/a/11275916 height essentially is min-height, as tables always stretch */
    vertical-align: top;
    position: relative;
}
.calendar-day {
    height: 100%;
    min-height: 2.5em;
    color: inherit;
    text-decoration: none;
    display: block;
    padding: 0.2em;
    box-sizing: border-box;
}
.calendar-day::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
}
.calendar-day .day-row {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 0.3em;
}
.calendar-day .day, .calendar-day .right {
    flex: 1;
}
.calendar-day .weekday {
    font-style: italic;
}
@media (max-width: 21rem) {
    .calendar-day .weekday {
        display: none;
    }
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
.calendar-day[data-disabled] {
    color: #888;
}
.badge-secondary-symbol {
    font-family: math, sans-serif;
    vertical-align: middle;
    display: inline-block;
}
@media (max-width: 40rem) {
    .calendar-day.calendar-day--many-alerts .badge-secondary-symbol {
        display: none;
    }
}
.calendar-day.calendar-day--too-many-alerts .badge-secondary-symbol {
    display: none;
}
.calendar-day.calendar-day--too-many-alerts .badge-groups {
    --badge-size: 0.9em;
}
</style>