<script>
	export let data;
	import { enhance } from '$app/forms';
	import { onDestroy } from 'svelte';
	import Error from '$lib/components/Error.svelte';
	import Input from '$lib/components/Input.svelte';
	const { transaction } = data;

	let loading = false;
	let errorMessage = '';
	let errorTimeout;

	function setTemporaryError(message) {
		errorMessage = message;
		if (errorTimeout) clearTimeout(errorTimeout);
		errorTimeout = setTimeout(() => {
			errorMessage = '';
		}, 3000);
	}

	function handleSubmit() {
		return async ({ result, update }) => {
			loading = true;

			if (result.type === 'failure') {
				setTemporaryError(result.data.message);
				loading = false;
			}

			if (result.type === 'redirect') {
				await update();
			}
		};
	}
	onDestroy(() => {
		if (errorTimeout) clearTimeout(errorTimeout);
	});
</script>

<div class="pt-10 md:pt-20">
	<div class="flex justify-between items-center mb-4">
		<a href="/">
			<span class="text-primary">
				<svg
					class="fill-current"
					width="21"
					height="18"
					viewBox="0 0 21 18"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M11.5642 1L0.999999 8.99685M0.999999 8.99685L11.5642 17M0.999999 8.99685L20 8.99686"
						stroke="#F1FFF3"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</span>
		</a>

		<h1 class="text-xl font-semibold md:text-2xl text-primary">Edit Transaction</h1>
		<span />
	</div>
	<form
		action="?/editTransaction"
		method="post"
		use:enhance={handleSubmit}
		class="p-4 mx-auto max-w-md rounded-lg md:p-8 bg-gray-800/50"
	>
		<div class="mb-2 h-10">
			<Error message={errorMessage} />
		</div>
		<input type="hidden" name="id" value={transaction[0].id} />

		<div class="flex flex-col gap-4 md:gap-6">
			<Input name="name" type="text" value={transaction[0].name} placeholder="Name" />

			<div class="space-y-2">
				<label for="type" class="text-sm text-gray-300">Type</label>
				<div
					class="grid grid-cols-2 gap-2 p-1.5 w-full text-gray-100 rounded border border-gray-700 md:p-3 bg-gray-900/50"
				>
					<label class="relative">
						<input type="radio" name="type" value="income" class="sr-only peer" checked />
						<div
							class="p-1 text-center rounded transition-all cursor-pointer md:p-2 peer-checked:bg-primary peer-checked:text-white hover:bg-primary/20"
						>
							Income
						</div>
					</label>

					<label class="relative">
						<input type="radio" name="type" value="expense" class="sr-only peer" />
						<div
							class="p-1 text-center rounded transition-all cursor-pointer md:p-2 peer-checked:bg-primary peer-checked:text-white hover:bg-primary/20"
						>
							Expense
						</div>
					</label>
				</div>
			</div>
			<Input name="amount" type="text" value={transaction[0].amount} placeholder="Amount" />

			<button
				class="relative py-2 mt-4 w-full text-white rounded shadow-lg transition-all duration-300 md:py-3 bg-primary hover:bg-primary/60 disabled:opacity-70 shadow-primary/20"
				disabled={loading}
			>
				{#if loading}
					<div class="flex absolute inset-0 justify-center items-center">
						<svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
								fill="none"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</div>
				{/if}
				<span class={loading ? 'opacity-0' : ''}>SUBMIT</span>
			</button>
		</div>
	</form>
</div>
