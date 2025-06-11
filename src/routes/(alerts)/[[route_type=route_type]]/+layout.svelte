<script lang="ts">
	import '$lib/style.css';
	import { isDebug } from '$lib/common';
	import { QUERY_ROUTE_TYPE_MAPPING } from '$lib/mbta-types';
	import { m } from '$lib/paraglide/messages';
	import type { LayoutProps } from './$types';
	import { alertsToRouteRenderingList, getBannerAlerts, getProcessedAlertsAsSingleRoute } from '$lib/calendar';
	import { afterNavigate } from '$app/navigation';
	import { resolveRoute } from '$app/paths';
	import { page } from '$app/state';
	import Header from '../../header.svelte';
	import BannerAlert from '../../banner-alert.svelte';

	const { data, children }: LayoutProps = $props();

	const dataAsyncResult = $derived.by(async () => await data.data_async());
	
	const alerts_today_route_list = $derived((async () => {
		const { alertsByDay, routeMap } = await dataAsyncResult;
		return alertsToRouteRenderingList(
			getProcessedAlertsAsSingleRoute(alertsByDay.get(data.current_service_date.toString()) || []),
			routeMap);
	})());
	const lastUpdatedStringAsync = $derived((async () => {
		const { lastUpdated } = await dataAsyncResult;
		return lastUpdated;
	})());

	const bannerAlertsAsync = $derived((async () => {
		const { data } = await dataAsyncResult;
		return getBannerAlerts(data);
	})());

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

<Header alertsTodayAsync={alerts_today_route_list} {lastUpdatedStringAsync} routeType={data.route_type}></Header>

<div class="page-content">
	{#await bannerAlertsAsync then bannerAlerts}
		{#each bannerAlerts as alert}
			<BannerAlert alert={alert} />
		{/each}
	{/await}

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
							data: JSON.stringify((await data.data_async()).rawResponse),
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
			<button bind:this={feedbackBtnDom} type="button" class="link" onclick={(event)=>{(event.target as HTMLButtonElement).blur();/* get autofocus in the sentry dialog working */return false;}}>{m.footerFeedback()}</button>
		</p>
	</footer>
</div>

<style>
</style>