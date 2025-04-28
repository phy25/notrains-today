<script lang="ts">
	import type { PageProps } from './$types';
	import PageAsync from '../../page-async.svelte';
	import { m } from '$lib/paraglide/messages';
	import Error from '../../+error.svelte';

	const { data }: PageProps = $props();
</script>

<svelte:head>
  <title>notrains.today</title>
</svelte:head>

{#await data.data_async()}
    <p>{m.loading()}</p>
{:then d}
    {#await data.last_train_data_async}
        <p>{m.loading()}</p>
    {:then lastTrainData}
	<PageAsync
		data={d}
        lastTrainData={lastTrainData}
        routeType={data.route_type}
		currentServiceDate={data.current_service_date}
		isCurrentServiceNightOwl={data.is_current_service_night_owl}
	/>
    {:catch}
    <PageAsync
		data={d}
        lastTrainData={new Map()}
        routeType={data.route_type}
		currentServiceDate={data.current_service_date}
		isCurrentServiceNightOwl={data.is_current_service_night_owl}
	/>
    {/await}
{:catch}
<Error />
{/await}
