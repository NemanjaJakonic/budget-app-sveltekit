import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { loginSchema } from '$lib/schemas.js';

export async function load() {
	const form = await superValidate(zod(loginSchema));
	return {
		form
	};
}

export const actions = {
	default: async ({ request, url, locals: { supabase } }) => {
		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const email = form.data.email;
		const password = form.data.password;

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			return message(form, error.message, {
				status: 400
			});

			// switch (error.message) {
			// 	case 'Invalid login credentials':
			// 		return message(form, 'Invalid email or password', {
			// 			status: 400
			// 		});

			// 	// return fail(400, {
			// 	// 	message: 'Invalid email or password',
			// 	// 	success: false,
			// 	// 	email
			// 	// });
			// 	case 'Email not confirmed':
			// 		return fail(400, {
			// 			message: 'Please verify your email before logging in',
			// 			success: false,
			// 			email
			// 		});
			// 	default:
			// 		return fail(500, {
			// 			message: 'An unexpected error occurred. Please try again later.',
			// 			success: false,
			// 			email
			// 		});
			// }
		}

		throw redirect(303, '/');
	}
};
