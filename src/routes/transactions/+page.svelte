<script>
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { convertToRSD, convertToEUR, convertToUSD } from '$lib/utils';

	export let data;

	let transactions = data.transactions;
	let currentPage = 1;
	const itemsPerPage = 6;

	// Filter states
	let selectedMonth = new Date().getMonth();
	let selectedYear = new Date().getFullYear();

	const months = [
		'All Months',
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	// Generate last 3 years for filter
	const currentYear = new Date().getFullYear();
	const years = ['All Years', ...Array.from({ length: 3 }, (_, i) => currentYear - i)];

	// Filter transactions based on selected month and year
	$: filteredTransactions = transactions.filter((transaction) => {
		const transactionDate = new Date(transaction.date);
		const monthMatch = selectedMonth === 0 || transactionDate.getMonth() === selectedMonth - 1;
		const yearMatch =
			selectedYear === 'All Years' || transactionDate.getFullYear() === selectedYear;
		return monthMatch && yearMatch;
	});

	// Pagination logic
	$: totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
	$: paginatedTransactions = filteredTransactions.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// Reset pagination when filters change
	$: {
		selectedMonth;
		selectedYear;
		currentPage = 1;
	}

	let isDropdownOpen = {}; // Track dropdown states by transaction ID

	const handleDropdownClick = (transactionId) => {
		isDropdownOpen[transactionId] = !isDropdownOpen[transactionId];
	};

	const handleDropdownFocusLoss = () => {
		isDropdownOpen = {};
	};

	async function exportToExcel() {
		try {
			const response = await fetch('/api/export-transactions');
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'transactions.xlsx';
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			a.remove();
		} catch (error) {
			console.error('Failed to export transactions:', error);
		}
	}
</script>

<div class="pt-8 mx-auto w-full max-w-xl rounded-lg md:pt-10">
	<div class="flex justify-between items-center pb-4">
		<h1 class="text-lg font-bold text-white md:text-xl">All Transactions</h1>
		<button
			on:click={exportToExcel}
			class="flex gap-2 items-center px-4 py-2 text-sm text-white rounded-md transition-colors bg-primary hover:bg-primary/80"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
				/>
			</svg>
			Export to Excel
		</button>
	</div>
	<div class="py-3 rounded-lg">
		<!-- Filters -->
		<div class="flex gap-4">
			<select
				bind:value={selectedMonth}
				class="p-2 text-white rounded-md border border-gray-700 bg-gray-800/40"
			>
				{#each months as month, i}
					<option value={i}>{month}</option>
				{/each}
			</select>

			<select
				bind:value={selectedYear}
				class="p-2 text-white rounded-md border border-gray-700 bg-gray-800/40"
			>
				{#each years as year}
					<option value={year}>{year}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Transactions List -->
	<div class="pb-2 mx-auto w-full max-w-xl rounded-lg">
		<ul>
			{#if paginatedTransactions.length > 0}
				{#each paginatedTransactions as transaction}
					<li class="flex gap-4 items-center p-3 my-3 rounded-lg bg-gray-800/40">
						<div class="flex-1 hover:text-primary">
							<a href="/edit-transaction/{transaction.id}">{transaction.name}</a>
							<p class="text-xs">{new Date(transaction.date).toLocaleDateString()}</p>
						</div>
						<span
							class="flex-1 font-semibold text-right {transaction.type === 'expense'
								? 'text-expense'
								: 'text-income'}"
						>
							{transaction.type === 'expense' ? '-' : ''}
							{transaction.currency === 'EUR'
								? convertToEUR(transaction.amount)
								: transaction.currency === 'USD'
								? convertToUSD(transaction.amount)
								: convertToRSD(transaction.amount)}
						</span>

						<div class="relative">
							<button on:click={() => handleDropdownClick(transaction.id)}>
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
										d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
									/>
								</svg>
							</button>
							<div
								on:focusout={handleDropdownFocusLoss}
								class="absolute right-0 z-10 mt-2 w-40 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg focus:outline-none"
								style:visibility={isDropdownOpen[transaction.id] ? 'visible' : 'hidden'}
							>
								<div class="py-1">
									<a
										href={`/edit-transaction/${transaction.id}`}
										class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										role="menuitem">Edit</a
									>
									<form action="?/deleteTransaction" method="post" use:enhance>
										<input type="hidden" name="id" value={transaction.id} />
										<button
											type="submit"
											class="block px-4 py-2 w-full text-sm text-left text-red-500 hover:bg-gray-100"
											>Delete</button
										>
									</form>
								</div>
							</div>
						</div>
					</li>
				{/each}

				<!-- Pagination -->
				{#if totalPages > 1}
					<div class="flex gap-2 justify-center mt-6">
						<button
							class="px-4 py-2 text-white rounded-md border border-gray-700 bg-gray-800/40 hover:bg-gray-700/40 disabled:opacity-50"
							disabled={currentPage === 1}
							on:click={() => currentPage--}
						>
							Previous
						</button>

						<span class="px-4 py-2 text-white">
							Page {currentPage} of {totalPages}
						</span>

						<button
							class="px-4 py-2 text-white rounded-md border border-gray-700 bg-gray-800/40 hover:bg-gray-700/40 disabled:opacity-50"
							disabled={currentPage === totalPages}
							on:click={() => currentPage++}
						>
							Next
						</button>
					</div>
				{/if}
			{:else}
				<div class="py-8 text-center text-gray-500">
					No transactions found for the selected period
				</div>
			{/if}
		</ul>
	</div>
</div>
