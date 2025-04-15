<script lang="ts">
import Calendar from '../calendar.svelte';

import { m } from '$lib/paraglide/messages';
import type { PageProps } from './$types';
import type { Snapshot } from '@sveltejs/kit';
import { parseDate, type DateValue } from '@internationalized/date';
import { page } from '$app/state';
	import DebugAllAlerts from '../debug-all-alerts.svelte';

const { data }: PageProps = $props();

const isValidDate = (date: DateValue) => {
  return data.current_service_date.compare(date) <= 0;
};

let calendarComponent: Calendar | undefined = $state();

// TODO: move this as part of data maybe
const dayDefault = (() => {
  const params = new URLSearchParams((page.url.hash || '').substring(1));
  if (params.get('date')) {
    try {
      const parsed = parseDate(params.get('date') || '');
      if (isValidDate(parsed)) {
        // get rid of the parameter in the URL
        history.replaceState(history.state, '', './calendar');
        setTimeout(() => {calendarComponent?.scrollToDayDetail();}, 0);
        return parsed;
      }
    } catch (e) {
      // date error
    }
  }
  return data.current_service_date;
})();
let dayValue = $state(dayDefault);

export const snapshot: Snapshot<string> = {
  capture: () => {return dayValue.toString();},
  restore: (value) => {
    const parsed = parseDate(value);
    // only propogate if the date is current or in the future
    if (isValidDate(parsed)) {
      dayValue = parsed;
    }
  }
};
</script>

{#if data.data.length > 0}
    <Calendar
        bind:dayValue={dayValue}
        bind:this={calendarComponent}
        alertsByDay={data.alertsByDay}
        routeMap={data.routeMap}
        currentServiceDate={data.current_service_date}
        showNightOwl={data.is_current_service_night_owl}
        />
    
    <DebugAllAlerts data={data.data} routeMap={data.routeMap} />
{/if}

<style>
</style>