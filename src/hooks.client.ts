import { dev } from '$app/environment';
import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://d46dcb15b65dbe48a53bc0f7e2885cf8@o71025.ingest.us.sentry.io/4509127309459456',
	tracesSampleRate: 1.0,
	enabled: !dev,
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
