import { supabase } from '$lib/supabase';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals: { getSession } }) {
	const session = await getSession();
	if (session) {
		const { data, error } = await supabase
			.from('profiles')
			.select()
			.eq('user_id', session.user.id)
			.limit(1);
		if (error) {
			console.log(error);
		}
		return {
			profiles: data ?? []
		};
	} else {
		return {
			profiles: []
		};
	}
}

export const actions = {
	editProfile: async ({ request, url, locals: { supabase, getSession } }) => {
		const session = await getSession();

		const formData = await request.formData();
		const id = formData.get('id');
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

		const { error } = await supabase
			.from('profiles')
			.update({ starting_balance })
			.match({ user_id: session.user.id });
		if (error) {
			return fail(500, { message: 'Server error. Try again later.', success: false });
		}

		throw redirect(303, '/');
	}
};
