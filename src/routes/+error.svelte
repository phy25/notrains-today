<script lang="ts">
	import { m } from "$lib/paraglide/messages";

    const MBTA_PLACEHOLDER = '%%MBTA%%';
    const error_text_array = m.error_see_also({MBTA: MBTA_PLACEHOLDER}).split(MBTA_PLACEHOLDER) || [];
</script>

<p>
    {#each error_text_array as text, index}
        {#if index > 0}<a href="https://www.mbta.com/alerts/subway">{m.error_mbta_website()}</a>{/if}{text}
    {/each}
</p>