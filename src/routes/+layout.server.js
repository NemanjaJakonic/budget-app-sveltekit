export const load = async ({ locals: { safeGetSession }, cookies, fetch }) => {
	// const response = await fetch('/api/exchange-rates');
	// const rates = await response.json();
	const rates = {
		rates: {
			RSD: 117.11124,
			EUR: 1,
			USD: 1.0929802
		},
		timestamp: new Date().toISOString()
	};
	const { session } = await safeGetSession();
	return {
		session,
		cookies: cookies.getAll(),
		rates: rates.rates
	};
};
