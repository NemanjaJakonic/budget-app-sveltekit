<script>
	import '../app.css';

	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { navigating } from '$app/stores';

	export let data;

	$: ({ supabase, session } = data);

	let showSpinner = false;

	$: {
		if ($navigating) {
			const timer = setTimeout(() => {
				showSpinner = true;
			}, 700);

			// Clean up timeout if navigation finishes before delay
			$navigating?.complete.then(() => {
				clearTimeout(timer);
				showSpinner = false;
			});
		} else {
			showSpinner = false;
		}
	}

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

{#if $navigating && showSpinner}
	<div class="flex justify-center items-center min-h-screen">
		<div class="w-12 h-12 rounded-full border-t-2 border-b-2 animate-spin border-primary" />
	</div>
{:else}
	{#if data.session}
		<Header session={data.session} />
	{/if}
	<main class="container px-4 mx-auto md:px-0 min-h-[calc(100vh-7rem)]">
		<slot />
	</main>
	{#if data.session}
		<Footer />
	{/if}
{/if}
