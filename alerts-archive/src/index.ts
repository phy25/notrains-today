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

const LATEST_UPDATES_KEY = 'latest-updates.json';

function isSameAlertContent(existing: MbtaAlert, incoming: MbtaAlert): boolean {
	// A placeholder for whole-content block comparisons in the future.
	return existing.attributes.updated_at === incoming.attributes.updated_at;
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

			let latestUpdates: Record<string, string> = {};
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

					// Skip if we already have the latest version of this alert
					if (latestUpdates[alert.id] === currentUpdatedAt) {
						continue;
					}

					const key = `alerts/${alert.id}.json`;
					const existing = await env.ALERTS_ARCHIVE.get(key);
					let history: MbtaAlert[] = [];
					if (existing) {
						const existingText = await existing.text();
						const existingData: MbtaApiResponse = JSON.parse(existingText);
						history = existingData.data;
						// Just to be safe, check the last item's whole content block.
						// You can expand isSameAlertContent for more additional checks in the future.
						const latest = history[history.length - 1];
						if (latest && isSameAlertContent(latest, alert)) {
							latestUpdates[alert.id] = currentUpdatedAt;
							hasUpdates = true;
							continue; // No change
						}
					}
					history.push(alert);
					await env.ALERTS_ARCHIVE.put(key, JSON.stringify({ data: history }));

					// Update our cache
					latestUpdates[alert.id] = currentUpdatedAt;
					hasUpdates = true;

					console.log(`Updated history for alert ${alert.id} (length: ${history.length})`);
				} catch (error) {
					console.error(`Failed to store alert ${alert.id}:`, error);
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
