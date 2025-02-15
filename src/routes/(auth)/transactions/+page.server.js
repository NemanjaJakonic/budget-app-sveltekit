import { getTransactions } from '$lib/transactions';
import { cache } from '$lib/cache';

export async function load({ locals: { session, supabase } }) {
	const user_id = session.user.id;

	const { transactions } = await getTransactions(user_id, supabase);

	return {
		transactions: transactions
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
