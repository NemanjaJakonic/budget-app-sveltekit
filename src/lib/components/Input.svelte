<script>
	export let name = '';
	export let type = '';
	export let value = '';
	export let placeholder = '';
	export let label = '';
	export let step = '';
	export let disabled = false;
</script>

<div class="space-y-2">
	<label for={name} class="text-sm text-gray-300">{label}</label>
	<input
		id={name}
		class="p-2 w-full leading-[21px] text-gray-100 rounded border border-gray-700 transition-colors outline-none bg-footerheader focus:border-primary"
		{type}
		autocomplete="off"
		{name}
		{placeholder}
		{disabled}
		{step}
		bind:value
	/>
</div>
