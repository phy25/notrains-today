/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your Worker in action
 * - Run `npm run deploy` to publish your Worker
 *
 * Bind resources to your Worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

interface MbtaAlert {
	attributes: {
		active_period: { end?: string; start: string }[];
		banner: string | null;
		cause: string;
		created_at: string;
		description: string;
		duration_certainty: string;
		effect: string;
		header: string;
		image: string | null;
		image_alternative_text: string | null;
		informed_entity: {
			stop: string;
			route_type: number;
			route: string;
			activities: string[];
			trip: string | null;
			direction_id: number | null;
		}[];
		lifecycle: string;
		service_effect: string;
		severity: number;
		short_header: string;
		timeframe: string;
		updated_at: string;
		url: string | null;
	};
	id: string;
	links: {
		self: string;
	};
	type: string;
}

interface MbtaApiResponse {
	data: MbtaAlert[];
}

interface ExpiredMarker {
	type: 'expired';
	expiredAt: string;
	expiredAroundAfter: string;
}

type ArchiveEntry = MbtaAlert | ExpiredMarker;

interface ArchivedAlertFile {
	data: ArchiveEntry[];
}

interface LatestUpdateEntry {
	signature: string;
	updatedAt: string;
	lastSeenAt: string;
}

type LatestUpdates = Record<string, LatestUpdateEntry | string>;

const LATEST_UPDATES_KEY = 'latest-updates.json';
const CACHE_CONTROL = 'public, max-age=60';

function normalizedAttributesString(attrs: MbtaAlert['attributes']): string {
	const { timeframe: _t, updated_at: _u, ...rest } = attrs;
	return JSON.stringify(rest);
}

function computeSignature(alert: MbtaAlert): string {
	return normalizedAttributesString(alert.attributes);
}

function isSameAlertContent(existing: MbtaAlert, incoming: MbtaAlert): boolean {
	if (existing.attributes.updated_at === incoming.attributes.updated_at) {
		return true;
	}
	// Treat as same content if only `timeframe` (and `updated_at`) changed
	return normalizedAttributesString(existing.attributes) === normalizedAttributesString(incoming.attributes);
}

export default {
	async fetch(req) {
		return new Response('Not Found', { status: 404 });
	},

	// The scheduled handler is invoked at the interval set in our wrangler.jsonc's
	// [[triggers]] configuration.
	async scheduled(event, env, ctx): Promise<void> {
		try {
			const response = await fetch('https://api-v3.mbta.com/alerts?include=routes&filter%5Bactivity%5D=BOARD,EXIT,RIDE,BRINGING_BIKE');
			if (!response.ok) {
				console.error(`Failed to fetch MBTA alerts: ${response.status} ${response.statusText}`);
				return;
			}
			const data: MbtaApiResponse = await response.json();
			const alerts = data.data;
			const currentIds = new Set(alerts.map((a) => a.id));
			const nowIso = new Date().toISOString();

			let latestUpdates: LatestUpdates = {};
			try {
				const latestUpdatesResponse = await env.ALERTS_ARCHIVE.get(LATEST_UPDATES_KEY);
				if (latestUpdatesResponse) {
					latestUpdates = await latestUpdatesResponse.json();
				}
			} catch (error) {
				console.error('Failed to fetch/parse latest updates:', error);
			}

			let hasUpdates = false;

			for (const alert of alerts) {
				try {
					const currentUpdatedAt = alert.attributes.updated_at;
					const incomingSignature = computeSignature(alert);
					const prevEntry = latestUpdates[alert.id];
					const prevSignature = typeof prevEntry === 'object' && prevEntry !== null ? prevEntry.signature : undefined;

					if (prevSignature !== undefined && prevSignature === incomingSignature) {
						// Content unchanged since last recorded signature — no R2 GET needed.
						latestUpdates[alert.id] = { signature: prevSignature, updatedAt: currentUpdatedAt, lastSeenAt: nowIso };
						hasUpdates = true;
						continue;
					}

					const key = `alerts/${alert.id}.json`;
					const existing = await env.ALERTS_ARCHIVE.get(key);
					const existingData: ArchivedAlertFile = existing ? JSON.parse(await existing.text()) : { data: [] };
					const history = existingData.data ?? [];
					const last = history[history.length - 1];
					const isReappearing = !!last && last.type === 'expired';

					// Find the last real alert entry to compare content against (skip a trailing marker).
					const lastAlert = isReappearing
						? [...history].reverse().find((e): e is MbtaAlert => e.type !== 'expired')
						: (last as MbtaAlert | undefined);
					const contentChanged = isReappearing || !lastAlert || !isSameAlertContent(lastAlert, alert);

					if (!contentChanged) {
						// Unchanged, never expired — just refresh the tracking entry, no R2 write.
						latestUpdates[alert.id] = { signature: incomingSignature, updatedAt: currentUpdatedAt, lastSeenAt: nowIso };
						hasUpdates = true;
						continue;
					}

					history.push(alert); // reappearance always pushes fresh, even if content matches the pre-expiry entry
					await env.ALERTS_ARCHIVE.put(key, JSON.stringify({ data: history }), {
						httpMetadata: { cacheControl: CACHE_CONTROL },
					});

					latestUpdates[alert.id] = { signature: incomingSignature, updatedAt: currentUpdatedAt, lastSeenAt: nowIso };
					hasUpdates = true;

					console.log(`Updated history for alert ${alert.id} (length: ${history.length})`);
				} catch (error) {
					console.error(`Failed to store alert ${alert.id}:`, error);
				}
			}

			// Detect alerts that have disappeared from the feed since the last run and mark them expired.
			// Only consider ids already tracked in the new format (i.e. seen at least once under the
			// new code, so we have a real lastSeenAt to report). Legacy string-format entries are stale
			// tracking left over from before this migration — potentially a large backlog accumulated
			// over months, since the old code never pruned this file — and are just dropped from
			// tracking rather than bulk-processed, which would blow the per-invocation resource budget
			// and produce meaningless "just expired" timestamps for alerts that vanished long ago.
			for (const [id, entry] of Object.entries(latestUpdates)) {
				if (currentIds.has(id)) continue;
				if (typeof entry === 'string') {
					delete latestUpdates[id];
					hasUpdates = true;
					continue;
				}

				try {
					const key = `alerts/${id}.json`;
					const existing = await env.ALERTS_ARCHIVE.get(key);
					if (existing) {
						const existingData: ArchivedAlertFile = JSON.parse(await existing.text());
						const history = existingData.data ?? [];
						const last = history[history.length - 1];
						if (!last || last.type !== 'expired') {
							const after = entry.lastSeenAt;
							history.push({ type: 'expired', expiredAt: nowIso, expiredAroundAfter: after });
							await env.ALERTS_ARCHIVE.put(key, JSON.stringify({ data: history }), {
								httpMetadata: { cacheControl: CACHE_CONTROL },
							});
							console.log(`Marked alert ${id} expired (window ${after} .. ${nowIso})`);
						}
					} else {
						console.warn(`Tracked alert ${id} disappeared but no archive object exists`);
					}
				} catch (error) {
					console.error(`Failed to mark alert ${id} as expired:`, error);
				} finally {
					delete latestUpdates[id];
					hasUpdates = true;
				}
			}

			if (hasUpdates) {
				await env.ALERTS_ARCHIVE.put(LATEST_UPDATES_KEY, JSON.stringify(latestUpdates));
			}
		} catch (error) {
			console.error('Error in scheduled handler:', error);
		}
	},
} satisfies ExportedHandler<Env>;
