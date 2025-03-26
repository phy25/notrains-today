<script lang="ts">
	import MbtaRouteBadge from "$lib/mbta-route-badge.svelte";
	import { m } from "$lib/paraglide/messages";


</script>

<div class="glance-rapid-transit-grid">
    <div class="route-with-branches">
        <div class="badge-group">
            <MbtaRouteBadge pillLabel="GL" type="long" color="#00843d" textColor="#FFF"></MbtaRouteBadge>
            <MbtaRouteBadge pillLabel="B" type="secondary" color="#00843d" textColor="#FFF"></MbtaRouteBadge>
        </div>
        <MbtaRouteBadge pillLabel="C" color="#00843d" textColor="#FFF"></MbtaRouteBadge>
        <MbtaRouteBadge pillLabel="D" color="#00843d" textColor="#FFF"></MbtaRouteBadge>
        <MbtaRouteBadge pillLabel="E" color="#00843d" textColor="#FFF"></MbtaRouteBadge>
    </div>
    <div class="route-with-branches">
        <div class="badge-group">
            <MbtaRouteBadge pillLabel="RL" type="long" color="#da291c" textColor="#FFF"></MbtaRouteBadge>
            <MbtaRouteBadge pillLabel="M" type="secondary" color="#da291c" textColor="#FFF"></MbtaRouteBadge>
        </div>
    </div>
    <div>
        <MbtaRouteBadge pillLabel="OL" type="long" color="#ed8b00" textColor="#FFF"></MbtaRouteBadge>
        <span>✅</span> <span style="display: inline-block">{m.no_alert()}</span>
    </div>
    <div>
        <MbtaRouteBadge pillLabel="BL" type="long" color="#003da5" textColor="#FFF"></MbtaRouteBadge>
        <span>◤</span> <span style="display: inline-block">{m["mbta_alert_effect.STATION_CLOSURE"]()}</span>
    </div>
    <div class="route-expanded">
        <MbtaRouteBadge pillLabel="Bus" type="long" color="#ffc72c" textColor="#000"></MbtaRouteBadge>
    </div>
    <div class="route-expanded">
        <MbtaRouteBadge pillLabel="Commuter Rail" type="long" color="#80276c" textColor="#FFF"></MbtaRouteBadge>
    </div>
    <div class="route-expanded">
        <MbtaRouteBadge pillLabel="Ferry" type="long" color="#008eaa" textColor="#FFF"></MbtaRouteBadge>
    </div>
</div>

<style>
.glance-rapid-transit-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5em;
    width: 100%;
}
.glance-rapid-transit-grid > .route-with-branches {
    grid-row: 1 / span 1;
}
.glance-rapid-transit-grid > .route-expanded {
    grid-column: 1 / -1;
}

@media (max-width: 320px) {
    .glance-rapid-transit-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    .glance-rapid-transit-grid > .route-with-branches {
        grid-row: 1 / span 1;
    }
}

.glance-rapid-transit-grid > div {
    --badge-size: 1.2em;
    line-height: 1.2em;
    display: flex;
    flex-wrap: wrap;
    align-content: baseline;
    align-items: flex-start;
    gap: 0.2em 0.1em;
}
.badge-group {
    display: flex;
    gap: 0;
}
</style>