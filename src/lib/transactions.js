import { supabase } from '$lib/supabase';

export async function getTransactions(userId) {
	try {
		const { data: transactions, error: transactionsError } = await supabase
			.from('transactions')
			.select()
			.eq('user_id', userId)
			.order('date', { ascending: false });
		if (transactionsError) {
			console.log(transactionsError);
		}
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
