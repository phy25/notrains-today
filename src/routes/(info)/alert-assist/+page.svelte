<script lang="ts">
// @hmr:keep-all
	import { MBTA_TIMEZONE } from "$lib/mbta-types";
	import { now } from "@internationalized/date";
	import DayDetail from "../../day-detail.svelte";
	import { EFFECT_MESSAGES } from "$lib/mbta-display";
	import type { Snapshot } from "@sveltejs/kit";

let githubToken = $state(typeof localStorage != 'undefined' ? (localStorage?.getItem('alertAssistGithubToken') || null) : null);
let githubTokenInput = $state('');
let githubUserInfo: {login: string;}|null = $state(null);
let descriptionInput = $state('');
let imageUrlInput = $state('');
let infoUrlInput = $state('');
let routeIdInput = $state('');
let routeGrounding: any = $state(null);
let modelInput = $state();
let overrideTypeInput = $state('insert');

export const snapshot: Snapshot = {
    capture: () => ({
        descriptionInput,
        imageUrlInput,
        infoUrlInput,
        routeIdInput,
        modelInput,
        overrideTypeInput,
    }),
    restore: (value) => {
        ({
            descriptionInput,
            imageUrlInput,
            infoUrlInput,
            routeIdInput,
            modelInput,
            overrideTypeInput,
        } = value);
    }
};

interface GitHubModelResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
    usage: {};
}

let modelResponseAsync: Promise<GitHubModelResponse> | null = $state(null);

const getGithubUserInfo = async (token: string) => {
    const res = await fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(`GitHub API returned status ${res.status}: ${JSON.stringify(data)}`);
    }
    return data;
};

$effect(() => {
    if (githubToken && !githubUserInfo) {
        getGithubUserInfo(githubToken).then(data => {
            githubUserInfo = data;
        }).catch(error => {
            console.error('Error fetching GitHub user:', error);
            alert('Failed to authenticate with GitHub. Please check your token and try again.');
            githubToken = null;
        });
    }
});

