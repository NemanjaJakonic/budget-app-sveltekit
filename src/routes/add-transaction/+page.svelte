<script>
	import { enhance } from '$app/forms';
	import { onDestroy } from 'svelte';
	import Error from '$lib/components/Error.svelte';

	let loading = false;
	let errorMessage = '';
	let name = '';
	let amount = '';
	let errorTimeout;

	function setTemporaryError(message) {
		errorMessage = message;
		if (errorTimeout) clearTimeout(errorTimeout);
		errorTimeout = setTimeout(() => {
			errorMessage = '';
		}, 3000);
	}

	function validateForm() {
		if (!name.trim()) {
			setTemporaryError('Name is required');
			return false;
		}

		const numAmount = Number(amount);
		if (isNaN(numAmount) || numAmount <= 0) {
			setTemporaryError('Please enter a valid amount greater than 0');
			return false;
		}

		errorMessage = '';
		return true;
	}

	function handleSubmit() {
		return async ({ result, update }) => {
			if (!validateForm()) {
				return;
			}

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

<div class="min-h-screen">
	<form
		action="?/addTransaction"
		method="post"
		use:enhance={handleSubmit}
		class="p-4 mx-auto mt-20 max-w-md rounded-3xl md:p-8 bg-gray-800/50"
	>
		<h1 class="mb-10 text-2xl font-semibold text-primary">Add Transaction</h1>

		<div class="mb-6 h-12">
			<Error message={errorMessage} />
		</div>

		<div class="flex flex-col gap-6">
			<div class="space-y-2">
				<label for="name" class="text-sm text-gray-300">Name</label>
				<input
					id="name"
					bind:value={name}
					class="p-3 w-full text-gray-100 rounded-xl border border-gray-700 transition-colors outline-none bg-gray-900/50 focus:border-primary"
					type="text"
					name="name"
					placeholder="Name"
				/>
			</div>

			<div class="space-y-2">
				<label for="type" class="text-sm text-gray-300">Type</label>
				<div
					class="grid grid-cols-2 gap-2 p-3 w-full text-gray-100 rounded-xl border border-gray-700 bg-gray-900/50"
				>
					<label class="relative">
						<input type="radio" name="type" value="income" class="sr-only peer" checked />
						<div
							class="p-2 text-center rounded-lg transition-all cursor-pointer peer-checked:bg-primary peer-checked:text-white hover:bg-primary/20"
						>
							Income
						</div>
					</label>

					<label class="relative">
						<input type="radio" name="type" value="expense" class="sr-only peer" />
						<div
							class="p-2 text-center rounded-lg transition-all cursor-pointer peer-checked:bg-primary peer-checked:text-white hover:bg-primary/20"
						>
							Expense
						</div>
					</label>
				</div>
			</div>

			<div class="space-y-2">
				<label for="amount" class="text-sm text-gray-300">Amount</label>
				<input
					id="amount"
					bind:value={amount}
					class="p-3 w-full text-gray-100 rounded-xl border border-gray-700 transition-colors outline-none bg-gray-900/50 focus:border-primary"
					type="text"
					name="amount"
					placeholder="Amount"
				/>
			</div>

			<div class="space-y-2">
				<label for="date" class="text-sm text-gray-300">Date</label>
				<input
					id="date"
					class="p-3 w-full text-gray-100 rounded-xl border border-gray-700 transition-colors outline-none bg-gray-900/50 focus:border-primary [color-scheme:dark]"
					type="date"
					name="date"
					value={new Date().toISOString().split('T')[0]}
				/>
			</div>

			<button
				class="relative py-3 mt-4 w-full text-white rounded-xl shadow-lg transition-all duration-300 bg-primary hover:bg-primary/60 disabled:opacity-70 shadow-primary/20"
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
