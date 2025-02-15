<script>
	import { fade } from 'svelte/transition';
	import { isTransitioning } from '$lib/stores/transition.js';
	let { key, duration, children } = $props();
</script>

{#key key}
	<div
		in:fade={{ duration, delay: duration }}
		out:fade={{ duration }}
		onintrostart={() => isTransitioning.set(true)}
		onoutrostart={() => isTransitioning.set(true)}
		onintroend={() => isTransitioning.set(false)}
		onoutroend={() => isTransitioning.set(false)}
	>
		{@render children()}
	</div>
{/key}
