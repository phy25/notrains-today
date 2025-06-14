<script lang="ts">
import { resolveRoute } from "$app/paths";
import { page } from "$app/state";
import { alertsToRouteRenderingList, getProcessedAlertsAsSingleRoute } from "$lib/calendar";
import MbtaRouteBadgeCompound from "$lib/mbta-route-badge-compound.svelte";
import { MBTA_TIMEZONE, type MbtaAlert } from "$lib/mbta-types";
import { CalendarDate, DateFormatter } from "@internationalized/date";
import { m } from "$lib/paraglide/messages";
import CalendarIcon from "./calendar-icon.svelte";
	import { getLocale } from "$lib/paraglide/runtime";

const { alertsByDay, routeMap, currentServiceDate, type = 'calendar' } : {
    alertsByDay: Map<string, MbtaAlert[]>;
    routeMap: Map<string, any>;
    currentServiceDate: CalendarDate;
    type?: 'calendar' | 'today';
} = $props();

const targetDate: CalendarDate | null = $derived.by(() => {
    if (type === 'today') {
        return currentServiceDate;
    } else {
        let targetDate = currentServiceDate;
        const endSearchDate = targetDate.add({ months: 1 });
        while (targetDate.compare(endSearchDate) < 0) {
            targetDate = targetDate.add({ days: 1 });
            if (alertsByDay.get(targetDate.toString())?.length) {
                break;
            }
            if (targetDate.compare(endSearchDate) == 0) {
                return null;
            }
        }
        return targetDate;
    }
});

const routesList = $derived.by(() => {
    if (targetDate) {
        return alertsToRouteRenderingList(
            getProcessedAlertsAsSingleRoute(alertsByDay.get(targetDate.toString()) || []),
            routeMap);
    }
    return [];   
});

const linkHref = $derived.by(() => {
    if (type === 'today') {
        return resolveRoute('/[[route_type]]', { route_type: page.params.route_type });
    } else {
        return resolveRoute('/[[route_type]]/calendar', { route_type: page.params.route_type }) + (targetDate ? ('#date=' + targetDate.toString()) : '');
    }
});

const linkTitle = $derived.by(() => {
    if (type === 'today') {
        return m.alertsToday();
    } else {
        return m.alertsCalendar() + (targetDate ? ` (${new DateFormatter(getLocale(), { month: 'numeric', day: 'numeric' }).format(targetDate.toDate(MBTA_TIMEZONE))})` : '');
    }
});
</script>

<a href={linkHref} title={linkTitle}>
    {#if type === 'today'}
        <div class="link-icon">‹</div>
    {/if}    
    <div class="link-text">
        <div class="link-heading">
            {#if type === 'today'}
                {m.alertsToday()}    
            {:else}
                <CalendarIcon date={targetDate} />{m.alertsCalendar()}
            {/if}
        </div>
        <div class="link-summary">
            {#each routesList as route}
                <MbtaRouteBadgeCompound routeId={route.route_id} routeAttributes={route.attributes} />
            {/each}
        </div>
    </div>
    {#if type !== 'today'}
        <div class="link-icon">›</div>
    {/if}
</a>

<style>
a {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 0 0.6em;
    text-decoration: none;
    color: inherit;
    padding: 0.6em 0.6em;
    min-height: 24px;
    margin: 0.5em 0;
    border: 1px solid #195581;
    border-radius: 0.5em;
    color: #195581;
    background: var(--background-color);
    line-height: 1;
}
a:hover, a:focus {
    --background-color: #DDD;
	outline: none;
}

@media (prefers-color-scheme: dark) {
    a {
        color: var(--color-accent);
        border-color: var(--color-accent);
    }
    a:hover, a:focus {
        --background-color: #333;
    }
}
.link-text {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4em 0.6em;
    flex: 1;
}
.link-heading {
    font-weight: bold;
}
.link-summary {
    display: flex;
    gap: 0.2em;
    flex-wrap: wrap;
}
.link-icon {
    font-size: 1.2em;
}
</style>