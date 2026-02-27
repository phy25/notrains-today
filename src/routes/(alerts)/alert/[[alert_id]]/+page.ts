export const prerender = false;
export const ssr = false;

import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { MbtaAlert } from '$lib/mbta-types';

export const load: PageLoad = async ({ params, fetch }) => {
    const alertId = params.alert_id;

    if (!alertId) {
        return {
            alertId: null as string | null,
            currentAlert: null as MbtaAlert | null,
            pastHistory: [] as MbtaAlert[],
            routeMap: new Map<string, any>(),
            archiveError: false,
            mbtaExpired: false,
        };
    }

    const [archiveResult, mbtaResult] = await Promise.allSettled([
        fetch(`https://t-alerts-archive.notrains.today/alerts/${alertId}.json`)
            .then(async r => {
                if (!r.ok) throw new Error(`Archive fetch failed: ${r.status}`);
                return r.json();
            }),
        fetch(`https://api-v3.mbta.com/alerts/${alertId}?include=routes`, {
            headers: { 'Accept': 'application/vnd.api+json' },
        }).then(async r => ({ ok: r.ok, body: r.ok ? await r.json() : null })),
    ]);

    const archiveError = archiveResult.status === 'rejected';
    const archiveData = archiveResult.status === 'fulfilled' ? archiveResult.value : null;

    const mbtaFulfilled = mbtaResult.status === 'fulfilled' ? mbtaResult.value : null;
    const mbtaExpired = mbtaFulfilled !== null && !mbtaFulfilled.ok;
    const mbtaData = mbtaFulfilled?.ok ? mbtaFulfilled.body : null;

    const archiveHistory: MbtaAlert[] = archiveData?.data ?? [];

    const routeMap = new Map<string, any>(
        (mbtaData?.included ?? [])
            .filter((entity: any) => entity.type === 'route')
            .map((route: any) => [route.id, route])
    );

    if (!archiveData && !mbtaData) {
        error(404, 'Alert not found');
    }

    let currentAlert: MbtaAlert | null;
    let pastHistory: MbtaAlert[] = [...archiveHistory];

    if (mbtaExpired) {
        // Alert is gone from MBTA; show all archive entries as history, no "current"
        currentAlert = null;
    } else {
        // Exclude the latest archive entry (matches current), show in reverse chronological order
        currentAlert = mbtaData?.data
            ?? (archiveHistory.length > 0 ? archiveHistory[archiveHistory.length - 1] : null);
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
