import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import { browser } from '$app/environment';

export const load = async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	});

	const {
		data: { session }
	} = await supabase.auth.getSession();

	// Handle exchange rates only on the client side
	let rates = null;
	if (browser) {
		const storedRates = localStorage.getItem('exchangeRates');

		if (storedRates) {
			const { rates: cachedRates, timestamp } = JSON.parse(storedRates);
			const currentMonth = new Date().toISOString().slice(0, 7); // Gets YYYY-MM
			const storedMonth = timestamp.slice(0, 7);

			if (storedMonth === currentMonth) {
				console.log('Using cached rates');
				rates = cachedRates;
			}
		}

		if (!rates) {
			console.log('Fetching fresh rates...');
			const response = await fetch('/api/exchange-rates');
			const data = await response.json();

			if (data && data.rates) {
				rates = data.rates;
				localStorage.setItem(
					'exchangeRates',
					JSON.stringify({
						rates: data.rates,
						timestamp: new Date().toISOString().split('T')[0]
					})
				);
			}
		}
	}

	return { supabase, session, rates };
};
