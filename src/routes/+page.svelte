<script lang="ts">
import type { PageProps } from './$types';
import PageAsync from './page-async.svelte';

const { data }: PageProps = $props();
</script>

{#await data.data_async() then d}
<PageAsync data={d} current_service_date={data.current_service_date} />
{/await}
