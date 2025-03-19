<script lang="ts">
	import { setLocale, type Locale } from "$lib/paraglide/runtime";

	function switchToLanguage(newLanguage: Locale) {
		setLocale(newLanguage);
		return;
	}
</script>

<div>
	<button onclick={() => switchToLanguage('en')}>en</button>
	<button onclick={() => switchToLanguage('zh-hans')}>zh-hans</button>
</div>