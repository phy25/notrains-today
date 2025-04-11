<script lang="ts">
	import { getPillName } from "./mbta-display";
	import MbtaRouteBadge from "./mbta-route-badge.svelte";

const { routeId, routeAttributes, type = 'auto' } = $props();

const [firstPillLabel, compoundSecondPillLabel] = $derived.by(() => {
    if (routeId.startsWith('Green-')) {
        return ['GL', routeId.replace('Green-', '')];
    }
    if (routeId.startsWith('Red-')) {
        return ['RL', routeId.replace('Red-', '')];
    }
    if (routeId === 'Mattapan') {
        return ['RL', 'M'];
    }
    return [getPillName(routeId, routeAttributes), null]
    
});
const color = $derived((routeAttributes?.color) ? '#' + routeAttributes?.color : 'inherit');
const textColor = $derived((routeAttributes?.text_color) ? '#' + routeAttributes?.text_color : 'inherit');
</script>

{#if compoundSecondPillLabel}
<div class="badge-group">
    <MbtaRouteBadge pillLabel={firstPillLabel} {color} {textColor} type="long" />
    <MbtaRouteBadge pillLabel={compoundSecondPillLabel} {color} {textColor} type="secondary" />
</div>
{:else}
<MbtaRouteBadge pillLabel={firstPillLabel} {color} {textColor} {type} />
{/if}

<style>
.badge-group {
    display: inline-flex;
    gap: 0;
}
</style>