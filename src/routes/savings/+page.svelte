<script>
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { convertToEUR } from '$lib/utils';

	export let data;
	const { rates } = data;

	let selectedYear = new Date().getFullYear();
	let years = [];
	let monthlyData = {};
	let yearlyTotal = { income: 0, expense: 0, savings: 0 };

	// Generate array of years from transactions
	onMount(() => {
		const uniqueYears = [...new Set(data.transactions.map((t) => new Date(t.date).getFullYear()))];
		years = uniqueYears.sort((a, b) => b - a);
		if (!years.includes(selectedYear)) {
			selectedYear = years[0] || new Date().getFullYear();
		}
		calculateData();
	});

	function calculateData() {
		// Reset data
		monthlyData = {};
		yearlyTotal = { income: 0, expense: 0, savings: 0 };

		// Filter transactions for selected year
		const yearTransactions = data.transactions.filter(
			(t) => new Date(t.date).getFullYear() === selectedYear
		);

		// Calculate monthly totals
		yearTransactions.forEach((transaction) => {
			let amount = transaction.amount;
			switch (transaction.currency) {
				case 'EUR':
					amount = amount;
					break;
				case 'USD':
					amount *= rates.USD;
					break;
				default:
					amount /= rates.RSD;
					break;
			}

			const month = new Date(transaction.date).getMonth();
			if (!monthlyData[month]) {
				monthlyData[month] = { income: 0, expense: 0, savings: 0 };
			}

			if (transaction.type === 'income') {
				monthlyData[month].income += Number(amount);
				yearlyTotal.income += Number(amount);
			} else {
				monthlyData[month].expense += Number(amount);
				yearlyTotal.expense += Number(amount);
			}

			monthlyData[month].savings = monthlyData[month].income - monthlyData[month].expense;
		});

		yearlyTotal.savings = yearlyTotal.income - yearlyTotal.expense;
	}

	$: if (selectedYear) {
		calculateData();
	}

	const months = [
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
</script>

<div class="pt-8 mx-auto w-full max-w-xl rounded-lg md:pt-10">
	<h1 class="pb-4 text-lg font-bold text-center text-white md:text-xl">Savings</h1>
	<div class="flex justify-between items-center pb-4">
		<div class="relative">
			<select
				bind:value={selectedYear}
				class="p-2 pr-8 text-gray-100 rounded border border-gray-700 transition-colors appearance-none outline-none bg-gray-900/50 focus:border-primary"
			>
				{#each years as year}
					<option value={year}>{year}</option>
				{/each}
			</select>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.2"
				stroke="currentColor"
				class="absolute right-2 top-1/2 w-4 h-4 -translate-y-1/2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
				/>
			</svg>
		</div>
	</div>

	<div class="py-2 rounded-lg md:py-4">
		<!-- Yearly Summary -->
		<h2 class="mb-4 text-base font-semibold text-white">Yearly Summary - {selectedYear}</h2>
		<div class="grid grid-cols-3 gap-4">
			<div class="p-2 rounded-lg bg-income/10">
				<p class="text-sm text-income">Total Income</p>
				<p class="text-lg font-bold text-income">
					{convertToEUR(yearlyTotal.income)}
				</p>
			</div>
			<div class="p-2 rounded-lg bg-expense/10">
				<p class="text-sm text-expense">Total Expenses</p>
				<p class="text-lg font-bold text-expense">{convertToEUR(yearlyTotal.expense)}</p>
			</div>
			<div class="p-2 rounded-lg bg-primary/10">
				<p class="text-sm text-primary">Total Savings</p>
				<p class="text-lg font-bold text-primary">{convertToEUR(yearlyTotal.savings)}</p>
			</div>
		</div>
	</div>
	<div class="py-2 mt-4 rounded-lg md:py-4">
		<!-- Monthly Breakdown -->
		<div class="space-y-4">
			<h2 class="text-base font-semibold text-white">Monthly Breakdown</h2>
			<div class="grid gap-4 md:grid-cols-2">
				{#each months as month, index}
					{#if monthlyData[index]}
						<div class="p-3 rounded-lg bg-gray-900/50">
							<h3 class="mb-3 font-medium text-gray-300 text-md">{month}</h3>
							<div class="space-y-2">
								<div class="flex justify-between">
									<span class="text-income">Income:</span>
									<span class="font-medium text-income"
										>{convertToEUR(monthlyData[index].income)}</span
									>
								</div>
								<div class="flex justify-between">
									<span class="text-expense">Expenses:</span>
									<span class="font-medium text-expense"
										>{convertToEUR(monthlyData[index].expense)}</span
									>
								</div>
								<div class="flex justify-between pt-2 border-t border-gray-700">
									<span class="text-primary">Savings:</span>
									<span class="font-medium text-primary"
										>{convertToEUR(monthlyData[index].savings)}</span
									>
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>
