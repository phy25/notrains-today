<script lang="ts">	
	import { getPillName } from '$lib/mbta-display';
	import MbtaRouteBadge from '$lib/mbta-route-badge.svelte';
	import type { MbtaAlert } from '$lib/mbta-types';
	import { m } from '$lib/paraglide/messages';
	import type { LayoutProps } from './$types';
	const { data, children }: LayoutProps = $props();
	const alertsToRouteRenderingList = (alerts: MbtaAlert[], routeMap: Map<string, any>) => {
		return alerts?.flatMap(alert => alert.attributes.informed_entity)
			?.map(entity => entity.route)
			?.filter((value, index, self) => self.indexOf(value) === index)
			?.map(route_id => {
				return {
					route_id,
					color: (routeMap.get(route_id)?.attributes?.color) ? '#' + routeMap.get(route_id)?.attributes?.color : 'inherit',
					textColor: (routeMap.get(route_id)?.attributes?.text_color) ? '#' + routeMap.get(route_id)?.attributes?.text_color : 'inherit',
					attributes: routeMap.get(route_id)?.attributes,
				}
			});
	};
	const alerts_today_route_list = async () => {
		const { alertsByDay, routeMap } = await data.data_async();
		return alertsToRouteRenderingList(alertsByDay.get(data.current_service_date.toString()) || [], routeMap);
	};
	const alerts_future_route_list = async () => {
		const { alertsByDay, routeMap } = await data.data_async();
		let targetDate = data.current_service_date;
		const endSearchDate = targetDate.add({ months: 1 });
		while (targetDate.compare(endSearchDate) < 0) {
			targetDate = targetDate.add({ days: 1 });
			if (alertsByDay.get(targetDate.toString())?.length) {
				break;
			}
		}
		return alertsToRouteRenderingList(alertsByDay.get(targetDate.toString()) || [], routeMap);
	};
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
				{#await alerts_today_route_list()}
					<!-- loading -->
				{:then alerts_today_route_list}
					{#each alerts_today_route_list as route}
						<div class="badge-group">
							<MbtaRouteBadge pillLabel={getPillName(route.route_id, route.attributes)} color={route.color} textColor={route.textColor} />
						</div>
					{:else}
						<span>✅</span> <span class="no-alert-text">{m.no_alert()}</span>
					{/each}
				{/await}
            </div>
        </a>
        <a class="tab-item {tab_id === 'calendar' && 'selected'}" href="./calendar">
            <div class="tab-item-heading">{m.calendar()}</div>
            <div>
				{#await alerts_future_route_list()}
					<!-- loading -->
				{:then alerts_future_route_list}
					{#each alerts_future_route_list as route}
						<div class="badge-group">
							<MbtaRouteBadge pillLabel={getPillName(route.route_id, route.attributes)} color={route.color} textColor={route.textColor} />
						</div>
					{:else}
						<span>✅</span> <span class="no-alert-text">{m.no_alert()}</span>
					{/each}
				{/await}
            </div>
        </a>
    </div>
</div>

{@render children()}

<style>
:global {
	body {
		font-size: 16px;
		font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
		margin: 0;
		--page-content-max-width: 56em;
	}
	.page-content {
		margin: 0 auto;
		padding: 0 0.4em;
		width: 100%;
		max-width: var(--page-content-max-width);
		box-sizing: border-box;
	}
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
    max-width: var(--page-content-max-width);
	gap: 0.1em;
}
.tab-item {
    flex: 1;
    padding: 0.3em 0.6em;
    line-height: 1.4em;
	min-height: 2.8em;
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
	margin-right: 0.2em;
}
</style>