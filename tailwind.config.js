/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#069494',
				secondary: '#1a1a1a',
				primaryHover: '#025a5a',
				expense: '#9b3b3b',
				income: '#02862c'
			}
		}
	},
	plugins: []
};
