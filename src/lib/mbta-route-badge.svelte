<script lang="ts">
    const { pillLabel, color, textColor, type = 'auto' } = $props();

    let fullName = 'Red line';
</script>

{#if pillLabel.length < 3 && type !== 'long'}
<span class="route-badge notranslate" style="background-color: {color}; color: {textColor};" title={fullName} aria-label={fullName}>
    <span>{pillLabel}</span>
</span>
{:else}
<span class="route-badge route-badge-long notranslate" style="background-color: {color}; color: {textColor};" title={fullName} aria-label={fullName}>
    <span>{pillLabel}</span>
</span>
{/if}

<style>
    .route-badge {
        display: inline-flex;
        font-family: sans-serif;
        border-radius: 0.5em;
        min-width: 1em;
        height: 1em;
        align-items: center;
        justify-content: center;
        font-size: 1em;
        white-space: nowrap;
    }
    .route-badge span {
        line-height: 1rem;
        font-size: 0.6em;
        font-weight: bold;
    }

    .route-badge-long {
        min-width: 1.1em;
        padding: 0 0.25em;
    }
    .route-badge-long span {
        
    }
</style>