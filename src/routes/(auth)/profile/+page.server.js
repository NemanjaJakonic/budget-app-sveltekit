import { fail, redirect } from '@sveltejs/kit';
import { getProfile } from '$lib/profiles';
import { cache } from '$lib/cache';

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

		try {
			const {
				data: { user },
				error: userError
			} = await supabase.auth.getUser();

			if (userError || !user) {
				return {
					success: false,
					error: 'Authentication failed'
				};
			}

			const { error } = await supabase
				.from('profiles')
				.update({ starting_balance })
				.eq('user_id', user.id);

			if (error) {
				console.error('Error updating profile:', error);
				return {
					success: false,
					error: 'Failed to update profile'
				};
			}

			// Clear cache after successful update
			cache.clearProfile(user.id);

			throw redirect(303, '/');

			// return {
			// 	success: true
			// };
		} catch (error) {
			console.error('Error updating profile:', error);
			return {
				success: false,
				error: 'Failed to update profile'
			};
		}

		// if (!success) {
		// 	return fail(500, {
		// 		message: error || 'Server error. Try again later.',
		// 		success: false
		// 	});
		// }
	}
};
