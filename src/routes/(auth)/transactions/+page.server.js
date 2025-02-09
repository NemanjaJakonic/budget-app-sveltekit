import { getTransactions } from '$lib/transactions';

export async function load({ locals: { supabase, getSession } }) {
	const session = await getSession();

	const { transactions } = await getTransactions(supabase, session);

	return {
		transactions: transactions
	};
}
