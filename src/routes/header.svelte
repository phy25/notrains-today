<script lang="ts">
import { resolveRoute } from "$app/paths";
import { page } from "$app/state";
import { isDebug } from "$lib/common";
import { MBTA_TIMEZONE, QUERY_ROUTE_TYPE_DROPDOWN_M } from "$lib/mbta-types";
import { m } from "$lib/paraglide/messages";
import { DateFormatter } from "@internationalized/date";
import { getLocale } from "$lib/paraglide/runtime";
import { DropdownMenu } from "bits-ui";
import { fly } from "svelte/transition";

const { alertsTodayAsync = Promise.resolve([]), lastUpdatedStringAsync = Promise.resolve(null), routeType = undefined} = $props();

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
    return new DateFormatter(getLocale(), { timeStyle: 'short', timeZone: MBTA_TIMEZONE }).format(date);
};

let isMenuOpen = $state(false);

</script>

<header class="tab-wrapper {isDebug() ? 'debug' : ''}">
	<div class="tab-content">
        <a
            class="header-text notranslate"
            title={m.alertsToday()}
            href={resolveRoute('/[[route_type]]', { route_type: page.params.route_type })}
            onclick={(e) => {
                if (page_type === 'today') {
                    e.preventDefault();
                    isMenuOpen = !isMenuOpen;
                }
            }}
            >
            <div class="header-text-flex">
                <h1>notrains.today{#if page_type !== 'today'}?{:else}{#await alertsTodayAsync}?{:then list}{#if list.length == 0}?{/if}{/await}{/if}</h1>
                {#if page_type === 'today'}{#await lastUpdatedStringAsync}{:then string}{#if string}<small>{m.asOfTime({time: getFormattedLastUpdatedTime(string)})}</small>{/if}{/await}{/if}
            </div>
        </a>
        {#if page_type !== 'info'}
        <DropdownMenu.Root bind:open={isMenuOpen}>
            <DropdownMenu.Trigger>
                {#snippet child({ props })}
                <button {...props} class="tab-side-btn {isMenuOpen ? 'open' : ''}">
                    <div class="tab-side-btn-flex">
                        <span>{QUERY_ROUTE_TYPE_DROPDOWN_M[(routeType || '') in QUERY_ROUTE_TYPE_DROPDOWN_M ? (routeType || '') : '']()}</span>
                        <span>▾</span>
                    </div>
                </button>
                {/snippet}
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content forceMount align="end" onInteractOutside={(event: PointerEvent) => {event.preventDefault(); isMenuOpen = false;}}>
                    {#snippet child({ wrapperProps, props, open })}
                        {#if open}
                        <div {...wrapperProps} data-sveltekit-preload-data="false">
                            <div {...props} class="dropdown-menu-content" transition:fly={{ duration: 200 }}>
                                <DropdownMenu.Group>
                                    {#if routeType !== 'trains'}
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href={resolveRoute(page.route.id || '/', { route_type: '' })}>
                                                {m.routeTypeTrains()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    {/if}
                                    {#if routeType !== 'rapid-transit'}
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href={resolveRoute(page.route.id || '/', { route_type: 'rapid-transit' })}>
                                                {m.routeTypeRapidTransit()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    {/if}
                                    {#if routeType !== 'commuter-rail'}
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href={resolveRoute(page.route.id || '/', { route_type: 'commuter-rail' })}>
                                                {m.routeTypeCommuterRail()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    {/if}
                                </DropdownMenu.Group>
                                <DropdownMenu.Separator>
                                    {#snippet child({ props })}
                                        <hr {...props} />
                                    {/snippet}
                                </DropdownMenu.Separator>
                                <DropdownMenu.Group>
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href="/about">
                                                {m.footerAbout()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                </DropdownMenu.Group>
                            </div>
                        </div>
                        {/if}
                    {/snippet}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
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
    align-items: center;
    padding: 0.5em 0.2em;
    min-width: 48px;
    box-sizing: border-box;
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1em;
}
.tab-side-btn:hover {
    color: #DDD;
}
.tab-side-btn.open {
    user-select: none;
}
.tab-side-btn-flex {
    display: flex;
    align-items: baseline;
    gap: 0.2em;
}
.dropdown-menu-content {
    background: var(--background-color);
    --background-color: #FFF;
    color: #121212;
    outline: none;
    box-sizing: border-box;
    border-radius: 0 0 0.3em 0.3em;
    border: 1px solid #DDD;
    border-top: none;
}
.dropdown-menu-content:focus-visible {
    outline: none;
}
.dropdown-menu-content a {
    display: flex;
    text-decoration: none;
    min-height: 48px;
    align-items: center;
    padding: 0.5em 4em 0.5em 1em;
    box-sizing: border-box;
}
.dropdown-menu-content a:hover, .dropdown-menu-content a:focus {
    color: #195581;
    background: #DDD;
    outline: none;
}
.dropdown-menu-content hr {
    margin: 0;
    border: none;
    border-top: 1px solid #DDD;
}
</style>