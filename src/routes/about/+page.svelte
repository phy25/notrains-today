<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { locales, setLocale, getLocale, type Locale } from '$lib/paraglide/runtime';

	function switchToLanguage(newLanguage: Locale) {
		setLocale(newLanguage);
		return;
	}

	const untranslated_legal_disclaimer = m.untranslated_legal_disclaimer();
</script>

<h2>Languages</h2>

{#each locales as locale}
	<button onclick={() => switchToLanguage(locale)} class={getLocale() === locale ? 'selected' : ''}>
		{m.current_locale_name({}, { locale: locale })}
	</button>
{/each}

<h2>{m.privacy_policy()}</h2>

{#if untranslated_legal_disclaimer}
	<p><em>{m.untranslated_legal_disclaimer()}</em></p>
{/if}

<p>
	notrains.today uses data service from MBTA, a Massachusetts public agency in the United States. <a
		href="https://www.mbta.com/policies/privacy-policy"
		>Privacy policy of the Massachusetts Bay Transportation Authority can be found here.</a
	>
</p>
<p>
	notrains.today uses hosting and analytics service provided by Cloudflare, a Delaware-based company
	in the United States. <a href="https://www.cloudflare.com/privacypolicy/"
		>Privacy policy of Cloudflare, Inc. can be found here.</a
	>
</p>
<p>
	notrains.today uses hosting service provided by Amazon Web Services, a Delaware-based company in
	the United States. <a href="https://aws.amazon.com/privacy/"
		>Privacy policy of Amazon Web Services, Inc. can be found here.</a
	>
</p>
<p>
	notrains.today uses font asset hosting service provided by Google, a Delaware-based company in the
	United States. <a href="https://developers.google.com/fonts/faq/privacy"
		>More information on Google Fonts Web API can be found here.</a
	>
	<a href="https://policies.google.com/privacy">
		Privacy policy of Google LLC can be found here.
	</a>
</p>
<p>
	notrains.today may collect access logs and performance data, both in anonymized aggregate form for
	marketing purposes, and individually for service improvement purposes. This data is subject to
	human review conducted by the website owner in the United States, and may also be disclosed to
	comply with legal requests. We do not sell data to third parties. For further inquiries, please
	email
	<a href="mailto:notrains@phy25.com">notrains@phy25.com</a>.
</p>
<p>
	notrains.today contains hyperlinks to third-party websites, including MBTA. notrains.today is not
	affiliated with these external websites. By visiting third-party websites through hyperlinks,
	different privacy policies may apply.
</p>
<!--<p>
	notrains.today uses analytics service by Sentry, a United States Delaware corporation. <a
		href="https://sentry.io/privacy/">Sentry's privacy policy can be found here.</a
	>
	notrains.today has access to IP address, user agent string, error reporting and performance
	telemetry within the browser sandbox, only during an application error, or on a percentage of
	requests when performance telemetry is on. These data are retained for 30 days only for service
	improvement purpose, subject to human review in the United States. We do not transfer these data
	to third party other than Sentry. For further inquiry, please e-mail
	<a href="mailto:notrains@phy25.com">notrains@phy25.com</a>.
</p>-->
