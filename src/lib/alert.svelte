<script lang="ts">
    const {children, onclick = undefined, sticky = false, clickBtnText = undefined} = $props();
</script>

{#if sticky}
    <div class="alert sticky">
        <div class="alert-content">
            <div>⚠️</div>
            <div class="alert-text">{@render children?.()}</div>
        </div>
        {#if clickBtnText}
            <button onclick={onclick}>{clickBtnText}</button>
        {/if}
    </div>
{:else}
    
    {#if clickBtnText}
        <div class="alert">
            <div class="alert-content">
                <div>⚠️</div>
                <div class="alert-text">{@render children?.()}</div>
            </div>
            {#if clickBtnText && onclick}
                <button onclick={onclick}>{clickBtnText}</button>
            {/if}
        </div>
    {:else}
        {#if onclick}
            <!-- svelte-ignore a11y_invalid_attribute -->
            <a class="alert alert-content" onclick={onclick} href="">
                <div>⚠️</div> <div class="alert-text">{@render children?.()}</div>
            </a>
        {:else}
            <div class="alert alert-content">
                <div>⚠️</div> <div class="alert-text">{@render children?.()}</div>
            </div>
        {/if}
    {/if}
{/if}

<style>
a.alert {
    text-decoration: none;
}

.alert {
    margin: 0.5em 0;
    background: #C9E3F5;
    color: #000;
    display: flex;
    align-items: center;
    gap: 0.3em;
    border-radius: 0.5em;
}

.alert-content {
    display: flex;
    align-items: baseline;
    gap: 0.3em;
    flex: 1;
}

.alert > * {
    padding: 0.6em 0;
}

.alert > :first-child {
    padding-left: 0.4em;
}

.alert > :last-child {
    padding-right: 0.4em;
}

.alert.sticky {
    position: sticky;
    bottom: 1em;
    left: 0;
    z-index: 100;
    max-width: 100%;
    margin: 0em;
}

.alert div.alert-text {
    flex: 1;
    padding-right: 0.5em;
}

.alert > button, .alert > button:last-child {
    background: none;
    border: none;
    border-left: 1px solid #ACD4F0;
    border-radius: 0 0.5em 0.5em 0;
    color: inherit;
    cursor: pointer;
    padding: 0.6em 0.8em;
    align-self: stretch;
    font-size: 1em;
    min-height: 48px;
}

.alert > button:hover {
    background: #ACD4F0;
}

.alert > button:focus {
    outline: 2px solid #000;
}

</style>