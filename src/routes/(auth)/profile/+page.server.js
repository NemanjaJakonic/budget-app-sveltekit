import { fail, redirect } from '@sveltejs/kit';
import { getProfile, updateProfile } from '$lib/profiles';

export async function load({ locals: { session, supabase } }) {
	const user_id = session.user.id;
	const { profile, error } = await getProfile(user_id, supabase);

	return {
		profile
	};
}

export const actions = {
	editProfile: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const starting_balance = formData.get('starting_balance');

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

		const { success, error } = await updateProfile(supabase, { starting_balance });

		if (!success) {
			return fail(500, {
				message: error || 'Server error. Try again later.',
				success: false
			});
		}

		throw redirect(303, '/');
	}
};
