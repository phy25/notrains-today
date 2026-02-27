<script lang="ts">
import '$lib/style.css';
import type { PageProps } from './$types';
import { DateFormatter, parseZonedDateTime, toCalendarDate, now } from '@internationalized/date';
import { MBTA_TIMEZONE, type MbtaAlert } from '$lib/mbta-types';
import { getEffect, getEffectWithLineMessage, getUniqueRoutesForDisplay } from '$lib/mbta-display';
import { getDateString } from '$lib/calendar';
import { m } from '$lib/paraglide/messages';
import { getLocale } from '$lib/paraglide/runtime';
import { isDebug } from '$lib/common';
import Header from '../../header.svelte';
import MbtaRouteBadgeCompound from '$lib/mbta-route-badge-compound.svelte';

const { data }: PageProps = $props();

const currentServiceDate = new Date();

const alertTitle = $derived.by(() => {
    if (!data.currentAlert) return null;
    const effect = data.currentAlert.attributes.effect as any;
    const uniqueRoutes = getUniqueRoutesForDisplay(data.currentAlert);
    if (uniqueRoutes.length === 1) {
        const routeId = uniqueRoutes[0];
        const attrs = (data.routeMap.get(routeId) as any)?.attributes;
        return getEffectWithLineMessage(effect, routeId, attrs);
    }
    return getEffect(effect);
});
</script>

