<script lang="ts">
	import type { PageProps } from './$types';
	import PageAsync from './page-async.svelte';
	import { invalidateAll } from '$app/navigation';
	import { m } from '$lib/paraglide/messages';

	const { data }: PageProps = $props();
    let isOutdated = $state(false);
    $effect(() => {
        data.data_async;
        setTimeout(() => {
            isOutdated = true;
        }, 1000 * 60 * 5);
    });
</script>

{#if isOutdated}
    <div class="alert alert-warning">
        <p><button onclick={() => {isOutdated = false;invalidateAll();}}>{m.refresh_reminder()}</button></p>
    </div>
{/if}

{#await data.data_async() then d}
	<PageAsync
		data={d}
		currentServiceDate={data.current_service_date}
		isCurrentServiceNightOwl={data.is_current_service_night_owl}
	/>
{/await}