const updateRouteGrounding = async () => {
    if (!githubToken) return;
    if (!routeIdInput) {
        routeGrounding = null;
        return;
    }
    try {
        const response = await fetch(`https://api-v3.mbta.com/stops?fields%5Bstop%5D=name&include=route&filter%5Broute%5D=${encodeURIComponent(routeIdInput)}`, {
            method: 'GET',
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${JSON.stringify(data)}`);
        }
        routeGrounding = {
            data: data.data.map((stop: any) => ({
                id: stop.id,
                name: stop.attributes.name,
            })),
            included: data.included,
        };
    } catch (error) {
        console.error('Error fetching route grounding: ', error);
        alert('Error fetching route grounding: ' + error);
    }
};

const onInvokeSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    if (!descriptionInput) return;

    modelResponseAsync = (async () => {
        await updateRouteGrounding();
        const currentTime = now(MBTA_TIMEZONE);
        const effectLists = Object.keys(EFFECT_MESSAGES);
        const response = await fetch('https://models.github.ai/inference/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${githubToken}`,
            },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": `Follow the MBTA alerts schema to convert the provided announcement text into JSON. Make sure fields use the correct types, and most of the fields should be in the attributes object.

The current timestamp is ${currentTime.toString()}. Use it for created_at. Write the time format as 2025-06-07T03:00:00-04:00 without the timezone name.

Prefer generating one alert with multiple active_period unless prompted. Always return the alerts in an array, even if there is only one alert, like {"alerts": []}.

Only use the following effect values: ${effectLists.join(', ')}. Do not use any other values.

For the image attribute, use the provided image URL if available, or leave it null if not.

For the url attribute, use the provided info URL if available, or leave it null if not.

Use the provided route_id for the ID of the route if available, and the IDs of the stops provided. Don not include stops that are not impacted by the outage in the informed_entity array. Always include a correct route_type number in informed_entity.

image: ${imageUrlInput}

url: ${infoUrlInput}

route_id: ${routeIdInput}

stops on the route: ${JSON.stringify(routeGrounding)}

Here is a blue line example:
{"attributes":{"active_period":[{"end":"2025-06-16T02:59:00-04:00","start":"2025-06-07T03:00:00-04:00"}],"banner":null,"cause":"MAINTENANCE","created_at":"2025-05-20T16:25:42-04:00","description":"Shuttle Bus Service: \r\nFree and accessible shuttle buses are making stops at all stations between Government Center and Orient Heights.  \r\n\nAlternative Ferry Service:\r\nEast Boston Ferry service is fare-free between Lewis Mall Wharf, a short walk from Maverick Station, and Long Wharf. Ferries depart every 30 minutes and extra service is being provided mornings and midday. MBTA.com/EastBoston\r\n\nAlternative Bus Service:\r\nRiders can use SL3 service between Chelsea and South Station, with a stop at Airport Station. Regular fares are being charged. MBTA.com/Bus\r\n\nAccessible Service: \r\nVan service is available for direct service to all affected stations. Riders should see onsite personnel to request this service.\r\n\nShuttle Bus Stops: \r\n\nOrient Heights:\r\nOrient Heights Busway\r\n\nWood Island:\r\nInbound - Bennington St opp Wood Island Busway\r\nOutbound - Wood Island Busway\r\n\nAirport:\r\nThe station will be closed during this work. \r\nShuttles are available in the station busway. \r\nA courtesy stop is available for local residents at Chelsea St @ Brooks St.\r\n\nMaverick:\r\nMaverick Sq Busway\r\n\nHaymarket:\r\nInbound only - Surface Rd @ Hanover St\r\nThis stop is to accommodate riders who want to transfer to the Green Line or Orange Line\r\n\nAquarium:\r\nInbound only - State St opp McKinley Sq\r\n\nState:\r\nInbound only - State St @ Washington Mall\r\n\nGovernment Center:\r\nCambridge St @ Govt Center Station\r\n\nBowdoin:\r\nNo Shuttle Buses","duration_certainty":"KNOWN","effect":"SHUTTLE","header":"Blue Line: Through June 15, shuttle buses are replacing service between Government Center & Orient Heights for maintenance. Shuttle buses are not servicing Bowdoin - riders should use Gov. Center. East Boston Ferry is fare-free during this work.","image":"https://cdn.mbta.com/sites/default/files/styles/max_2600x2600/public/media/2025-05/05-15-2025-blue-line-jun-7-15-diversion-disagram.png?itok=5hi0jqu9 ","image_alternative_text":"Shuttle stops for the Blue Line closure.","informed_entity":[{"stop":"70038","route_type":1,"route":"Blue","activities":["BOARD","RIDE"]},{"stop":"70039","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70040","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70041","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70042","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70043","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70044","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70045","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70046","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70047","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70048","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70049","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70050","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"70051","route_type":1,"route":"Blue","activities":["BOARD","RIDE"]},{"stop":"70052","route_type":1,"route":"Blue","activities":["EXIT","RIDE"]},{"stop":"70838","route_type":1,"route":"Blue","activities":["EXIT","RIDE"]},{"stop":"place-aport","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"place-aqucl","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"place-bomnl","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"place-gover","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"place-mvbcl","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"place-orhte","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"place-state","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]},{"stop":"place-wimnl","route_type":1,"route":"Blue","activities":["BOARD","EXIT","RIDE"]}],"lifecycle":"NEW","service_effect":"Blue Line shuttle","severity":7,"short_header":"Blue Ln: Shuttle buses will replace service between Government Center & Orient Heights, Jun 7 - Jun 15. Shuttle buses won't service Bowdoin ","timeframe":"through Sunday","updated_at":"2025-06-10T12:58:17-04:00","url":null},"id":"645053","links":{"self":"/alerts/645053"},"relationships":{"routes":{"data":[{"id":"Blue","type":"route"}]}},"type":"alert"}

Commuter rail uses a different header format. Please use this instead. Example:
{
"header": "On Friday, April 25th through April, 27th, shuttle buses replace service on the Lowell Line from North Station to Anderson/Woburn to allow for signal improvement work. A weekend train schedule will be in effect.",
"short_header": "On Friday, April 25th through April, 27th, shuttle buses replace service on the Lowell Line from North Station to Anderson/Woburn."
}

or

{
"description":"In May and June of 2025, MassDOT will replace the I-90 bridge over the MBTA Worcester Commuter Rail in Newton, MA. Accelerated Bridge Construction methods will be used to replace the bridge over two weekends to minimize impacts to the public.\r\n\nWHEN WILL THIS AFFECT YOU?\r\nThe First Rapid Replacement Weekend:\r\nFriday May 30, 2025 9 p.m. to\r\nMonday June 2, 2025 5 a.m.\r\nThe Second Rapid Replacement Weekend:\r\nFriday June 20, 2025 9 p.m. to\r\nMonday June 23, 2025 5 a.m.\r\n\nHOW WILL THIS AFFECT YOU?\r\nBuses will replace the last Worcester Commuter Rail train on Friday and replace all trains on Saturday and Sunday along the Worcester Commuter Rail Line between Framingham and South Station.\r\n\nFramingham Shuttle Bus Stop Locations:\r\nFramingham - Eastbound parking lot pickup/dropoff location.\r\nWest Natick - On Waverly St. adjacent to parking lot entrance. Outbound on the Northside and inbound on the South.\r\nNatick Center - South Ave. between Main and Washington Streets. Outbound on the Northside and inbound on the South.\r\nWellesley Square - Central St. between Railroad Ave. and Grove St. Outbound on the Northside and inbound on the South.\r\nWellesley Hills - Washington St. in front of the cafe. Outbound on the station side and inbound across the street.\r\nRiverside - At the designated MBTA bus stop.\r\nAuburndale - On Auburn St. at the Ash and Melrose St. intersection.\r\n\nWest Newton Shuttle Bus Stop Locations:\r\nWest Newton - Washington St. east of Cherry St. Outbound on the Northside and inbound on the South, East of Highland St.\r\nNewtonville - Outbound is on the Northside of Washington St. West of Walnut St. Inbound is on the Southside of Washington St. East of Walnut St. Both are at existing MBTA bus stops for 553 & 554.\r\nBoston Landing - South of the station on Guest St. West of Arthur St. Outbound on the Northside and Inbound on the South.\r\nKenmore - In the station busway.\r\n",
"header":"On June 21 through June 22, shuttle buses will replace service between Framingham and Boston. Shuttle buses will make connections with Green Line service for continued travel at Riverside or Kenmore. Visit MBTA.com/FWwork for more information."
}
`
                    },
                    {
                        "role": "user",
                        "content": descriptionInput
                    }
                ],
                "temperature": 0.7,
                "top_p": 1.0,
                "max_completion_tokens": 5000,
                "model": modelInput,
                "response_format": {
                    type: "json_object",
                }
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${JSON.stringify(data)}`);
        }
        
        console.log(data);
        return data as GitHubModelResponse;
    })();
};

