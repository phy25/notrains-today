<script lang="ts">
import LanguagePicker from './language-picker.svelte';

import { m } from '$lib/paraglide/messages';
import type { PageProps } from './$types';
import { QUERY_ROUTE_TYPE_MAPPING } from '$lib/mbta-types';
import PageAsync from './page-async.svelte';

const { data }: PageProps = $props();
</script>

<div class="page-content">

{#await data.data_async() then d}
<PageAsync data={d} current_service_date={data.current_service_date} />
{/await}

<p>
    {#each Object.keys(QUERY_ROUTE_TYPE_MAPPING) as type}
        <a href="/?route_type={type}">{type}</a>{' '}
    {/each}
</p>

<p>☺ notrains.today <LanguagePicker /></p>
</div>
