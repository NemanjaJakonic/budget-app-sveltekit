import { fail, redirect } from '@sveltejs/kit';
import { cache } from '$lib/cache';

export async function load({ params, locals: { supabase, session } }) {
	const user = session.user;
	if (!user) {
		throw redirect(302, '/login');
	}

	if (user) {
		const { data, error } = await supabase
			.from('transactions')
			.select()
			.match({ user_id: user.id, id: params.id });
		if (error) {
			console.log(error);
		}
		return {
			transaction: data ?? []
		};
	} else {
		return {
			transaction: []
		};
	}
}

export const actions = {
	editTransaction: async ({ request, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();

		const formData = await request.formData();
		const name = formData.get('name');
		const amount = formData.get('amount');
		const type = formData.get('type');
		const currency = formData.get('currency');
		const date = formData.get('date');
		const id = formData.get('id');

		const { error } = await supabase
			.from('transactions')
			.update({ name, amount, type, currency, date })
			.match({ id: id, user_id: user.id });

		if (error) {
			return fail(500, { message: 'Server error. Try again later.', success: false });
		}

		// Clear cache after successful edit
		cache.clearTransactions(user.id);

		// const referer = request.headers.get('referer') || '/';
		throw redirect(303, '/');
	}
};