const formatJsonText = (obj: any, override_type: string) => {
    try {
        // let obj = JSON.parse(text);
        if (override_type === 'insert') {
            obj = {
                type: 'insert',
                item: obj,
                included: routeGrounding.included || undefined,
            };
        }
        return JSON.stringify(obj, null, 2);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return obj;
    }
};
</script>

<svelte:head>
  <title>notrains.today Alert Assist</title>
</svelte:head>

<h2>Alert Assist</h2>
{#if !githubToken}
<p>This page helps you generate alerts in MBTA json format from a text description.</p>

<form onsubmit={async (e) => {
        e.preventDefault();
        if (!githubTokenInput) return;
        try {
            githubUserInfo = await getGithubUserInfo(githubTokenInput);
            
            githubToken = githubTokenInput;
            localStorage.setItem('alertAssistGithubToken', githubTokenInput);
            githubTokenInput = ''; // Clear input after successful authentication
        } catch (error) {
            console.error('Error fetching GitHub user:', error);
            alert('Failed to authenticate with GitHub. Please check your token and try again.');
            return;
        }
    }}>
    <label for="github-token">GitHub Token</label>
    <input type="text" id="github-token" bind:value={githubTokenInput} placeholder="github_pat_..." required autocomplete="off" />
    <button class="btn" type="submit">
        Save
    </button>
</form>

<p>To get started, <a href="https://github.com/settings/personal-access-tokens/new" target="_blank">create a GitHub Token</a> with the following settings and paste it above.</p>
<dl>
    <dt>Token name</dt>
    <dd>notrains.today Alert Assist</dd>
    <dt>Repository access</dt>
    <dd>Public repositories</dd>
    <dt>Account permissions</dt>
    <dd>
        <code>Models</code> Access: Read-only — to call LLM
    </dd>
    <dt>Other options</dt>
    <dd>Leave them default or adjust as you please</dd>
</dl>
{:else}
<p>Authenticated as <strong>{githubUserInfo?.login || '...'}</strong> <button onclick={() => {
    githubToken = null;
    localStorage.removeItem('alertAssistGithubToken');
}}>Remove saved token</button></p>

<form onsubmit={onInvokeSubmit}>
    <fieldset>
        <legend>Alert Details</legend>

        <label for="image-url">Image URL (optional)</label>
        <input type="url" id="image-url" bind:value={imageUrlInput} />
        <label for="info-url">Info URL (optional)</label>
        <input type="url" id="info-url" bind:value={infoUrlInput} />
        <br>

        <label for="override-type">Override item type</label>
        <select name="override-type" bind:value={overrideTypeInput}>
            <option value="none">none</option>
            <option value="insert">insert</option>
        </select>
    </fieldset>

    <fieldset>
        <legend>Route Grounding</legend>

        <label for="route-id">Route ID</label>
        <input type="text" id="route-id" bind:value={routeIdInput} />
        <button onclick={updateRouteGrounding} type="button">Preview Route Grounding</button>
        <pre style="height: 5em;"><code>{JSON.stringify(routeGrounding, null, 2)}</code></pre>
    </fieldset>

    <fieldset>
        <legend>LLM Settings</legend>
        <label for="model">Model</label>
        <select name="model" bind:value={modelInput}>
            <option value="openai/gpt-4.1">openai/gpt-4.1</option>
            <option value="openai/gpt-4o-mini">openai/gpt-4o-mini</option>
            <option value="openai/gpt-4o">openai/gpt-4o</option>
            <!-- Add more models as needed -->
        </select>
    </fieldset>
    
    <textarea id="description" rows="10" placeholder="Paste news detail about the alert" required bind:value={descriptionInput}></textarea>
    <button class="btn" type="submit">
        Generate Alert
    </button>
</form>

{#if modelResponseAsync}
{#await modelResponseAsync}
<p>Generating...</p>
{:then modelResponse}
    <h3>Generated Alert</h3>
    {#each JSON.parse(modelResponse?.choices[0].message.content || "{}")?.alerts as obj}
        {@const output = formatJsonText(obj, overrideTypeInput)}
        {#if overrideTypeInput == 'insert'}
            <svelte:boundary onerror={(e) => console.error(e)}>
                <DayDetail day={obj?.attributes?.active_period[0]?.start?.substring(0, 10)} alerts={[obj]} showNightOwl={false} routeMap={new Map(routeGrounding.included.length ? [[routeGrounding.included[0].id, routeGrounding.included[0]]] : [])} hideAuxiliary={true}></DayDetail>
                
                {#snippet failed(error)}
                <p>Something went wrong during preview: {error}</p>
                {/snippet}
            </svelte:boundary>
        {/if}
        <button onclick={() => navigator.clipboard.writeText(output)}>Copy</button>
        <pre><code>{output}</code></pre>
    {:else}
        <p>No content generated.</p>
    {/each}
    
    <h3>Usage Info</h3>
    <pre><code>{JSON.stringify(modelResponse?.usage, null, 2)}</code></pre>
{:catch error}
    <p>Error generating alert: {JSON.stringify(error.message)}</p>
{/await}
{/if}

{/if}

<style>
dl {
    line-height: 1.5;
}
dt {
    font-weight: bold;
}
dd {
    margin-bottom: 0.5rem;
}
textarea {
    box-sizing: border-box;
    width: 100%;
    resize: vertical;
    padding: 0.5rem;
    border-radius: 0.3rem;
    font-family: inherit;
}
pre {
    overflow-x: auto;
}
</style>