<script lang="ts">
	import '$lib/style.css';
	import { isDebug } from '$lib/common';
	import { QUERY_ROUTE_TYPE_MAPPING } from '$lib/mbta-types';
	import { m } from '$lib/paraglide/messages';
	import type { LayoutProps } from './$types';
	import MbtaRouteBadgeCompound from '$lib/mbta-route-badge-compound.svelte';
	import { alertsToRouteRenderingList, getProcessedAlertsAsSingleRoute } from '$lib/calendar';
	import { afterNavigate } from '$app/navigation';
	import { resolveRoute } from '$app/paths';
	import { page } from '$app/state';

	const { data, children }: LayoutProps = $props();
	
	const alerts_today_route_list = $derived((async () => {
		const { alertsByDay, routeMap } = await data.data_async();
		return alertsToRouteRenderingList(
			getProcessedAlertsAsSingleRoute(alertsByDay.get(data.current_service_date.toString()) || []),
			routeMap);
	})());
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
		return alertsToRouteRenderingList(
			getProcessedAlertsAsSingleRoute(alertsByDay.get(targetDate.toString()) || []),
			routeMap);
	};
	const tab_id = $derived.by(() => {
		if (data.route_id === '/(alerts)/[[route_type=route_type]]/calendar') {
			return 'calendar';
		}
		return 'today';
	});
	let debugClickTimes = 0;
	const trackDebugClicks = () => {
		debugClickTimes++;
		if (debugClickTimes == 5) {
			localStorage.setItem('debugDate', '');
			location.href = '/about?debug';
		}
	};
	afterNavigate(() => {
		debugClickTimes = 0;
	});
	let feedbackBtnDom: HTMLButtonElement;
	$effect(() => {
		feedbackBtnDom;
		import('@sentry/sveltekit').then(
			({ getFeedback }) => {
				if (feedbackBtnDom) {
					const feedback = getFeedback();
					return feedback?.attachTo(feedbackBtnDom, {
						formTitle: "Send feedback",
					});
				}
			}
		);
	});
</script>

<svelte:head>
  <title>notrains.today</title>
</svelte:head>

