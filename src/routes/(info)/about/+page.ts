// https://api.github.com/repos/phy25/notrains-today/commits?per_page=1&sha=d007fa17

import type { PageLoad } from './$types';
import { version } from '$app/environment';

export const load = (async ({ fetch }) => {
    const githubResponseAsync = fetch('https://api.github.com/repos/phy25/notrains-today/commits?per_page=1&sha=' + version);
    return {
        githubResponseAsync,
        version,
    };
}) satisfies PageLoad;