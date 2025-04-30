// https://api.github.com/repos/phy25/notrains-today/commits?per_page=1&sha=d007fa17

import type { PageLoad } from './$types';
import { version } from '$app/environment';

export const load = (async ({ fetch }) => {
    const githubResponse = await fetch(
        'https://api.github.com/repos/phy25/notrains-today/commits?per_page=1&sha=' + version)
        .then(response => response.json())
        .catch(error => {console.error(error); return [];});
    return {
        githubResponse,
        version,
    };
}) satisfies PageLoad;