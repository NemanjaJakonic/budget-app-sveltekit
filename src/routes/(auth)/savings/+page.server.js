import { getTransactions } from '$lib/transactions';
export const load = async ({ locals: { supabase, getSession } }) => {
	const session = await getSession();

	const { transactions } = await getTransactions(supabase, session);

	return {
		transactions: transactions
	};
};
