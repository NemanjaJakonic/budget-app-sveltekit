import { supabase } from '$lib/supabase';
import { fail, redirect } from '@sveltejs/kit';
import { getTransactions } from '$lib/transactions';
import { cache } from '$lib/cache';

export async function load({ locals: { getSession } }) {
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

	// Fetch profiles
	const { data: profiles, error: profilesError } = await supabase
		.from('profiles')
		.select()
		.eq('user_id', session.user.id)
		.limit(1);
	if (profilesError) {
		console.log(profilesError);
	}

	return {
		transactions: transactions ?? [],
		profiles: profiles ?? []
	};
}

export const actions = {
	deleteTransaction: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		const formData = await request.formData();
		const id = formData.get('id');

		const { error } = await supabase
			.from('transactions')
			.delete()
			.match({ id: id, user_id: session.user.id });

		if (error) {
			return fail(500, { message: 'Server error. Try again later.', success: false });
		}

		// Clear cache after successful deletion
		cache.clearTransactions(session.user.id);
	}
};
