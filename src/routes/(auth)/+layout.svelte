<script>
	import '../../app.css';

	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Transition from '$lib/components/Transition.svelte';
	import { navigating } from '$app/stores';

	import GridBeam from '$lib/components/GridBeam.svelte';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	let showSpinner = $state(false);
	let timer;

	// $effect(() => {
	// 	if ($navigating) {
	// 		if (timer) clearTimeout(timer);

	// 		timer = setTimeout(() => {
	// 			showSpinner = true;
	// 		}, 700);

	// 		$navigating?.complete.then(() => {
	// 			clearTimeout(timer);
	// 			showSpinner = false;
	// 		});
	// 	} else {
	// 		if (timer) clearTimeout(timer);
	// 		showSpinner = false;
	// 	}
	// });

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<!-- {#if $navigating}
	<div class="flex justify-center items-center min-h-screen">
		<div class="w-12 h-12 rounded-full border-t-2 border-b-2 animate-spin border-primary"></div>
	</div>
{:else} -->
<Header firstName={session ? session.user.user_metadata.first_name : ''} />

<main class="container px-4 mx-auto md:px-0 min-h-[calc(100vh-7rem)]">
	<!-- <GridBeam class="flex justify-start items-start pt-28 pl-4 sm:pl-16"> -->
	<div class="pt-6 pb-20">
		<Transition key={data.url}>
			{@render children()}
		</Transition>
	</div>
	<!-- </GridBeam> -->
</main>

<Footer />

<!-- {/if} -->
