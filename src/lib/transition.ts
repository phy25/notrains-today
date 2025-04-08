import { fade as _fade } from "svelte/transition";

export const fade = (node: HTMLElement, params?: any) => {
    return _fade(node, {duration: 200, ...params});
};
