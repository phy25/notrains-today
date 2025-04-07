<script lang="ts">	
	import MbtaRouteBadge from '$lib/mbta-route-badge.svelte';
	import { m } from '$lib/paraglide/messages';
	import type { LayoutProps } from './$types';
	const { data, children }: LayoutProps = $props();
	const notrains_today = $derived.by(async () => {
		const { data: alerts } = await data.data_async();
		return true;
	});
	const tab_id = $derived.by(() => {
		if (data.route_id === '/calendar') {
			return 'calendar';
		}
		return 'today';
	});
	
</script>

<div class="tab-wrapper">
    <div class="tab">
        <a class="tab-item {tab_id === 'today' && 'selected'}" href="./">
            <div class="tab-item-heading">notrains.today</div>
            <div>
				{#await notrains_today}
					<!-- loading -->
				{:then notrains_today}
					{#if notrains_today}
						<div class="badge-group">
							<MbtaRouteBadge pillLabel="RL" type="long" color="#da291c" textColor="#FFF"></MbtaRouteBadge>
							<MbtaRouteBadge pillLabel="M" type="secondary" color="#da291c" textColor="#FFF"></MbtaRouteBadge>
						</div>
					{:else}
						<span>✅</span> <span class="no-alert-text">{m.no_alert()}</span>
					{/if}
				{/await}
            </div>
        </a>
        <a class="tab-item {tab_id === 'calendar' && 'selected'}" href="./calendar">
            <div class="tab-item-heading">{m.calendar()}</div>
            <div>
				{#await notrains_today}
					<!-- loading -->
				{:then notrains_today}
					{#if !notrains_today}
						<div class="badge-group">
							<MbtaRouteBadge pillLabel="RL" type="long" color="#da291c" textColor="#FFF"></MbtaRouteBadge>
							<MbtaRouteBadge pillLabel="M" type="secondary" color="#da291c" textColor="#FFF"></MbtaRouteBadge>
						</div>
						(mock)
					{:else}
						<span>✅</span> <span class="no-alert-text">{m.no_alert()} (mock)</span>
					{/if}
				{/await}
            </div>
        </a>
    </div>
</div>

{@render children()}

<style>
:global {
	body {font-size: 16px; font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif; margin: 0;}
}


.tab-wrapper {
    background: var(--background-color);
    --background-color: #165c96;
    color: #FFF;
    padding: 0.4em;
    display: flex;
    justify-content: space-around;
}
@media (max-width: 480px) {
    .tab-wrapper {
        padding: 0.4em 0.2em;
    }
}
.tab {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    border: #FFF 1px solid;
    border-radius: 0.3em;
    padding: 0.2em;
    width: 100%;
    max-width: 56em;
}
.tab-item {
    flex: 1;
    padding: 0.3em 0.6em;
    line-height: 1.4;
    cursor: pointer;
    border-radius: 0.3em;
    text-decoration: none;
    color: inherit;
}
.tab-item:hover {
    background: var(--background-color);
    --background-color: #DDD;
    color: #000;
}
.tab-item.selected {
    background: var(--background-color);
    --background-color: #FFF;
    color: #000;
}
.tab-item-heading {
    font-weight: bold;
}
.badge-group {
    display: inline-flex;
}
</style>