<script lang="ts">
	import { localizeHref, deLocalizeHref, setLocale, type Locale } from "$lib/paraglide/runtime";
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages';

	function switchToLanguage(newLanguage: Locale) {
		setLocale(newLanguage);
		return;
		const canonicalPath = deLocalizeHref(page.url.pathname);
		const localisedPath = localizeHref(canonicalPath, {locale: newLanguage});
		goto(localisedPath);
	}
</script>

<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>
<div>
	<button onclick={() => switchToLanguage('en')}>en</button>
	<button onclick={() => switchToLanguage('zh-hans')}>zh-hans</button>
</div>
