import { getTransactions } from '$lib/transactions';

export async function load({ locals: { session, supabase } }) {
	const user_id = session.user.id;

	const { transactions } = await getTransactions(user_id, supabase);

	return {
		transactions: transactions
	};
}
