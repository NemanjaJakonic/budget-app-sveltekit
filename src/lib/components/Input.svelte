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
		class="p-2 w-full text-gray-100 rounded border border-gray-700 transition-colors outline-none md:p-3 bg-gray-900/50 focus:border-primary"
		{type}
		autocomplete="off"
		{name}
		{value}
		{placeholder}
		{disabled}
		{step}
	/>
</div>
