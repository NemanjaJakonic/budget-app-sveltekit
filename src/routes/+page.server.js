import { supabase } from '$lib/supabase';
import { fail, redirect } from '@sveltejs/kit';

export async function load({ locals: { getSession } }) {
	const session = await getSession();
	if (session) {
		// Fetch transactions
		const { data: transactions, error: transactionsError } = await supabase
			.from('transactions')
			.select()
			.eq('user_id', session.user.id)
			.order('date', { ascending: false });
		if (transactionsError) {
			console.log(transactionsError);
		}

		// Fetch profiles
		const { data: profiles, error: profilesError } = await supabase
			.from('profiles')
			.select()
			.eq('user_id', session.user.id)
			.limit(1);
		if (profilesError) {
			console.log(profilesError);
		}

		return {
			transactions: transactions ?? [],
			profiles: profiles ?? [] // Return profiles data
		};
	} else {
		return {
			transactions: [],
			profiles: [] // Return empty profiles data
		};
	}
}

export const actions = {
	deleteTransaction: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		const formData = await request.formData();
		const id = formData.get('id');

		const { error } = await supabase
			.from('transactions')
			.delete()
			.match({ id: id, user_id: session.user.id });

		if (error) {
			return fail(500, { message: 'Server error. Try again later.', success: false, email });
		}

		//   throw redirect(303, '/')
	}
};
