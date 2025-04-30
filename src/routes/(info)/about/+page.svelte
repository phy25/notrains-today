<script lang="ts">
	import '$lib/style.css';
	import { m } from '$lib/paraglide/messages';
	import { locales, setLocale, getLocale, type Locale } from '$lib/paraglide/runtime';
	import Debugger from './debugger.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	function switchToLanguage(newLanguage: Locale) {
		setLocale(newLanguage);
		return;
	}

	const untranslatedLegalDisclaimer = m.untranslatedLegalDisclaimer();
	const feedbackPlaceholder = '%%%FEEDBACK%%%';
	const aboutDescriptionContactArray = m.aboutDescriptionContact({feedback: feedbackPlaceholder}).split(feedbackPlaceholder);
	const aboutDescFeedbackClick = () => {
		(document.querySelector('footer button.feedback') as HTMLButtonElement)?.click();
	};
	const currentLocale = getLocale();
</script>

<Debugger />

<h2 id="languages">Languages</h2>

<ul>
{#each locales as locale}
	<li>
		{#if locale === currentLocale}
			<strong>{m.currentLocaleName({}, { locale: locale })}</strong>
		{:else}
			<button onclick={() => switchToLanguage(locale)} class="link">
				{m.currentLocaleName({}, { locale: locale })}
			</button>
		{/if}
	</li>
{/each}
</ul>

<details>
	<summary>Contribute to translations</summary>
	<p>
		<a href="https://fink.inlang.com/github.com/phy25/notrains-today">Contribute to translations through Fink</a>.
		A GitHub account is required, and the third-party translation tool Fink terms of use may apply.
		Alternatively, you may translate the inlang files locally and submit it through GitHub Pull Request.
	</p>
</details>

<h2 id="about">{m.aboutThisSite()}</h2>
<p>{m.aboutDescriptionOne()}</p>
<p>{m.aboutDescriptionTwo()}{#each aboutDescriptionContactArray as text, i}{text}{#if i == 0}<button class="link" onclick={aboutDescFeedbackClick}>{m.footerFeedback()}</button>{/if}{/each}</p>

<p>
	{m.currentVersion()} <code>{data.version.substring(0, 8) || 'edge'}</code>
	<em>{untranslatedLegalDisclaimer}</em>
	You can find more information about <a href="https://github.com/phy25/notrains-today">this software on GitHub</a>.
	For example, this is what changed in the latest version:
</p>
{#if (data.githubResponse || [])[0]?.commit?.message}
<ul>
	<li style="word-wrap: break-word;">
		{data.githubResponse[0]?.commit?.message?.split('\n')[0]}
		<a href="https://github.com/phy25/notrains-today/commit/{data.version}">(commit)</a>
	</li>
</ul>
{/if}

<h2>{m.privacyPolicy()}</h2>

{#if untranslatedLegalDisclaimer}
	<p><em>{untranslatedLegalDisclaimer}</em></p>
{/if}

<p>
	notrains.today uses session cookies to save your language preference.
	You can disable cookies in your browser settings.
</p>
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
<p>
	notrains.today uses data service from GitHub, a Delaware-based company in the United
	States. <a
		href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
		>Privacy policy of GitHub, Inc. can be found here.</a
	>
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
