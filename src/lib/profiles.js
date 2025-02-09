import { cache } from '$lib/cache';

export async function getProfile(supabase) {
	try {
		const {
			data: { user },
			error: userError
		} = await supabase.auth.getUser();

		if (userError || !user) {
			console.error('Auth error:', userError);
			return {
				profile: null,
				error: 'Authentication failed'
			};
		}

		// Try to get from cache first
		const cachedProfile = cache.getProfile(user.id);
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
			.eq('user_id', user.id)
			.single();

		// If profile doesn't exist, create one
		if (profileError?.code === 'PGRST116') {
			// PostgreSQL "no rows" error
			console.log('Creating new profile for user:', user.id);
			const { data: newProfile, error: insertError } = await supabase
				.from('profiles')
				.insert({
					user_id: user.id,
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
			cache.setProfile(user.id, newProfile);

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
		cache.setProfile(user.id, profile);

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

export async function updateProfile(supabase, profileData) {
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

		const { error } = await supabase.from('profiles').update(profileData).eq('user_id', user.id);

		if (error) {
			console.error('Error updating profile:', error);
			return {
				success: false,
				error: 'Failed to update profile'
			};
		}

		// Clear cache after successful update
		cache.clearProfile(user.id);

		return {
			success: true
		};
	} catch (error) {
		console.error('Error updating profile:', error);
		return {
			success: false,
			error: 'Failed to update profile'
		};
	}
}
