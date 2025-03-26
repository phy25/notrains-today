<script lang="ts">	
	// import { i18n } from '$lib/i18n';
	// import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	let { children } = $props();
</script>

{@render children()}

<style>
:global {
	body {font-size: 16px; font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;}
}
</style>