{#snippet alertView(alert: MbtaAlert)}
    {@const effect = alert.attributes.effect as any}
    {@const unique_routes_display = getUniqueRoutesForDisplay(alert)}
    {@const descriptionArr = alert.attributes?.description?.split(/\r?\n/g) || []}
    {@const updatedAtDate = parseZonedDateTime(alert.attributes.updated_at + '[' + MBTA_TIMEZONE + ']').toDate()}
    <div class="alert-card">
        <div class="alert-header">
            {#if unique_routes_display.length == 1}
                {@const route_id = unique_routes_display[0]}
                {@const attributes = (data.routeMap.get(route_id) as any)?.attributes}
                <span class="badge-group"><MbtaRouteBadgeCompound type="long" routeId={route_id} routeAttributes={attributes} /></span>
                <span class="alert-effect">{getEffectWithLineMessage(effect, route_id, attributes)}</span>
            {:else}
                <div class="badge-groups">
                    {#each unique_routes_display as route_id}
                        {@const attributes = (data.routeMap.get(route_id) as any)?.attributes}
                        <span class="badge-group"><MbtaRouteBadgeCompound type="long" routeId={route_id} routeAttributes={attributes} /></span>
                    {/each}
                </div>
                <span class="alert-effect">{getEffect(effect)}</span>
            {/if}
        </div>

        <p class="alert-headline">{alert.attributes.header}</p>

        {#if alert.attributes.image}
        <div class="alert-image-container">
            <img src={alert.attributes.image} alt={alert.attributes.image_alternative_text} loading="lazy" />
        </div>
        {/if}

        {#if descriptionArr.length > 0}
        <p class="alert-description">
            {#each descriptionArr as text, index}
                {#if index > 0}<br />{/if}
                {text}
            {/each}
        </p>
        {/if}

        <p class="alert-meta"><em>
            {#if alert.attributes?.url}
                {m.learnMoreAt()}<a href={alert.attributes.url} target="_blank">{alert.attributes.url}</a> ({m.alert()} #{alert.id})
            {:else}
                <a href="https://www.mbta.com/schedules/{unique_routes_display[0]}/alerts" target="_blank">{m.alert()} #{alert.id}</a>
            {/if}
        </em></p>
    </div>
{/snippet}

<svelte:head>
    <title>{alertTitle ? `${alertTitle} - notrains.today` : 'Alert - notrains.today'}</title>
</svelte:head>

<Header />

<div class="page-content">
    {#if data.currentAlert}
        {@render alertView(data.currentAlert)}
    {:else if data.mbtaExpired}
        <p class="alert-status-expired">{m.alertExpired()}</p>
    {/if}

    {#if data.alertId}
        {#if data.pastHistory.length > 0}
        <section class="past-history">
            <h2>{m.alertPastHistory()}</h2>
            <ol class="timeline">
                {#each data.pastHistory as historicalAlert, i}
                    {@const updatedAtDate = parseZonedDateTime(historicalAlert.attributes.updated_at + '[' + MBTA_TIMEZONE + ']').toDate()}
                    {@const dateFormatter = new DateFormatter(getLocale(), { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: MBTA_TIMEZONE })}
                    {@const descriptionArr = historicalAlert.attributes?.description?.split(/\r?\n/g) || []}
                    {@const prevAlert = i === 0 ? null : data.pastHistory[data.pastHistory.length - i]}
                    {@const isDitto = data.pastHistory.length === 1 || (prevAlert !== null &&
                        historicalAlert.attributes.header === prevAlert.attributes.header &&
                        (historicalAlert.attributes.description ?? null) === (prevAlert.attributes.description ?? null))}
                    <li class="timeline-item">
                        <time class="timeline-date">{dateFormatter.format(updatedAtDate)}</time>
                        <details class="timeline-details">
                            <summary class="timeline-summary {isDitto ? 'timeline-summary-ditto' : ''}">{isDitto ? m.alertHistoryDitto() : historicalAlert.attributes.header}</summary>
                            {#if !isDitto}
                            {#if historicalAlert.attributes.image}
                            <div class="alert-image-container">
                                <img src={historicalAlert.attributes.image} alt={historicalAlert.attributes.image_alternative_text} loading="lazy" />
                            </div>
                            {/if}
                            {#if descriptionArr.length > 0}
                            <p class="timeline-description">
                                {#each descriptionArr as text, index}
                                    {#if index > 0}<br />{/if}
                                    {text}
                                {/each}
                            </p>
                            {/if}
                            {#if historicalAlert.attributes.url}
                            <p class="timeline-url"><a href={historicalAlert.attributes.url} target="_blank">{historicalAlert.attributes.url}</a></p>
                            {/if}
                            {/if}
                            {#if isDebug()}
                            <pre class="timeline-debug">{JSON.stringify(historicalAlert, null, 2)}</pre>
                            {/if}
                        </details>
                    </li>
                {/each}
            </ol>
        </section>
        {:else if data.archiveError}
        <section class="past-history">
            <h2>{m.alertPastHistory()}</h2>
            <p>{m.alertFetchError()}</p>
        </section>
        {/if}
    {:else}
        <p>No alert ID provided.</p>
    {/if}

    <footer>
        <p>
            <span class="notranslate">☺ notrains.today</span>
            <a href="/about">{m.footerAbout()}</a>
        </p>
    </footer>
</div>

<style>
@import '../../alert-detail.css';

.page-content {
    padding: 1em 0.4em;
}
.alert-card {
    margin-bottom: 1em;
}
.alert-header {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.3em;
    margin-bottom: 0.3em;
    --badge-size: 1.3em;
}
.badge-groups {
    display: inline-flex;
    gap: 0.3em;
    flex-wrap: wrap;
}
.badge-group {
    user-select: none;
}
.alert-effect {
    font-weight: bold;
}
.alert-headline {
    margin-top: 0.2em;
}
.alert-description {
    white-space: pre-line;
}
.alert-meta {
    color: var(--text-secondary, #555);
    font-size: 0.9em;
}
.alert-status-expired {
    font-style: italic;
    color: var(--text-secondary, #555);
}
.past-history {
    margin-top: 1.5em;
    border-top: 1px solid var(--border-color, #ddd);
    padding-top: 0.5em;
}
.timeline {
    list-style: none;
    padding: 0;
    margin: 0.5em 0 0;
    position: relative;
}
.timeline::before {
    content: '';
    position: absolute;
    left: 0.3em;
    top: 0.45em;
    bottom: 0.2em;
    width: 0.1em;
    background: var(--border-color, #ddd);
}
.timeline-item {
    position: relative;
    padding-left: 1.6em;
    margin-bottom: 1.4em;
}
.timeline-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.35em;
    width: 0.7em;
    height: 0.7em;
    border-radius: 50%;
    background: var(--border-color, #ddd);
    box-sizing: border-box;
}
.timeline-date {
    display: block;
    font-size: 0.85em;
    color: var(--text-secondary, #555);
    margin-bottom: 0.25em;
}
.timeline-details {
    margin-top: 0.1em;
}
.timeline-summary {
    cursor: pointer;
    font-size: 0.95em;
    display: inline-block;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5em;
    list-style: none;
}
.timeline-summary::-webkit-details-marker {
    display: none;
}
.timeline-summary::after {
    content: '▶';
    display: inline-block;
    color: var(--text-secondary, #555);
    font-size: 1em;
    margin-left: 0.5em;
    transition: transform 0.15s;
}
details[open] > .timeline-summary::after {
    transform: rotate(90deg);
}
.timeline-description {
    white-space: pre-line;
    margin: 0.5em 0 0;
    font-size: 0.95em;
}
.timeline-url {
    margin: 0.4em 0 0;
    font-size: 0.9em;
}
.timeline-summary-ditto {
    color: var(--text-secondary, #555);
    font-style: italic;
}
.timeline-summary-ditto::after {
    font-style: normal;
}
.timeline-debug {
    margin: 0.5em 0 0;
    font-size: 0.75em;
    white-space: pre-wrap;
    word-break: break-all;
    background: var(--bg-secondary, #f5f5f5);
    border: 1px solid var(--border-color, #ddd);
    padding: 0.5em;
    border-radius: 4px;
    max-height: 20em;
    overflow-y: auto;
}
</style>
