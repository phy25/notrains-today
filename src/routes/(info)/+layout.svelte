<script lang="ts">
	import '$lib/style.css';
	import { isDebug } from '$lib/common';
	import { m } from '$lib/paraglide/messages';
	import type { LayoutProps } from './$types';
	import Header from '../header.svelte';

	const { children }: LayoutProps = $props();
	
	const tab_id = 'today';
	let feedbackBtnDom: HTMLButtonElement;
	$effect(() => {
		feedbackBtnDom;
		import('@sentry/sveltekit').then(
			({ getFeedback }) => {
				if (feedbackBtnDom) {
					const feedback = getFeedback();
					feedback?.attachTo(feedbackBtnDom, {
						formTitle: "Send feedback",
					});
				}
			}
		);
	});
</script>

<svelte:head>
  <title>notrains.today {m.footerAbout()}</title>
</svelte:head>

<Header></Header>

<div class="page-content">
	{@render children()}
	<footer>
		<p>
			<span class="notranslate">☺ notrains.today</span>
			<a href="/about">{m.footerAbout()}</a>
			<button bind:this={feedbackBtnDom} type="button" class="link" onclick={(event)=>{(event.target as HTMLButtonElement).blur();/* get autofocus in the sentry dialog working */return false;}}>{m.footerFeedback()}</button>
		</p>
	</footer>
</div>

<style>
</style>