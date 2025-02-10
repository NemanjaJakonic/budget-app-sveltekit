<script>
	import '../../app.css';

	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { navigating } from '$app/stores';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	let showSpinner = false;

	$effect(() => {
		if ($navigating) {
			timer = setTimeout(() => {
				$showSpinner = true;
			}, 700);

			// Clean up timeout if navigation finishes before delay
			$navigating?.complete.then(() => {
				clearTimeout(timer);
				$showSpinner = false;
			});
		} else {
			$showSpinner = false;
		}
	});

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

{#if $navigating && showSpinner}
	<div class="flex justify-center items-center min-h-screen">
		<div class="w-12 h-12 rounded-full border-t-2 border-b-2 animate-spin border-primary"></div>
	</div>
{:else}
	<Header firstName={session ? session.user.user_metadata.first_name : ''} />
	<main class="container px-4 mx-auto md:px-0 min-h-[calc(100vh-7rem)]">
		{@render children()}
	</main>
	<Footer />
{/if}
