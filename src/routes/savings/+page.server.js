import { getTransactions } from '$lib/transactions';
export const load = async ({ locals: { supabase } }) => {
	const { transactions } = await getTransactions(supabase);

	return {
		transactions: transactions
	};
};
