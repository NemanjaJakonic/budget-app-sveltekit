<script>
	import { page } from '$app/stores';
	import { Motion } from 'svelte-motion';
	let { children } = $props();
</script>

<div>
	<Motion
		whileTap={{
			scale: 0.84
		}}
		let:motion
	>
		<div use:motion>
			{@render children()}
		</div>
	</Motion>
</div>
