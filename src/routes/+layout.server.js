import { cache } from '$lib/cache';

export const load = async ({ locals: { getSession }, fetch }) => {
	const session = await getSession();

	// Check cache first
	let rates = cache.getExchangeRates();

	if (!rates) {
		console.log('Fetching fresh rates...');
		const response = await fetch('/api/exchange-rates');
		const data = await response.json();

		if (data && data.rates) {
			rates = data.rates;
			// Cache the rates
			cache.setExchangeRates(rates);
		}
	} else {
		console.log('Using cached rates');
	}

	return {
		session,
		rates
	};
};
