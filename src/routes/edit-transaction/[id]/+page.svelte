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

	let id = transaction[0].id;
	let name = transaction[0].name;
	let type = transaction[0].type;
	let amount = transaction[0].amount;
	let currency = transaction[0].currency;
	let date = transaction[0].date;

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

<div class="pt-8 md:pt-10">
	<div class="flex justify-between items-center pb-4 mx-auto max-w-lg">
		<a href="/">
			<span class="text-white hover:text-primary">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
					/>
				</svg>
			</span>
		</a>

		<h1 class="text-xl font-bold md:text-2xl text-primary">Edit Transaction</h1>
		<span />
	</div>
	<form
		action="?/editTransaction"
		method="post"
		use:enhance={handleSubmit}
		class="p-4 mx-auto max-w-lg rounded-lg md:p-8 bg-gray-800/50"
	>
		<div class="mb-2 h-10">
			<Error message={errorMessage} />
		</div>
		<input type="hidden" name="id" value={id} />

		<div class="flex flex-col gap-4 md:gap-6">
			<div class="flex gap-4 items-end">
				<div class="w-2/3">
					<Input name="name" type="text" value={name} placeholder="Name" label="Name" />
				</div>
				<div class="w-1/3">
					<div class="relative space-y-2">
						<label for="type" class="text-sm text-gray-300">Type</label>
						<select
							name="type"
							id="type"
							class="p-2 w-full text-gray-100 rounded border border-gray-700 transition-colors appearance-none outline-none md:p-3 bg-gray-900/50 focus:border-primary"
						>
							<option value="expense" selected={type === 'expense'}>Expense</option>
							<option value="income" selected={type === 'income'}>Income</option>
						</select>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.2"
							stroke="currentColor"
							class="absolute right-2.5 top-1/2 ml-1 w-5 h-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
							/>
						</svg>
					</div>
				</div>
			</div>
			<div class="flex gap-4 items-end">
				<div class="w-2/3">
					<Input name="amount" type="text" value={amount} placeholder="Amount" label="Amount" />
				</div>
				<div class="w-1/3">
					<div class="relative space-y-2 w-full">
						<label for="currency" class="text-sm text-gray-300">Currency</label>
						<select
							name="currency"
							id="currency"
							class="p-2 w-full text-gray-100 rounded border border-gray-700 transition-colors appearance-none outline-none md:p-3 bg-gray-900/50 focus:border-primary"
						>
							<option value="RSD" selected={type === 'RSD'}>RSD</option>
							<option value="EUR" selected={type === 'EUR'}>EUR</option>
							<option value="USD" selected={type === 'USD'}>USD</option>
						</select>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.2"
							stroke="currentColor"
							class="absolute right-2.5 top-1/2 ml-1 w-5 h-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
							/>
						</svg>
					</div>
				</div>
			</div>

			<Input
				name="date"
				type="date"
				label="Date"
				value={new Date(date).toISOString().split('T')[0]}
			/>

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
