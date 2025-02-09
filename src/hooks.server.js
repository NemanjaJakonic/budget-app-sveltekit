import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { PUBLIC_FIXER_API_KEY } from '$env/static/public';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { redirect } from '@sveltejs/kit';
export const handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	});

	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	// Get the session
	const session = await event.locals.getSession();

	// Protected routes logic
	if (!session) {
		// If user is not logged in and trying to access protected routes
		if (!['/login', '/register'].includes(event.url.pathname)) {
			throw redirect(303, '/login');
		}
	} else {
		// If user is logged in and trying to access auth routes
		if (['/login', '/register'].includes(event.url.pathname)) {
			throw redirect(303, '/');
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
};
