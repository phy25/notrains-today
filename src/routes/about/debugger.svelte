<script lang="ts">
import { isDebug } from "$lib/common";

let isDebugOn = $state(isDebug());
let date = $state(localStorage.getItem('debugDate') || '');

const onDateChange = (e: Event) => {
    localStorage.setItem('debugDate', date);
};

const exitDebug = () => {
    localStorage.removeItem('debugDate');
    isDebugOn = false;
};
</script>

{#if isDebugOn}
<h2>Debugger</h2>

<form>
    <label>Force date <input type="date" bind:value={date} onchange={onDateChange} /></label>
    <p><button type="button" onclick={exitDebug}>Exit debug mode</button></p>
</form>
{/if}