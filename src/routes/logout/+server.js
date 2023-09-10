import { error, redirect } from '@sveltejs/kit';

export const POST = async ({ locals }) => {
	const { error } = await locals.supabase.auth.signOut();

	if (error) {
		return fail(500, { message: 'Server error. Try again later.', success: false, email });
	}

    throw redirect(303, '/')
};
