<script>
	import { Motion } from 'svelte-motion';
	import { cva } from 'class-variance-authority';
	import { cn } from '$lib/utils';

	let className = undefined;
	export { className as class };
	export let magnification = 60;
	export let distance = 140;
	export let direction = 'middle';

	const dockVariants = cva(
		'mx-auto w-max  h-[58px] flex gap-2 supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 backdrop-blur-md'
	);

	let dockElement;
	let mouseX = Infinity;
	function handleMouseMove(e) {
		mouseX = e.pageX;
	}

	function handleMouseLeave() {
		mouseX = Infinity;
	}

	let dockClass = cn(dockVariants({ className }), {
		'items-start': direction === 'top',
		'items-center': direction === 'middle',
		'items-end': direction === 'bottom'
	});
</script>

<Motion let:motion>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		use:motion
		bind:this={dockElement}
		on:mousemove={(e) => handleMouseMove(e)}
		on:mouseleave={handleMouseLeave}
		class={dockClass}
	>
		<slot {mouseX} {magnification} {distance}>
			<!-- Your Content -->
			Default
		</slot>
	</div>
</Motion>
