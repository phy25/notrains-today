<script lang="ts">
	import '$lib/style.css';
	import { isDebug } from '$lib/common';
	import { m } from '$lib/paraglide/messages';
	import type { LayoutProps } from './$types';

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

<div class="tab-wrapper">
    <div class="tab {isDebug() && 'debug'}">
        <a class="tab-item {tab_id === 'today' && 'selected'}" href="/">
            <div class="tab-item-heading notranslate">
				notrains.today?
			</div>
            <div>
            </div>
        </a>
        <a class="tab-item" href="/calendar">
            <div class="tab-item-heading">{m.calendar()}</div>
            <div>
            </div>
        </a>
    </div>
</div>

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
.tab-wrapper {
    background: var(--background-color);
    --background-color: #195581;
    color: #FFF;
    padding: 0.4em;
    display: flex;
    justify-content: space-around;
	min-width: var(--page-content-min-width);
}
@media (max-width: 21rem) {
    .tab-wrapper {
        padding: 0.4em 0.2em;
    }
}
.tab {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: stretch;
    border: #FFF 1px solid;
    border-radius: 0.3em;
    padding: 0.2em;
    width: 100%;
    max-width: var(--page-content-max-width);
    min-width: var(--page-content-min-width);
	box-sizing: border-box;
	gap: 0.1em;
}
.tab-item {
    flex: 1;
    padding: 0.3em 0.6em;
    line-height: 1.4em;
    cursor: pointer;
    border-radius: 0.3em;
    text-decoration: none;
    color: inherit;
	transition: background-color 0.2s ease;
}
.tab-item:hover, .tab-item:focus {
    background: var(--background-color);
    --background-color: #DDD;
    color: #000;
	outline: none;
}
.tab-item.selected {
    background: var(--background-color);
    --background-color: #FFF;
    color: #000;
}
.tab.debug .tab-item.selected {
	background-image: repeating-linear-gradient(
		-45deg,
		#C9E3F5,
		#C9E3F5 10px,
		transparent 10px,
		transparent 2rem
	);
}
.tab .tab-item.selected:hover, .tab .tab-item.selected:focus {
	background: var(--background-color);
    --background-color: #EEE;
}
.tab-item-heading {
    font-weight: bold;
}
</style>