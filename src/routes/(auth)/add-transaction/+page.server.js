import { fail, redirect } from '@sveltejs/kit';
import { cache } from '$lib/cache';

export const actions = {
	addTransaction: async ({ request, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const name = formData.get('name');
		const amount = formData.get('amount');
		const date = formData.get('date');
		const type = formData.get('type');
		const currency = formData.get('currency');

		if (!name || !amount) {
			return fail(400, {
				message: 'Please fill in all the fields!',
				success: false
			});
		}

		if (isNaN(amount) || amount <= 0) {
			return fail(400, {
				message: 'Please enter a valid amount greater than 0!',
				success: false
			});
		}

		const { error } = await supabase
			.from('transactions')
			.insert({ name, amount, user_id: user.id, date, type, currency });

		if (error) {
			return fail(500, { message: 'Server error. Try again later.', success: false });
		}

		// Clear cache after successful addition
		cache.clearTransactions(user.id);

		throw redirect(303, '/');
	}
};
