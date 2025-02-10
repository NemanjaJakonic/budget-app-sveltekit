import { cache } from '$lib/cache';

export const load = async ({ fetch }) => {
	try {
		// const response = await fetch('/api/exchange-rates');
		// const rates = await response.json();

		// const response = await fetch('/api/exchange-rates');
		// const rates = await response.json();
		const rates = {
			rates: {
				RSD: 117.3,
				EUR: 1,
				USD: 1.0929802
			},
			timestamp: new Date().toISOString()
		};

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
