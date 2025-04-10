import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';

Sentry.init({
	dsn: 'https://d46dcb15b65dbe48a53bc0f7e2885cf8@o71025.ingest.us.sentry.io/4509127309459456',
	tracesSampleRate: 1
});

// creating a handle to use the paraglide middleware
const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%paraglide.lang%', locale);
			}
		});
	});

export const handle: Handle = sequence(Sentry.sentryHandle(), paraglideHandle);
export const handleError = Sentry.handleErrorWithSentry();
