import { supabase } from '$lib/supabase';
import { fail, redirect } from '@sveltejs/kit';
import { cache } from '$lib/cache';
export async function load({ locals: { supabase, getSession } }) {
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		throw redirect(302, '/login');
	}

	const { data, error } = await supabase
		.from('profiles')
		.select('*')
		.eq('user_id', user.id)
		.single();

	if (error) {
		console.error('Error:', error);
		return { profile: null };
	}

	return {
		profile: data
	};
}

export const actions = {
	editProfile: async ({ request, locals: { supabase } }) => {
		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			throw redirect(302, '/login');
		}

		const formData = await request.formData();
		const starting_balance = formData.get('starting_balance');
		console.log(formData);
		if (!starting_balance) {
			return fail(400, {
				message: 'Please fill in all the fields!',
				success: false
			});
		}

		if (isNaN(starting_balance) || starting_balance <= 0) {
			return fail(400, {
				message: 'Please enter a valid amount greater than 0!',
				success: false
			});
		}

		const { error } = await supabase
			.from('profiles')
			.update({ starting_balance })
			.eq('user_id', user.id);

		if (error) {
			return fail(500, {
				message: 'Server error. Try again later.',
				success: false
			});
		} else {
			cache.clearProfile(user.id);
		}

		throw redirect(303, '/');
	}
};
