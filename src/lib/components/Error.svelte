<script>
	export let message = '';
</script>

{#if message}
	<div class="p-2 text-sm text-center text-red-400 rounded md:p-3 bg-red-900/20">
		{message}
	</div>
{/if}
