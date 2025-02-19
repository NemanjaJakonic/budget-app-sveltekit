import { fail, redirect } from '@sveltejs/kit';
import { cache } from '$lib/cache';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { transactionSchema } from '$lib/schemas.js';

export async function load() {
	const form = await superValidate(zod(transactionSchema));
	return {
		form
	};
}

export const actions = {
	addTransaction: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(transactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) throw redirect(302, '/login');

		const { error } = await supabase.from('transactions').insert({
			...form.data,
			user_id: user.id
		});

		if (error) {
			return fail(500, {
				form,
				message: 'Server error. Try again later.'
			});
		}

		cache.clearTransactions(user.id);
		throw redirect(303, '/');
	}
};
