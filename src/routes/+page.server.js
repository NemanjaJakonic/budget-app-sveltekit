import { fail, redirect } from '@sveltejs/kit';
import { getTransactions } from '$lib/transactions';
import { getProfile } from '$lib/profiles';
import { cache } from '$lib/cache';

export async function load({ locals: { supabase } }) {
	const { transactions } = await getTransactions(supabase);
	const { profile } = await getProfile(supabase);

	return {
		transactions: transactions,
		profile: profile
	};
}

export const actions = {
	deleteTransaction: async ({ request, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const id = formData.get('id');

		const { error } = await supabase
			.from('transactions')
			.delete()
			.eq('id', id)
			.eq('user_id', user.id);

		if (error) {
			return fail(500, {
				message: 'Server error. Try again later.',
				success: false
			});
		}

		// Clear cache after successful deletion
		cache.clearTransactions(user.id);
	}
};
