import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	login: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (!email || !password) {
			return fail(400, {
				message: 'Email and password are required',
				success: false,
				email
			});
		}

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			switch (error.message) {
				case 'Invalid login credentials':
					return fail(400, {
						message: 'Invalid email or password',
						success: false,
						email
					});
				case 'Email not confirmed':
					return fail(400, {
						message: 'Please verify your email before logging in',
						success: false,
						email
					});
				default:
					return fail(500, {
						message: 'An unexpected error occurred. Please try again later.',
						success: false,
						email
					});
			}
		}

		throw redirect(303, '/');
	}
};
