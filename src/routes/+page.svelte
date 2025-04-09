<script lang="ts">
	import type { PageProps } from './$types';
	import PageAsync from './page-async.svelte';

	const { data }: PageProps = $props();
</script>

{#await data.data_async() then d}
	<PageAsync
		data={d}
		currentServiceDate={data.current_service_date}
		isCurrentServiceNightOwl={data.is_current_service_night_owl}
	/>
{/await}
