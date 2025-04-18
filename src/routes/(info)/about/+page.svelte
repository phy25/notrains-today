<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { locales, setLocale, getLocale, type Locale } from '$lib/paraglide/runtime';
	import Debugger from './debugger.svelte';

	function switchToLanguage(newLanguage: Locale) {
		setLocale(newLanguage);
		return;
	}

	const untranslatedLegalDisclaimer = m.untranslatedLegalDisclaimer();
</script>

<Debugger />

<h2>Languages</h2>

{#each locales as locale}
	<button onclick={() => switchToLanguage(locale)} class={getLocale() === locale ? 'selected' : ''}>
		{m.currentLocaleName({}, { locale: locale })}
	</button>
{/each}

<details>
	<summary>Contribute to translations</summary>
	<p>
		<a href="https://fink.inlang.com/github.com/phy25/notrains-today">Contribute to translations through Fink</a>.
		A GitHub account is required, and the third-party translation tool Fink terms of use may apply.
		Alternatively, you may translate the inlang files locally.
	</p>
</details>

<h2>{m.privacyPolicy()}</h2>

{#if untranslatedLegalDisclaimer}
	<p><em>{m.untranslatedLegalDisclaimer()}</em></p>
{/if}

<p>
	notrains.today uses data service from MBTA, a Massachusetts public agency in the United States. <a
		href="https://www.mbta.com/policies/privacy-policy"
		>Privacy policy of the Massachusetts Bay Transportation Authority can be found here.</a
	>
</p>
<p>
	notrains.today uses hosting service from Cloudflare, a Delaware-based company in the United
	States. <a href="https://www.cloudflare.com/privacypolicy/"
		>Privacy policy of Cloudflare, Inc. can be found here.</a
	>
</p>
<p>
	notrains.today uses analytics service from Sentry, a Delaware-based company in the United
	States. <a href="https://sentry.io/privacy/"
		>Privacy policy of Functional Software, Inc. can be found here.</a
	>
	We only retain data from this service for 30 days.
</p>
<!--<p>
	notrains.today uses hosting service from Amazon Web Services, a Delaware-based company in
	the United States. <a href="https://aws.amazon.com/privacy/"
		>Privacy policy of Amazon Web Services, Inc. can be found here.</a
	>
</p>-->
<p>
	notrains.today uses font asset hosting service from Google, a Delaware-based company in the
	United States. <a href="https://developers.google.com/fonts/faq/privacy"
		>More information on Google Fonts Web API can be found here.</a
	>
	<a href="https://policies.google.com/privacy">
		Privacy policy of Google LLC can be found here.
	</a>
</p>
<p>
	notrains.today may collect access logs and performance data through services above, both in
	anonymized aggregate form for marketing purposes, and individually for service improvement
	purposes. This data is subject to human review conducted by the website owner in the United
	States, and may also be disclosed to comply with legal requests. We do not sell data to third
	parties. For further inquiries, please email
	<a href="mailto:notrains@phy25.com">notrains@phy25.com</a>.
</p>
<p>
	notrains.today contains hyperlinks to third-party websites, including MBTA. notrains.today is not
	affiliated with these external websites. By visiting third-party websites through hyperlinks,
	different privacy policies may apply.
</p>

<h2>{m.openSourceSoftware()}</h2>

<p><a href="https://github.com/phy25/notrains-today">{m.githubRepo()}</a></p>
