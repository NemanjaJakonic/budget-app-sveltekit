import { cache } from '$lib/cache';

export const load = async ({ fetch }) => {
	try {
		const response = await fetch('/api/exchange-rates');
		const rates = await response.json();

		return {
			rates: rates.rates
		};
	} catch (error) {
		console.error('Error loading exchange rates:', error);
		return {
			rates: null
		};
	}
};
