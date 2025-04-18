<script lang="ts">	
	import { isDebug } from '$lib/common';
	import { QUERY_ROUTE_TYPE_MAPPING } from '$lib/mbta-types';
	import { m } from '$lib/paraglide/messages';
	import { getFeedback } from '@sentry/sveltekit';
	import type { LayoutProps } from './$types';
	import { afterNavigate } from '$app/navigation';

	const { children }: LayoutProps = $props();
	
	const tab_id = 'today';
	let debugClickTimes = 0;
	const trackDebugClicks = () => {
		debugClickTimes++;
		if (debugClickTimes == 5) {
			localStorage.setItem('debugDate', '');
			location.href = '/about?debug';
		}
	};
	afterNavigate(() => {
		debugClickTimes = 0;
	});
	let feedbackBtnDom: HTMLButtonElement;
	$effect(() => {
		if (feedbackBtnDom) {
			const feedback = getFeedback();
			feedback?.attachTo(feedbackBtnDom, {
				formTitle: "Send feedback",
			});
		}
	});
</script>

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
		{#if isDebug()}
		<p>
			{#each Object.keys(QUERY_ROUTE_TYPE_MAPPING) as type}
				<a href="/{type}">{type}</a>{' '}
			{/each}
		</p>
		{/if}

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<p onclick={trackDebugClicks}>
			<span class="notranslate">☺ notrains.today</span>
			<a href="/about">{m.footerAbout()}</a>
			<button bind:this={feedbackBtnDom} type="button" class="link" onclick={(event)=>{(event.target as HTMLButtonElement).blur();/* get autofocus in the sentry dialog working */return false;}}>{m.footerFeedback()}</button></p>
	</footer>
</div>

<style>
:global {
	html {
		font-size: 16px;
		font-family: Inter, "Helvetica Neue", Helvetica, Arial, sans-serif;
	}
	body {
		margin: 0;
		--page-content-max-width: 56rem;
		--page-content-min-width: 18rem;
		--color-accent: #1F6DA5;
	}
	a, button.link {
		color: #195581;
	}
	@media (prefers-color-scheme: dark) {
		body {
			--color-accent: #92C6EA;
		}
		a, button.link {
			color: #A0C4FF;
		}
	}
	button.link {
		appearance: none;
		text-decoration: underline;
		border: none;
		background: none;
		font-size: 1em;
    	padding: 0;
		cursor: pointer;
	}
	.page-content {
		margin: 0 auto;
		padding: 0 0.4em;
		width: 100%;
		max-width: var(--page-content-max-width);
		min-width: var(--page-content-min-width);
		box-sizing: border-box;
	}
}

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