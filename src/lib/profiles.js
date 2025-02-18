import { cache } from '$lib/cache';
// import { supabase } from '$lib/supabase';

export async function getProfile(user_id, supabase) {
	try {
		// Try to get from cache first
		const cachedProfile = cache.getProfile(user_id);
		if (cachedProfile) {
			console.log('Using cached profile');
			return {
				profile: cachedProfile
			};
		}

		// If not in cache, fetch from database
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('*')
			.eq('user_id', user_id)
			.single();

		// If profile doesn't exist, create one
		if (profileError?.code === 'PGRST116') {
			// PostgreSQL "no rows" error
			console.log('Creating new profile for user:', user_id);
			const { data: newProfile, error: insertError } = await supabase
				.from('profiles')
				.insert({
					user_id: user_id,
					starting_balance: 0
				})
				.select()
				.single();

			if (insertError) {
				console.error('Error creating profile:', insertError);
				return {
					profile: null,
					error: 'Failed to create profile'
				};
			}

			// Store new profile in cache
			cache.setProfile(user_id, newProfile);

			return {
				profile: newProfile
			};
		}

		if (profileError) {
			console.error('Error fetching profile:', profileError);
			return {
				profile: null,
				error: 'Failed to load profile'
			};
		}

		// Store in cache
		cache.setProfile(user_id, profile);

		return {
			profile
		};
	} catch (error) {
		console.error('Error loading profile:', error);
		return {
			profile: null,
			error: 'Failed to load profile'
		};
	}
}
