<script>
	import { fade } from 'svelte/transition';
	let { key, children } = $props();
</script>

{#key key}
	<div in:fade>
		{@render children()}
	</div>
{/key}
