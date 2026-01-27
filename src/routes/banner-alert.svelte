<script lang="ts">
	import { getFormattedTime, getEffect } from "$lib/mbta-display";
	import { MBTA_URGENT_SEVERITY } from "$lib/mbta-overides";
	import { SECONDARY_SYMBOLS } from "$lib/mbta-symbols";
	import { m } from "$lib/paraglide/messages";

    const { alert } = $props();
    const descriptionArr = $derived(alert.attributes?.description?.split(/\r?\n/g) || []);
    const isUrgent = $derived(alert.attributes?.severity >= MBTA_URGENT_SEVERITY);
</script>

<div class="alert-banner {isUrgent ? 'urgent' : ''}">
    <h2 class="alert-banner-title">{isUrgent ? (SECONDARY_SYMBOLS.ALERT_COLOR.symbol + ' ') : ''}{getEffect(alert.attributes.effect)}</h2>
    <p class="alert-banner-description">
        {alert.attributes.banner}
    </p>
    {#if alert.attributes.image || descriptionArr.length > 0}
    <details>
        <summary>{m.learnMore()}</summary>
        {#if alert.attributes.image}
        <div class="alert-image-container">
            <img src={alert.attributes.image} alt={alert.attributes.image_alternative_text} loading="lazy" />
        </div>
        {/if}

        {#if descriptionArr.length > 0}
        <p>
            {#each descriptionArr as text, index}
                {#if index > 0}
                    <br />
                {/if}
                {text}
            {/each}
        </p>
        {/if}

        {#if alert.attributes?.url}
        <p><em>{m.learnMoreAt()}<a href={alert.attributes?.url} target="_blank">{alert.attributes?.url}</a> ({m.alert()} #{alert.id})</em></p>
        {/if}
    </details>
    {/if}
    {#if alert.attributes?.updated_at}
        <p><em title={alert.attributes?.updated_at}>{m.lastUpdatedAtTime({time: getFormattedTime(alert.attributes?.updated_at)})}</em></p>
    {/if}
</div>

<style>
@import './alert-detail.css';

.alert-banner {
    --background-color: #DDD;
    background-color: var(--background-color);
    color: #121212;
    padding: 0.5rem 0.3rem 0.5rem 0.5rem;
    border-radius: 0.3rem;
    margin: 1rem 0;
    border-left: #195581 0.5rem solid;
}
@media (min-width: 40rem) {
    .alert-banner {
        padding: 0.5rem 0.8rem;
    }
}
.alert-banner.urgent {
    border-left-color: #814418;
}
.alert-banner :first-child {
    margin-top: 0rem;
}
.alert-banner h2 {
    color: #195581;
    margin: 0;
    font-size: 1.2rem;
}
.alert-banner.urgent h2 {
    color: #814418;
}
.alert-banner p, .alert-banner details {
    margin: 0.5rem 0 0;
}
.alert-banner details :first-child {
    margin-top: 0.5rem;
}
</style>