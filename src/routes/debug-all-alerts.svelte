<script lang="ts">
import { isDebug } from "$lib/common";
import { getPillName, getEffectWithLineMessage, getLineName } from "$lib/mbta-display";
import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
import { m } from "$lib/paraglide/messages";

const {data, routeMap} = $props();
</script>

{#if data.length > 0 && isDebug() }    
    <details>
        <summary>{m.debugAllAlerts()}</summary>

        {#each data as alert}
            {@const effect = alert.attributes.effect}
            {@const route_id = alert.attributes.informed_entity[0].route}
            {@const attributes = (routeMap.get(route_id) as any)?.attributes}
            {@const color = attributes?.color ? '#' + attributes?.color : 'inherit'}
            {@const textColor = attributes?.text_color ? '#' + attributes?.text_color : 'inherit'}
            <div>
                {#if route_id}<MbtaRouteBadge type="long" pillLabel={getPillName(route_id, attributes)} color={color} textColor={textColor} fullName={getLineName(route_id, attributes)} />{/if}
                <mark>{getEffectWithLineMessage(effect, route_id, attributes)}</mark>
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