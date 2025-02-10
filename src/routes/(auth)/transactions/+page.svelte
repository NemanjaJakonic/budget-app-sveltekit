<script>
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { convertToRSD, convertToEUR, convertToUSD } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import Dropdown from '$lib/components/Dropdown.svelte';

	export let data;

	let transactions = data.transactions;
	let currentPage = parseInt($page.url.searchParams.get('page')) || 1;
	const itemsPerPage = 6;

	// Filter states - default to current month/year
	let selectedMonth = parseInt($page.url.searchParams.get('month')) || new Date().getMonth() + 1; // +1 because getMonth() is 0-based
	let selectedYear = parseInt($page.url.searchParams.get('year')) || new Date().getFullYear();

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

	// Track previous filter values to detect changes
	let previousMonth = selectedMonth;
	let previousYear = selectedYear;

	// Reset pagination only when filters change
	$: {
		if (selectedMonth !== previousMonth || selectedYear !== previousYear) {
			currentPage = 1;
			previousMonth = selectedMonth;
			previousYear = selectedYear;
		}
	}

	// Handle page changes
	function changePage(newPage) {
		if (newPage >= 1 && newPage <= totalPages) {
			currentPage = newPage;
		}
	}

	// Track previous URL state
	let timeoutId;
	let previousUrl = '';

	// Update URL when filters or page changes - debounced
	$: if (browser) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			const url = new URL($page.url);

			// Only update if values have changed
			if (url.searchParams.get('page') !== String(currentPage)) {
				url.searchParams.set('page', currentPage);
			}
			if (url.searchParams.get('month') !== String(selectedMonth)) {
				url.searchParams.set('month', selectedMonth);
			}
			const yearValue = selectedYear === 'All Years' ? '' : String(selectedYear);
			if (url.searchParams.get('year') !== yearValue) {
				yearValue ? url.searchParams.set('year', yearValue) : url.searchParams.delete('year');
			}

			// Only navigate if URL has actually changed
			if (url.toString() !== previousUrl) {
				previousUrl = url.toString();
				goto(url, { replaceState: true, keepfocus: true });
			}
		}, 150); // 150ms debounce
	}

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

<div class="mx-auto w-full max-w-xl rounded-lg md:pt-10">
	<div class="flex justify-between items-center pb-4">
		<h1 class="text-base font-bold text-white md:text-lg">All Transactions</h1>
		<button
			on:click={exportToExcel}
			class="flex gap-2 items-center px-2 py-1.5 text-sm text-white rounded-md transition-colors md:py-2 md:px-4 bg-primary hover:bg-primary/80"
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
					<option value={i} selected={i === selectedMonth}>{month}</option>
				{/each}
			</select>

			<select
				bind:value={selectedYear}
				class="p-2 text-white rounded-md border border-gray-700 bg-gray-800/40"
			>
				{#each years as year}
					<option value={year} selected={year === selectedYear}>{year}</option>
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
						<Dropdown id={transaction.id} />
					</li>
				{/each}

				<!-- Pagination -->
				{#if totalPages > 1}
					<div class="flex gap-2 justify-center mt-6">
						<button
							class="px-4 py-2 text-white rounded-md border border-gray-700 bg-gray-800/40 hover:bg-gray-700/40 disabled:opacity-50"
							disabled={currentPage === 1}
							on:click={() => changePage(currentPage - 1)}
						>
							Previous
						</button>

						<span class="px-4 py-2 text-white">
							Page {currentPage} of {totalPages}
						</span>

						<button
							class="px-4 py-2 text-white rounded-md border border-gray-700 bg-gray-800/40 hover:bg-gray-700/40 disabled:opacity-50"
							disabled={currentPage === totalPages}
							on:click={() => changePage(currentPage + 1)}
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
