import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { dev } from '$app/environment';

Sentry.init({
	dsn: 'https://d46dcb15b65dbe48a53bc0f7e2885cf8@o71025.ingest.us.sentry.io/4509127309459456',
	tracesSampleRate: 1,
	enabled: !dev,
});

const OPEN_GRAPH_TITLE_MAPPING: Record<string, string> = {
	'': 'notrains.today',
	'/': 'Train Status on the T',
	'/calendar': 'Upcoming T Outage Calendar',
};

// creating a handle to use the paraglide middleware and other stuff
const paraglideHandle: Handle = ({ event, resolve }) => {
	// patch Accept-Language header
	if (event.request.headers.has('accept-language')) {
		const acceptLanguage = event.request.headers.get('accept-language');
		if (acceptLanguage) {
			const languages = acceptLanguage.split(',').map((lang) => {
				const langFields = lang.split(';');
				if (langFields[0].toLowerCase().startsWith('zh-cn')) {
					return ['zh-Hans'].concat(langFields.slice(1)).join(';');
				}
				return lang;
			});
			event.request.headers.set('accept-language', languages.join(','));
		}
	}
	// use the paraglide middleware
	return paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html
					.replace('%paraglide.lang%', locale)
					.replace('%og.title%', OPEN_GRAPH_TITLE_MAPPING[event.route.id || ''] || OPEN_GRAPH_TITLE_MAPPING['']);
			}
		});
	})
};

export const handle: Handle = sequence(Sentry.sentryHandle(), paraglideHandle);
export const handleError = Sentry.handleErrorWithSentry();
