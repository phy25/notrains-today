<script lang="ts">
    import '$lib/style.css';
	import Alert from "$lib/alert.svelte";
	import { m } from "$lib/paraglide/messages";
	import Header from "./header.svelte";

    const MBTA_PLACEHOLDER = '%%MBTA%%';
    const error_text_array = m.errorSeeAlso({MBTA: MBTA_PLACEHOLDER}).split(MBTA_PLACEHOLDER) || [];
</script>

<Header />

<div class="page-content">
    <Alert clickBtnText={m.errorRetryButton()} onclick={(event: MouseEvent) => {event.preventDefault();location.reload();}}>
        {#each error_text_array as text, index}
            {#if index > 0}<a href="https://www.mbta.com/alerts/subway">{m.errorMbtaWebsite()}</a>{/if}{text}
        {/each}
    </Alert>
</div>