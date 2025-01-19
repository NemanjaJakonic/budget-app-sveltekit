import { redirect } from '@sveltejs/kit';
import { getTransactions } from '$lib/transactions';
import { cache } from '$lib/cache';

export const load = async ({ locals: { getSession } }) => {
	const session = await getSession();
	const userId = session.user.id;

	// Try to get from cache first
	const cachedTransactions = cache.getTransactions(userId);
	let transactions;

	if (cachedTransactions) {
		transactions = cachedTransactions;
	} else {
		// If not in cache, fetch from database
		const { transactions: fetchedTransactions } = await getTransactions(userId);
		transactions = fetchedTransactions;
		// Store in cache
		cache.setTransactions(userId, transactions);
	}
	return {
		transactions: transactions ?? []
	};
};
