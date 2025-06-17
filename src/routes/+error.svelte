<script lang="ts">
	import ErrorContent from "./error-content.svelte";
	import Header from "./header.svelte";
</script>

<svelte:boundary>
	<Header />
	{#snippet failed(error, reset)}{/snippet}
</svelte:boundary>

<ErrorContent />