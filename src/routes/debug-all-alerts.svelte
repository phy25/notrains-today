<script lang="ts">
import { getPillName, getEffectWithLineMessage } from "$lib/mbta-display";
import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
import { m } from "$lib/paraglide/messages";

const {data, routeMap} = $props();
</script>

{#if data.length > 0}    
    <details>
        <summary>{m.debug_all_alerts()}</summary>

        {#each data as alert}
            {@const effect = alert.attributes.effect}
            {@const route_id = alert.attributes.informed_entity[0].route}
            {@const attributes = (routeMap.get(route_id) as any)?.attributes}
            {@const color = attributes?.color ? '#' + attributes?.color : 'inherit'}
            {@const textColor = attributes?.text_color ? '#' + attributes?.text_color : 'inherit'}
            <div>
                <MbtaRouteBadge type="long" pillLabel={getPillName(route_id, attributes)} color={color} textColor={textColor} />
                <mark>{getEffectWithLineMessage(effect, route_id)}</mark>
                {alert.id} {alert.attributes.short_header}
            </div>
            <pre><code>{JSON.stringify(alert)}</code></pre>
        {/each}
    </details>
{/if}

<style>
mark {
    background-color: #ff0;
    color: #000;
}
pre {
    white-space: pre-wrap;
    word-wrap: break-word;
}
</style>