export const prerender = true;
export const ssr = false;

import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { isExpiredMarker, type ArchivedAlertFile, type ArchiveEntry, type MbtaAlert } from '$lib/mbta-types';

function lastRealAlert(entries: ArchiveEntry[]): MbtaAlert | null {
    for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        if (!isExpiredMarker(entry)) return entry;
    }
    return null;
}

export const load: PageLoad = async ({ url, fetch }) => {
    const alertId = url.searchParams.get('id');

    if (!alertId) {
        return {
            alertId: null as string | null,
            currentAlert: null as MbtaAlert | null,
            pastHistory: [] as ArchiveEntry[],
            routeMap: new Map<string, any>(),
            archiveError: false,
            mbtaExpired: false,
        };
    }

    let archiveData: ArchivedAlertFile | null = null;
    let archiveError = false;
    try {
        const r = await fetch(`https://t-alerts-archive.notrains.today/alerts/${alertId}.json`);
        if (!r.ok) throw new Error(`Archive fetch failed: ${r.status}`);
        archiveData = await r.json();
    } catch {
        archiveError = true;
    }

    const archiveHistory: ArchiveEntry[] = archiveData?.data ?? [];
    const storedExpired = archiveHistory.length > 0 && archiveHistory[archiveHistory.length - 1].type === 'expired';

    let mbtaExpired = false;
    let mbtaData: any = null;

    if (storedExpired) {
        // Archive already recorded expiry — trust it, skip the live MBTA call entirely.
        mbtaExpired = true;
    } else {
        // Not known-expired yet (archive says active, or archive fetch failed) — presumed active,
        // cron data may be up to ~5 min stale, so confirm against the live feed.
        try {
            const r = await fetch(`https://api-v3.mbta.com/alerts/${alertId}?include=routes`, {
                headers: { 'Accept': 'application/vnd.api+json' },
            });
            if (r.ok) {
                mbtaData = await r.json();
            } else {
                mbtaExpired = true;
            }
        } catch {
            // Live check failed (network error) — do not treat as expired on a transient failure.
        }
    }

    const routeMap = new Map<string, any>(
        (mbtaData?.included ?? [])
            .filter((entity: any) => entity.type === 'route')
            .map((route: any) => [route.id, route])
    );

    if (!archiveData && !mbtaData) {
        error(404, 'Alert not found');
    }

    let currentAlert: MbtaAlert | null;
    let pastHistory: ArchiveEntry[] = [...archiveHistory];

    if (mbtaExpired) {
        // Alert is gone from MBTA; show all archive entries (incl. expiry markers) as history, no "current"
        currentAlert = null;
    } else {
        // Exclude the latest archive entry (matches current), show in reverse chronological order
        currentAlert = mbtaData?.data ?? lastRealAlert(archiveHistory);
    }

    return {
        alertId,
        currentAlert,
        pastHistory,
        routeMap,
        archiveError,
        mbtaExpired,
    };
};
