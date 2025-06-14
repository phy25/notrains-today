<script lang="ts">
	import { MBTA_TIMEZONE } from '$lib/mbta-types';
    import { getLocale } from '$lib/paraglide/runtime';
    import { DateFormatter, type CalendarDate } from '@internationalized/date';

    const { date }: {date: CalendarDate | null} = $props();
</script>

{#if date}
    {@const dayString = new DateFormatter(getLocale() || 'en', {weekday: 'short'}).format(date.toDate(MBTA_TIMEZONE))}
    <div class="calendar-icon" aria-label={date.toString() + ' ' + dayString}>
        <div class="day">{dayString}</div>
        <div class="date">{date.day}</div>
    </div>&nbsp;
{:else}
    🗓️
{/if}&nbsp;

<style>
.calendar-icon {
    display: inline-flex;
    flex-direction: column;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.2rem;
    text-align: center;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    vertical-align: text-top;
}
.calendar-icon .day {
    background-color: #C13225;
    color: white;
    font-size: 0.35rem;
    line-height: 0.45rem;
    height: 0.45rem;
    padding: 0.05rem 0 0;
    border-top-left-radius: 0.2rem;
    border-top-right-radius: 0.2rem;
    text-transform: uppercase;
}
.calendar-icon .date {
    font-size: 0.6rem;
    line-height: 0.7rem;
    padding: 0.05rem 0 0;
    height: 0.7rem;
    color: #333;
    background: #F0F0F0;
    border-bottom-left-radius: 0.2rem;
    border-bottom-right-radius: 0.2rem;
}
</style>