import { json } from '@sveltejs/kit';
import { PUBLIC_FIXER_API_KEY } from '$env/static/public';
import { cache } from '$lib/cache';

async function fetchExchangeRates() {
	const symbols = 'RSD,EUR,USD';
	const base = 'EUR';

	try {
		const myHeaders = new Headers();
		myHeaders.append('apikey', PUBLIC_FIXER_API_KEY);

		const requestOptions = {
			method: 'GET',
			redirect: 'follow',
			headers: myHeaders
		};

		const url = `https://api.apilayer.com/fixer/latest?symbols=${symbols}&base=${base}`;
		const response = await fetch(url, requestOptions);

		const data = await response.json();

		if (!data.success) {
			console.error('Fixer API error:', data.message);
			return {
				rates: {
					RSD: 117.11124,
					EUR: 1,
					USD: 1.0929802
				},
				timestamp: new Date().toISOString()
			};
		}

		return {
			rates: data.rates,
			timestamp: new Date().toISOString()
		};
	} catch (error) {
		console.error('Error fetching exchange rates:', error);
		return null;
	}
}

export async function GET() {
	// Check cache first
	const cachedRates = cache.getExchangeRates();
	if (cachedRates) {
		console.log('Returning cached exchange rates');
		return json(cachedRates);
	}

	// Fetch fresh rates
	console.log('Fetching fresh exchange rates');
	const ratesData = await fetchExchangeRates();

	if (ratesData) {
		// Update cache
		cache.setExchangeRates(ratesData);
		return json(ratesData);
	}

	return json({ error: 'Failed to fetch exchange rates' }, { status: 500 });
}
