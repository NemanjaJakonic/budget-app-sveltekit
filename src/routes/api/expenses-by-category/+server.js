import { json } from '@sveltejs/kit';
import { getTransactions } from '$lib/transactions';
import { cache } from '$lib/cache';
import { getCategoryLabel, EXPENSE_CATEGORIES } from '$lib/constants';
import { env } from '$env/dynamic/private';

/**
 * GET /api/expenses-by-category
 * 
 * Authentication:
 * - Session-based: Automatically uses logged-in user
 * - API Key: Pass header `X-API-Key: your-api-key`
 * 
 * Query parameters:
 * - year (required): The year to filter by (e.g., 2024)
 * - month (optional): The month to filter by (1-12)
 * - user_id (optional): User ID to fetch data for (only with API key auth)
 * 
 * Returns expenses grouped by category, converted to RSD
 */
export async function GET({ url, request, fetch, locals: { session, supabase } }) {
	let user_id = null;

	// Check for API key authentication first
	const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
	
	if (apiKey) {
		// Validate API key
		if (!env.API_KEY || apiKey !== env.API_KEY) {
			return json({ error: 'Invalid API key' }, { status: 401 });
		}
		
		// Check for user_id in query params, fall back to env variable
		const userIdParam = url.searchParams.get('user_id');
		if (userIdParam) {
			user_id = userIdParam;
		} else if (env.API_USER_ID) {
			user_id = env.API_USER_ID;
		} else {
			return json({ 
				error: 'User ID required. Pass user_id query param or configure API_USER_ID env variable.' 
			}, { status: 400 });
		}
	} else if (session?.user) {
		// Fall back to session-based authentication
		user_id = session.user.id;
	} else {
		return json({ 
			error: 'Unauthorized. Provide X-API-Key header or log in.' 
		}, { status: 401 });
	}

	// Parse query parameters
	const yearParam = url.searchParams.get('year');
	const monthParam = url.searchParams.get('month');

	if (!yearParam) {
		return json({ error: 'Year parameter is required' }, { status: 400 });
	}

	const year = parseInt(yearParam);
	if (isNaN(year) || year < 2000 || year > 2100) {
		return json({ error: 'Invalid year parameter' }, { status: 400 });
	}

	let month = null;
	if (monthParam) {
		month = parseInt(monthParam);
		if (isNaN(month) || month < 1 || month > 12) {
			return json({ error: 'Invalid month parameter (must be 1-12)' }, { status: 400 });
		}
	}

	try {
		// Get all transactions
		const { transactions, error: transactionsError } = await getTransactions(user_id, supabase);

		if (transactionsError) {
			return json({ error: transactionsError }, { status: 500 });
		}

		// Get exchange rates
		let rates = cache.getExchangeRates();
		if (!rates) {
			const response = await fetch('/api/exchange-rates');
			const data = await response.json();

			if (data && data.rates) {
				rates = data.rates;
				cache.setExchangeRates(rates);
			} else {
				// Fallback rates if API fails
				rates = { RSD: 117.5, EUR: 1, USD: 1.09 };
			}
		}

		// Filter transactions by year and optionally month, and only expenses
		const filteredTransactions = transactions.filter((t) => {
			if (t.type !== 'expense') return false;

			const date = new Date(t.date);
			const transactionYear = date.getFullYear();
			const transactionMonth = date.getMonth() + 1; // 0-indexed to 1-indexed

			if (transactionYear !== year) return false;
			if (month !== null && transactionMonth !== month) return false;

			return true;
		});

		// Group by category and calculate totals in RSD
		const categoryTotals = {};

		// Initialize all categories with 0
		EXPENSE_CATEGORIES.forEach((cat) => {
			categoryTotals[cat.value] = {
				category: cat.value,
				label: cat.label,
				totalRSD: 0,
				count: 0,
				transactions: []
			};
		});

		// Add uncategorized for expenses without category
		categoryTotals['uncategorized'] = {
			category: 'uncategorized',
			label: 'Uncategorized',
			totalRSD: 0,
			count: 0,
			transactions: []
		};

		// Process each transaction
		filteredTransactions.forEach((t) => {
			// Convert amount to RSD
			let amountInRSD = t.amount;
			switch (t.currency) {
				case 'EUR':
					amountInRSD = t.amount * rates.RSD;
					break;
				case 'USD':
					amountInRSD = t.amount * rates.USD * rates.RSD;
					break;
				case 'RSD':
				default:
					amountInRSD = t.amount;
					break;
			}

			const category = t.category || 'uncategorized';

			if (!categoryTotals[category]) {
				// Handle any category not in our predefined list
				categoryTotals[category] = {
					category: category,
					label: getCategoryLabel(category),
					totalRSD: 0,
					count: 0,
					transactions: []
				};
			}

			categoryTotals[category].totalRSD += amountInRSD;
			categoryTotals[category].count += 1;
			categoryTotals[category].transactions.push({
				id: t.id,
				name: t.name,
				date: t.date,
				originalAmount: t.amount,
				originalCurrency: t.currency,
				amountRSD: Math.round(amountInRSD * 100) / 100
			});
		});

		// Calculate grand total
		const grandTotalRSD = Object.values(categoryTotals).reduce(
			(sum, cat) => sum + cat.totalRSD,
			0
		);

		// Round totals
		Object.values(categoryTotals).forEach((cat) => {
			cat.totalRSD = Math.round(cat.totalRSD * 100) / 100;
		});

		// Filter out categories with no transactions if desired
		const categoriesWithData = Object.values(categoryTotals).filter((cat) => cat.count > 0);

		// Build response
		const response = {
			period: {
				year,
				month: month || null,
				monthName: month
					? new Date(year, month - 1).toLocaleString('default', { month: 'long' })
					: null
			},
			summary: {
				totalExpensesRSD: Math.round(grandTotalRSD * 100) / 100,
				totalTransactions: filteredTransactions.length,
				categoriesCount: categoriesWithData.length
			},
			exchangeRates: {
				EUR_to_RSD: rates.RSD,
				USD_to_EUR: rates.USD
			},
			categories: categoriesWithData.sort((a, b) => b.totalRSD - a.totalRSD)
		};

		return json(response);
	} catch (error) {
		console.error('Error fetching expenses by category:', error);
		return json({ error: 'Failed to fetch expenses' }, { status: 500 });
	}
}
