<script lang="ts">
import { isDebug } from "$lib/common";

let isDebugOn = $state(isDebug());
let date = $state(localStorage.getItem('debugDate') || '');
let nightOwl = $state(localStorage.getItem('debugNightOwl') || 'auto');

const onDateChange = (e: Event) => {
    localStorage.setItem('debugDate', date);
};

const onNightOwlChange = (e: Event) => {
    localStorage.setItem('debugNightOwl', nightOwl);
};

const exitDebug = () => {
    localStorage.removeItem('debugDate');
    isDebugOn = false;
    location.href = '/about';
};
</script>

{#if isDebugOn}
<h2>Debugger</h2>

<form>
    <p><label>Force date <input type="date" bind:value={date} onchange={onDateChange} /></label></p>
    <p><label>Force night owl
        <select bind:value={nightOwl} onchange={onNightOwlChange}>
            <option value="auto">auto</option>
            <option value="true">true</option>
            <option value="false">false</option>
        </select>
    </label></p>
    <p><button type="button" onclick={exitDebug}>Exit debug mode</button></p>
</form>
{/if}