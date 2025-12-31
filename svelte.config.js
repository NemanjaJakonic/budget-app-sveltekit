// svelte.config.js
import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			split: true  // Recommended for Netlify Edge Functions
		}),
		serviceWorker: {
			register: false  // Netlify handles this
		}
	}
};

export default config;