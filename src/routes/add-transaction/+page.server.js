import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	addTransaction: async ({ request, url, locals: { supabase, getSession } }) => {
		const session = await getSession();

		const formData = await request.formData();
		const name = formData.get('name');
		const amount = formData.get('amount');
		const date = formData.get('date');
		const type = formData.get('type');

		const { error } = await supabase
			.from('transactions')
			.insert({ name, amount, user_id: session.user.id, date, type });

		if (error) {
			return fail(500, { message: 'Server error. Try again later.', success: false });
		}

		throw redirect(303, '/');
	}
};
