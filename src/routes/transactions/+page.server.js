import { supabase } from '$lib/supabase';

export async function load({ locals: { getSession } }) {
	const session = await getSession();
	if (!session) {
		return {
			status: 302,
			redirect: '/login'
		};
	}

	try {
		const { data: transactions, error: transactionsError } = await supabase
			.from('transactions')
			.select()
			.eq('user_id', session.user.id)
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
