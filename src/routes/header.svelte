<script lang="ts">
import { resolveRoute } from "$app/paths";
import { page } from "$app/state";
import { isDebug } from "$lib/common";
import { MBTA_TIMEZONE } from "$lib/mbta-types";
import { m } from "$lib/paraglide/messages";

const { alertsTodayAsync = Promise.resolve([]), lastUpdatedStringAsync = Promise.resolve(null)} = $props();

const page_type = $derived.by(() => {
    if (page.route.id === '/(alerts)/[[route_type=route_type]]/calendar') {
        return 'calendar';
    }
    if (page.route.id === '/(alerts)/[[route_type=route_type]]') {
        return 'today';
    }
    return 'info';
});

const getFormattedLastUpdatedTime = (timeString: string) => {
    const date = new Date(timeString);
    return new Intl.DateTimeFormat('en-US', { timeStyle: 'short', timeZone: MBTA_TIMEZONE }).format(date);
};

</script>

<header class="tab-wrapper {isDebug() ? 'debug' : ''}">
	<div class="tab-content">
        <a class="header-text notranslate" title={m.alertsToday()} href={resolveRoute('/[[route_type]]', { route_type: page.params.route_type })}>
            <div class="header-text-flex">
                <h1>notrains.today{#if page_type !== 'today'}?{:else}{#await alertsTodayAsync}?{:then list}{#if list.length == 0}?{/if}{/await}{/if}</h1>
                {#if page_type === 'today'}{#await lastUpdatedStringAsync}{:then string}{#if string}<small>{m.asOfTime({time: getFormattedLastUpdatedTime(string)})}</small>{/if}{/await}{/if}
            </div>
        </a>
        {#if page_type !== 'info' && isDebug()}
        <div class="tab-side-btn">
            <a href={resolveRoute(page.route.id || '/', { route_type: 'rapid-transit' })}>
                {m.routeTypeRapidTransit()}
            </a>
        </div>
        {/if}
	</div>
</header>

<style>
.tab-wrapper {
    background: linear-gradient(45deg, #195581, #2580C1) var(--background-color);
    --background-color: #195581;
    color: #FFF;
    display: flex;
    justify-content: center;
    min-width: var(--page-content-min-width);
}
.tab-wrapper a {
    color: inherit;
}
.tab-wrapper.debug {
    background-image: repeating-linear-gradient(
        135deg,
        #2580C1,
        #2580C1 10px,
        #195581 10px,
        #195581 2.5rem
    );
    background-position: left top;
}
.tab-content {
    display: flex;
    width: 100%;
    max-width: var(--page-content-max-width);
    box-sizing: border-box;
    align-items: stretch;
}
.tab-wrapper .tab-content {
    min-height: 3em;
}
.header-text {
    flex: 1;	
    padding: 0.3em 0.5em;
    display: flex;
    align-items: center;
    text-decoration: none;
}
.header-text-flex {
    display: flex;
    align-items: baseline;
    gap: 0 0.5em;
    flex-wrap: wrap;
}
.header-text h1 {
    font-weight: bold;
    font-size: 1.2em;
    margin: 0;
}
.tab-side-btn {
    display: flex;
    align-items: stretch;
}
.tab-side-btn a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5em;
    gap: 0.2em;
    min-width: 48px;
    box-sizing: border-box;
    text-decoration: none;
}
</style>