<header class="tab-wrapper {isDebug() ? 'debug' : ''}">
	<div class="tab-content">
		{#if isDebug()}
			<a class="header-text notranslate" href={resolveRoute('/[[route_type]]', { route_type: page.params.route_type })}>
				<h1>notrains.today{#if tab_id !== 'today'}?{:else}{#await alerts_today_route_list}?{:then list}{#if list.length == 0}?{/if}{/await}{/if}</h1>
			</a>
		{:else}
		<div class="tab">
			<a class="tab-item {tab_id === 'today' && 'selected'}" href={resolveRoute('/[[route_type]]', { route_type: page.params.route_type })}>
				<div class="tab-item-heading notranslate">
					notrains.today{#await alerts_today_route_list}?{:then list}{#if list.length == 0}?{/if}{/await}
				</div>
				<div>
					{#await alerts_today_route_list}
						<!-- loading -->
					{:then alerts_today_route_list}
						{#each alerts_today_route_list as route}
							<div class="badge-group">
								<MbtaRouteBadgeCompound routeId={route.route_id} routeAttributes={route.attributes} />
							</div>
						{:else}
							<span>✅</span> <span class="no-alert-text">{m.noAlert()}</span>
						{/each}
					{:catch}<!-- svelte-ignore block_empty -->
					{/await}
				</div>
			</a>
			<a class="tab-item {tab_id === 'calendar' && 'selected'}" href={resolveRoute('/[[route_type]]/calendar', { route_type: page.params.route_type })}>
				<div class="tab-item-heading">{m.calendar()}</div>
				<div>
					{#await alerts_future_route_list()}
						<!-- loading -->
					{:then alerts_future_route_list}
						{#each alerts_future_route_list as route}
							<div class="badge-group">
								<MbtaRouteBadgeCompound routeId={route.route_id} routeAttributes={route.attributes} />
							</div>
						{:else}
							<span>✅</span> <span class="no-alert-text">{m.noAlert()}</span>
						{/each}
					{:catch}<!-- svelte-ignore block_empty -->
					{/await}
				</div>
			</a>
		</div>
		{/if}
		{#if isDebug()}
			<div class="tab-side-btn">
				<a href={resolveRoute(page.route.id || '/bus', { route_type: 'bus' })}>
					<span>🚇 🚂</span>
				</a>
			</div>
		{/if}
	</div>
</header>

<div class="page-content">
	{@render children()}
	<footer>
		{#if isDebug()}
		<p>
			{#each Object.keys(QUERY_ROUTE_TYPE_MAPPING) as type}
				<a href={resolveRoute(page.route.id || "/[[route_type]]", {route_type: type})}>{type}</a>{' '}
			{/each}
			<!-- svelte-ignore a11y_invalid_attribute -->
			<a href="javascript:void(0)" onclick={() => {
				import('@sentry/sveltekit').then(
					async ({ getCurrentScope }) => {
						const name = 'alerts-'+page.params.route_type+'.json';
						getCurrentScope().clearAttachments();
						getCurrentScope().addAttachment({
							data: JSON.stringify((await data.data_async()).data),
							filename: name,
							contentType: 'application/json',
						});
						feedbackBtnDom?.click();
					}
				);
				return false;
			}}>Provide feedback with current alarms</a>
		</p>
		{/if}

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<p onclick={trackDebugClicks}>
			<span class="notranslate">☺ notrains.today</span>
			<a href="/about">{m.footerAbout()}</a>
			<button bind:this={feedbackBtnDom} type="button" class="link" onclick={(event)=>{(event.target as HTMLButtonElement).blur();/* get autofocus in the sentry dialog working */return false;}}>{m.footerFeedback()}</button></p>
	</footer>
</div>

<style>
.tab-wrapper {
    background: linear-gradient(45deg, #195581, #2580C1) var(--background-color);
    --background-color: #195581;
    color: #FFF;
    padding: 0.4em;
    display: flex;
    justify-content: center;
	min-width: var(--page-content-min-width);
}
.tab-item:first-child{
	--background-color: #195581;
}
.tab-item:last-child{
	--background-color: #2580C1;
}
a {
    color: inherit;
}
@media (max-width: 21rem) {
    .tab-wrapper {
        padding: 0.4em 0.2em;
    }
}
.tab-wrapper.debug {
	background-image: repeating-linear-gradient(
		-45deg,
		#2580C1,
		#2580C1 10px,
		#195581 10px,
		#195581 2.5rem
	);
	padding: 0;
}
.tab-content {
	display: flex;
    width: 100%;
    max-width: var(--page-content-max-width);
	box-sizing: border-box;
	align-items: stretch;
}
.tab-wrapper.debug .tab-content {
	min-height: 3em;
}
.header-text {
	flex: 1;	
	padding: 0.3em 0.5em;
	display: flex;
	align-items: center;
	text-decoration: none;
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
.tab {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    border: #FFF 1px solid;
    border-radius: 0.3em;
    padding: 0.2em;
	gap: 0.1em;
	flex: 1;
}
.tab-item {
    flex: 1;
    padding: 0.3em 0.6em;
    line-height: 1.4em;
	min-height: 2.8em;
    cursor: pointer;
    border-radius: 0.3em;
    text-decoration: none;
	transition: background-color 0.2s ease;
}
.tab-item:hover, .tab-item:focus {
    background: var(--background-color);
    --background-color: #DDD;
    color: #000;
	outline: none;
}
.tab-item.selected {
    background: var(--background-color);
    --background-color: #FFF;
    color: #000;
}
.tab .tab-item.selected:hover, .tab .tab-item.selected:focus {
	background: var(--background-color);
    --background-color: #EEE;
}
.tab-item-heading {
    font-weight: bold;
}
.badge-group {
    display: inline-flex;
	margin-right: 0.2em;
}
</style>