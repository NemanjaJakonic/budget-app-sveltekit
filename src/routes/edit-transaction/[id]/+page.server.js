import { supabase } from '$lib/supabase';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ params, locals: { getSession } }) {
	const session = await getSession();

	if (session) {
		const { data, error } = await supabase
			.from('transactions')
			.select()
			.match({ user_id: session.user.id, id: params.id });
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
	editTransaction: async ({ request, url, locals: { supabase, getSession } }) => {
		const session = await getSession();

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
			.match({ id: id, user_id: session.user.id });

		if (error) {
			return fail(500, { message: 'Server error. Try again later.', success: false, email });
		}

		throw redirect(303, '/');
	}
};
