<script lang="ts">
import { resolveRoute } from "$app/paths";
import { page } from "$app/state";
import { isDebug } from "$lib/common";
import { QUERY_ROUTE_TYPE_DROPDOWN_M } from "$lib/mbta-types";
import { m } from "$lib/paraglide/messages";
import { DropdownMenu } from "bits-ui";
import { fly } from "svelte/transition";
import { MediaQuery } from 'svelte/reactivity';
import { getFormattedTime } from "$lib/mbta-display";
import { invalidateAll } from "$app/navigation";

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

let isMenuOpen = $state(false);

const showFilterText = $derived(['', undefined, 'trains', 'commuter-rail', 'rapid-transit'].includes(routeType));
const isXs = new MediaQuery('max-width: 22rem');
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
                {#if page_type === 'today'}{#await lastUpdatedStringAsync}{:then string}{#if string}<small>{m.asOfTime({time: getFormattedTime(string)})}</small>{/if}{/await}{/if}
            </div>
        </a>
        {#if page_type !== 'info' && isDebug()}
        <DropdownMenu.Root bind:open={isMenuOpen}>
            <DropdownMenu.Trigger>
                {#snippet child({ props })}
                <button {...props} class="tab-side-btn {isMenuOpen ? 'open' : ''} {showFilterText ? '' : 'tabber active'}">
                    <div class="tab-side-btn-flex">
                        <span class="hide-xs">{showFilterText ? m.filterButton() : QUERY_ROUTE_TYPE_DROPDOWN_M[routeType]()}</span>
                        <span class="show-xs inline">{QUERY_ROUTE_TYPE_DROPDOWN_M[routeType]()}</span>
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
                                    {#if routeType !== 'rapid-transit' && isXs.current}
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href={resolveRoute(page.route.id || '/', { route_type: 'rapid-transit' })}>
                                                {m.routeTypeRapidTransit()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    {/if}
                                    {#if routeType !== 'commuter-rail' && isXs.current}
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href={resolveRoute(page.route.id || '/', { route_type: 'commuter-rail' })}>
                                                {m.routeTypeCommuterRail()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    {/if}
                                    {#if routeType !== 'bus'}
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href={resolveRoute(page.route.id || '/', { route_type: 'bus' })}>
                                                {m.routeTypeBus()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    {/if}
                                    {#if routeType !== 'ferry'}
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href={resolveRoute(page.route.id || '/', { route_type: 'ferry' })}>
                                                {m.routeTypeFerry()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    {/if}
                                    {#if routeType !== 'mbta'}
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href={resolveRoute(page.route.id || '/', { route_type: 'mbta' })}>
                                                {m.routeTypeMBTA()}
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
                                            <a
                                                {...props}
                                                href={resolveRoute('/[[route_type]]', { route_type: page.params.route_type })}
                                                onclick={(event: MouseEvent) => {event.preventDefault(); isMenuOpen = false; invalidateAll(); return false;}}>
                                                    {m.refreshReminderButton()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href="/about">
                                                {m.footerAbout()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href="/about#languages">
                                                Language 🌐
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
        <a
            class="tab-side-btn hide-xs tabber {routeType == 'rapid-transit' ? 'active' : ''}"
            href={routeType == 'rapid-transit' ? resolveRoute(page.route.id || '/', { route_type: '' }) : resolveRoute(page.route.id || '/', { route_type: 'rapid-transit' })}
            title={routeType == 'rapid-transit' ? m.filterExitText({filter: m.routeTypeRapidTransit()}) : m.routeTypeRapidTransit()}>
            <div class="tab-side-btn-flex">
                <span>🚈</span>
                <span class="hide-mobile">{m.routeTypeRapidTransit()}</span>
            </div>
        </a>
        <a
            class="tab-side-btn hide-xs tabber {routeType == 'commuter-rail' ? 'active' : ''}"
            href={routeType == 'commuter-rail' ? resolveRoute(page.route.id || '/', { route_type: '' }) : resolveRoute(page.route.id || '/', { route_type: 'commuter-rail' })}
            title={routeType == 'commuter-rail' ? m.filterExitText({filter: m.routeTypeCommuterRail()}) : m.routeTypeCommuterRail()}>
            <div class="tab-side-btn-flex">
                <span>🚂</span>
                <span class="hide-mobile">{m.routeTypeCommuterRail()}</span>
            </div>
        </a>
        {/if}
        {#if page_type !== 'info' && !isDebug()}
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
                                            <a
                                                {...props}
                                                href={resolveRoute('/[[route_type]]', { route_type: page.params.route_type })}
                                                onclick={(event: MouseEvent) => {event.preventDefault(); isMenuOpen = false; invalidateAll(); return false;}}>
                                                    {m.refreshReminderButton()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href="/about">
                                                {m.footerAbout()}
                                            </a>
                                        {/snippet}
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item>
                                        {#snippet child({ props })}
                                            <a {...props} href="/about#languages">
                                                Language 🌐
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
.tab-wrapper a, .tab-wrapper a:hover {
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
    justify-content: center;
    align-items: baseline;
    padding: 0.5em 0.2em 0.1em 0.2em;
    min-width: 48px;
    box-sizing: border-box;
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1em;
    line-height: 2em;
    border-bottom: 0.4em solid transparent;
    text-decoration: none;
}
.tab-side-btn.tabber:focus, .tab-side-btn.tabber:hover {
    border-bottom-color: #DDD;
}
.tab-side-btn:hover {
    color: #DDD;
}
.tab-side-btn.tabber.active {
    border-bottom-color: #FFF;
}
@media (prefers-color-scheme: dark) {
    .tab-side-btn.tabber:focus, .tab-side-btn.tabber:hover {
        border-bottom-color: #444;
    }
    .tab-side-btn.tabber.active {
        border-bottom-color: #121212;
    }
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
.dropdown-menu-content hr {
    margin: 0;
    border: none;
    border-top: 1px solid #DDD;
}
@media (prefers-color-scheme: dark) {
    .dropdown-menu-content {
        --background-color: #000;
        color: #FFF;
        border-color: #444;
    }
    .dropdown-menu-content hr {
        border-color: #444;
    }
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
.show-xs, a.show-xs {
    display: none;
}
@media (max-width: 22rem) {
    .show-xs.inline, a.show-xs.inline {
        display: inline;
    }
    .hide-xs {
        display: none;
    }
}
@media (max-width: 40rem) {
    .hide-mobile {
        display: none;
    }
}
</style>