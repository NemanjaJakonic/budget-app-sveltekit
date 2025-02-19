import { fail, redirect } from '@sveltejs/kit';
import { cache } from '$lib/cache';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { transactionSchema } from '$lib/schemas.js';

export async function load({ params, locals: { supabase, session } }) {
	const user = session.user;
	if (!user) {
		throw redirect(302, '/login');
	}

	const form = await superValidate(zod(transactionSchema));

	if (user) {
		const { data, error } = await supabase
			.from('transactions')
			.select()
			.match({ user_id: user.id, id: params.id });
		if (error) {
			console.log(error);
		}
		return {
			transaction: data ?? [],
			form
		};
	} else {
		return {
			transaction: []
		};
	}
}

export const actions = {
	editTransaction: async ({ request, params, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();

		const form = await superValidate(request, zod(transactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		const id = params.id;

		const { error } = await supabase
			.from('transactions')
			.update({ ...form.data })
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
