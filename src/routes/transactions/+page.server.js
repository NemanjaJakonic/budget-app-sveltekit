import { getTransactions } from '$lib/transactions';

export async function load({ locals: { supabase } }) {
	const { transactions } = await getTransactions(supabase);

	return {
		transactions: transactions
	};
}
