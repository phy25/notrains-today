<script lang="ts">
	import type { PageProps } from './$types';
	import PageAsync from '../../page-async.svelte';
	import { invalidateAll } from '$app/navigation';
	import { m } from '$lib/paraglide/messages';
	import Error from '../../+error.svelte';
	import Alert from '$lib/alert.svelte';

	const { data }: PageProps = $props();
    let isOutdated = $state(false);
    $effect(() => {
        data.data_async;
        // when data_async changes, reset isOutdated
        // which means if the page hasn't refreshed yet, do not remove isOutdated flag
        isOutdated = false;
        setTimeout(() => {
            isOutdated = true;
        }, 1000 * 60 * 10);
    });
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

{#if isOutdated}
<Alert
    sticky={true}
    onclick={(event: MouseEvent) => {event.preventDefault();invalidateAll();return false;}}
    clickBtnText={m.refreshReminderButton()}>
    {m.refreshReminder()}
</Alert>
{/if}
