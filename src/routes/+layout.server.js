export const load = async ({ locals: { safeGetSession }, cookies, fetch }) => {
	const response = await fetch('/api/exchange-rates');
	const rates = await response.json();
	const { session } = await safeGetSession();
	return {
		session,
		cookies: cookies.getAll(),
		rates: rates.rates
	};
};
