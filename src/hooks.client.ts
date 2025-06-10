import { dev } from '$app/environment';
import { getLocale, overwriteGetLocale } from '$lib/paraglide/runtime';
import { handleErrorWithSentry } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://d46dcb15b65dbe48a53bc0f7e2885cf8@o71025.ingest.us.sentry.io/4509127309459456',
	sampleRate: dev ? 0.0 : 1.0,
	tracesSampleRate: dev ? 0.0 : 1.0,
	integrations: [
		Sentry.feedbackAsyncIntegration({
			autoInject: false,
		}),
	],
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();

// Patch client-side locale
const _getLocale = getLocale;

const originalLanguages = window.navigator.languages;
let inGetLocale = false;

try {
	Object.defineProperty(navigator, 'languages', {
		get: function() {
		return inGetLocale ? originalLanguages.map(l => {
			if (l.toLowerCase().startsWith('zh-cn')) {
				return 'zh-Hans';
			}
			return l;
		}) : originalLanguages;
		}
	});
} catch (e) {
	console.warn('Failed to patch navigator.languages', e);
}

overwriteGetLocale(() => {
	inGetLocale = true;
	const locale = _getLocale();
	inGetLocale = false;
	return locale;
})