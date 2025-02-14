<script>
	import { fade } from 'svelte/transition';
	export let key;
	export let duration = 300;
</script>

{#key key}
	<div in:fade={{ duration, delay: duration }} out:fade={{ duration }}>
		<slot />
	</div>
{/key}
