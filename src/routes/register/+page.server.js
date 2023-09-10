import { AuthApiError } from '@supabase/supabase-js';
import { fail } from '@sveltejs/kit';

export const actions = {
	register: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		const first_name = formData.get('first_name');
		const last_name = formData.get('last_name');

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.origin}/auth/callback`,
				data:{
					first_name,
					last_name
				},
			}
		});
		console.log(data);
		
		if (error) {
			console.log(error);
			return fail(500, { message: 'register failed.', success: false, email });
		}

		// // Insert first name and last name into another table
		// const { data: insertData, error: insertError } = await supabase
		// 	.from('users')
		// 	.insert([{ id: data.user.id, first_name: first_name, last_name: last_name }]);

		// if (insertError) {
		// 	return fail(500, { message: 'name insert failed.', success: false, email });
		// }

		return {
			message: 'Please check your email for a magic link to log into the website.',
			success: true
		};
	}
};
