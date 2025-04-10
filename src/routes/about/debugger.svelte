<script lang="ts">
let isDebugOn = localStorage.getItem('debugDate') !== null;
let date = $state(localStorage.getItem('debugDate') || '');

const onDateChange = (e: Event) => {
    localStorage.setItem('debugDate', date);
};
</script>

{#if isDebugOn}
<h2>Debugger</h2>

<form>
    <label>Force date <input type="date" bind:value={date} onchange={onDateChange} /></label>
</form>
{/if}