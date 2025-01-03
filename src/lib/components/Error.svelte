<script>
	export let message = '';
</script>

{#if message}
	<div class="p-3 text-sm text-center text-red-400 rounded-xl bg-red-900/20">
		{message}
	</div>
{/if}
