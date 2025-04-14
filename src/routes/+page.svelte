<script lang="ts">
	import type { PageProps } from './$types';
	import PageAsync from './page-async.svelte';
	import { invalidateAll } from '$app/navigation';
	import { m } from '$lib/paraglide/messages';
	import Error from './+error.svelte';
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
        }, 1000 * 60 * 30);
    });
</script>

{#if isOutdated}
    <Alert onclick={() => {invalidateAll();}}>
        {m.refresh_reminder()}
    </Alert>
{/if}

{#await data.data_async()}
    <p>{m.loading()}</p>
{:then d}
	<PageAsync
		data={d}
		currentServiceDate={data.current_service_date}
		isCurrentServiceNightOwl={data.is_current_service_night_owl}
	/>
{:catch}
<Error />
{/await}
