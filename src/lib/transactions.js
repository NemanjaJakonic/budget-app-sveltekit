import { cache } from '$lib/cache';
// import { supabase } from '$lib/supabase';

export async function getTransactions(user_id, supabase) {
	try {
		// Try to get from cache first
		const cachedTransactions = cache.getTransactions(user_id);
		if (cachedTransactions) {
			console.log('Using cached transactions');
			return {
				transactions: cachedTransactions
			};
		}

		// If not in cache, fetch from database
		// const {
		// 	data: { user }
		// } = await supabase.auth.getUser();

		// if (userError || !user) {
		// 	console.error('Auth error:', userError);
		// 	return {
		// 		transactions: [],
		// 		error: 'Authentication failed'
		// 	};
		// }

		const { data: transactions, error: transactionsError } = await supabase
			.from('transactions')
			.select()
			.eq('user_id', user_id)
			.order('date', { ascending: false });

		if (transactionsError) {
			console.error('Error fetching transactions:', transactionsError);
			return {
				transactions: [],
				error: 'Failed to load transactions'
			};
		}

		// Store in cache
		cache.setTransactions(user_id, transactions);

		return {
			transactions
		};
	} catch (error) {
		console.error('Error loading transactions:', error);
		return {
			transactions: [],
			error: 'Failed to load transactions'
		};
	}
}
