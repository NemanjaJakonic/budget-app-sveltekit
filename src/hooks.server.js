import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { PUBLIC_FIXER_API_KEY } from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';

export const handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	});

	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	const getExchangeRates = async () => {
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
			console.log('Fetching from URL:', url); // Debug log

			const response = await fetch(url, requestOptions);
			const data = await response.json();

			console.log('API Response:', data); // Debug log

			if (!data.success) {
				console.error('Fixer API error:', data.error);
				return null;
			}

			const ratesData = {
				rates: data.rates,
				timestamp: new Date().toISOString().split('T')[0]
			};

			console.log('Processed rates data:', ratesData); // Debug log
			return ratesData;
		} catch (error) {
			console.error('Error fetching exchange rates:', error);
			return null;
		}
	};

	// Add exchange rates endpoint
	if (event.url.pathname === '/api/exchange-rates') {
		const ratesData = await getExchangeRates();
		return new Response(JSON.stringify(ratesData), {
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
};
