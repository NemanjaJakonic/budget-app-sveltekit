import { AuthApiError } from '@supabase/supabase-js';
import { fail } from '@sveltejs/kit';

export const actions = {
	register: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		const first_name = formData.get('first_name');
		const last_name = formData.get('last_name');

		if (!email || !password || !first_name || !last_name) {
			return fail(400, {
				message: 'Please fill in all fields',
				success: false,
				email
			});
		}

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.origin}/auth/callback`,
				data: {
					first_name,
					last_name
				}
			}
		});

		if (error) {
			if (error instanceof AuthApiError) {
				switch (error.message) {
					case 'User already registered':
						return fail(400, {
							message: 'This email is already registered',
							success: false,
							email
						});
					case 'Password should be at least 6 characters':
						return fail(400, {
							message: 'Password must be at least 6 characters long',
							success: false,
							email
						});
					default:
						return fail(400, {
							message: error.message,
							success: false,
							email
						});
				}
			}

			return fail(500, {
				message: 'An unexpected error occurred. Please try again later.',
				success: false,
				email
			});
		}

		return {
			message: 'Please check your email for a verification link.',
			success: true
		};
	}
};
