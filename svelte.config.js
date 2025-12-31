// svelte.config.js
import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			out: 'build'
		}),
		serviceWorker: {
			register: false // We handle registration manually in hooks.client.js
		}
	}
};

export default config;
