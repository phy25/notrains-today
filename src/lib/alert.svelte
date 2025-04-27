<script lang="ts">
    const {children, onclick = undefined} = $props();
</script>


{#if onclick}
    <!-- svelte-ignore a11y_invalid_attribute -->
    <a class="alert" onclick={onclick} href="">
        <div>⚠️</div> <div>{@render children?.()}</div>
    </a>
{:else}
    <div class="alert">
        <div>⚠️</div> <div>{@render children?.()}</div>
    </div>
{/if}

<style>
a.alert {
    text-decoration: none;
}

.alert {
    margin: 0.5em 0;
    padding: 0.6em 0.4em;
    background: #C9E3F5;
    color: #000;
    display: flex;
    align-items: baseline;
    gap: 0.3em;
    border-radius: 0.3em;
}

.alert > div:last-child {
    flex: 1;
}

</style>