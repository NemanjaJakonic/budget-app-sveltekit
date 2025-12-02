<script>
	export let data;

	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Chart, registerables } from 'chart.js';
	import { convertToRSD, convertToEUR, convertToUSD } from '$lib/utils';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { getCategoryLabel } from '$lib/constants.js';
	Chart.register(...registerables);

	let totalBalanceRSD;

	const { transactions, profile, rates } = data;

	totalBalanceRSD = profile ? profile.starting_balance : 0;

	let totalBalanceEUR = 0;
	let savings = 0;
	let savingsEUR = 0;
	let savingsPercentage = 0;

	const currentMonth = new Date().getMonth();

	let monthlyData = {
		labels: [],
		income: [],
		expenses: []
	};

	onMount(async () => {
		totalBalanceRSD += transactions.reduce((accumulator, object) => {
			let amount = object.amount;
			switch (object.currency) {
				case 'EUR':
					amount *= rates.RSD;
					break;
				case 'USD':
					amount *= rates.USD * rates.RSD;
					break;
				default:
					amount = amount;
					break;
			}
			if (object.type === 'income') {
				return accumulator + amount;
			} else if (object.type === 'expense') {
				return accumulator - amount;
			}
		}, 0);

		totalBalanceEUR = totalBalanceRSD / rates.RSD;

		const currentYear = new Date().getFullYear();
		const monthlyTotals = Array.from({ length: 12 }, () => ({ income: 0, expenses: 0 }));

		data.transactions.forEach((transaction) => {
			const transactionDate = new Date(transaction.date);
			if (transactionDate.getFullYear() === currentYear) {
				const month = transactionDate.getMonth();
				if (transaction.type === 'income') {
					monthlyTotals[month].income += transaction.amount;
				} else if (transaction.type === 'expense') {
					monthlyTotals[month].expenses += transaction.amount;
				}
			}
		});

		monthlyData.labels = monthlyTotals.map((_, index) =>
			new Date(currentYear, index).toLocaleString('default', { month: 'short' })
		);
		monthlyData.income = monthlyTotals.map((total) => total.income);
		monthlyData.expenses = monthlyTotals.map((total) => total.expenses);

		const ctx = document.getElementById('monthlyChart').getContext('2d');
		new Chart(ctx, {
			type: 'bar',
			data: {
				labels: monthlyData.labels,
				datasets: [
					{
						label: 'Income',
						data: monthlyData.income,
						backgroundColor: '#4dd09e',
						borderRadius: 4,
						borderSkipped: false
					},
					{
						label: 'Expenses',
						data: monthlyData.expenses,
						backgroundColor: '#b9363b',
						borderRadius: 4,
						borderSkipped: false
					}
				]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				},
				plugins: {
					legend: {
						display: false
					}
				}
			}
		});

		let currentMonthIncome = 0;
		let currentMonthExpenses = 0;

		data.transactions.forEach((transaction) => {
			let amount = transaction.amount;
			switch (transaction.currency) {
				case 'EUR':
					amount *= rates.RSD;
					break;
				case 'USD':
					amount *= rates.USD * rates.RSD;
					break;
				default:
					amount = amount;
					break;
			}
			const transactionDate = new Date(transaction.date);
			if (transactionDate.getMonth() === currentMonth) {
				if (transaction.type === 'income') {
					currentMonthIncome += amount;
				} else if (transaction.type === 'expense') {
					currentMonthExpenses += amount;
				}
			}
		});

		savings = currentMonthIncome - currentMonthExpenses;
		savingsEUR = savings / rates.RSD;

		savingsPercentage = currentMonthIncome > 0 ? (savings / currentMonthIncome) * 100 : 0; // Calculate savings percentage

		await invalidateAll();
	});
</script>

<div class="mx-auto mb-4 w-full max-w-xl">
	<div class="p-3 rounded bg-card/40">
		<div>
			<!-- <p class="h-8 text-sm">
				{#if rates}
					EUR exchange rate: <span class="text-primary">{rates.RSD}</span>
				{/if}
			</p> -->
			<p class="pb-2 text-xs font-semibold uppercase">Total balance</p>
			<h2 class="text-xl font-extrabold uppercase">
				{convertToRSD(totalBalanceRSD)}
			</h2>
			<h2 class="text-lg font-extrabold uppercase">
				{convertToEUR(totalBalanceEUR)}
			</h2>
		</div>
	</div>
</div>

<div class="p-3 mx-auto mb-4 max-w-xl rounded bg-card/40">
	<p class="pb-2 text-sm">
		{new Date().toLocaleString('default', { month: 'long' })} Savings:
		<span class="font-bold text-secondary">{convertToEUR(savingsEUR)}</span>
	</p>
	<div class="relative w-full rounded border border-card">
		<div class="flex absolute left-1/2 items-center h-full font-bold -translate-x-1/2">
			{savingsPercentage.toFixed(2)}%
		</div>
		<div
			class="flex justify-center items-center h-6 rounded-tl rounded-bl bg-primary/50"
			style="width: {savingsPercentage}%;"
		></div>
	</div>
</div>

<div class="p-2 mx-auto w-full max-w-xl rounded chart-container bg-card/40">
	<div class="flex gap-4 justify-center pb-4">
		<div class="flex gap-2 items-center">
			<span class="block w-8 h-2 rounded md:w-12 md:h-3.5 bg-income"></span>
			<span class="text-sm text-gray-500">Income</span>
		</div>
		<div class="flex gap-2 items-center">
			<span class="block w-8 h-2 rounded md:w-12 md:h-3.5 bg-expense"></span>
			<span class="text-sm text-gray-500">Expense</span>
		</div>
	</div>

	<canvas id="monthlyChart"></canvas>
</div>

<h3 class="pt-4 text-sm font-bold text-center">Recent Transactions</h3>
<div class="mx-auto w-full max-w-xl">
	<ul>
		{#each data.transactions.slice(0, 3) as transaction}
			<li class="flex gap-4 items-center p-3 my-3 rounded bg-card/40">
				<div class="flex-1 hover:text-primary">
					<a class="text-sm" href="/edit-transaction/{transaction.id}">{transaction.name}</a>
					<p class="text-xs">
						{new Date(transaction.date).toLocaleString('en-GB', {
							weekday: 'long',
							day: 'numeric',
							month: 'short',
							year: 'numeric'
						})}
						{#if transaction.category}
							<span class="ml-2 px-1.5 py-0.5 text-xs rounded bg-primary/20 text-primary"
								>{getCategoryLabel(transaction.category)}</span
							>
						{/if}
					</p>
				</div>
				<span
					class="flex-1 text-sm font-semibold text-right {transaction.type === 'expense'
						? 'text-expense'
						: 'text-income'}"
					>{transaction.type === 'expense' ? '-' : ''}
					{#if transaction.currency === 'EUR'}
						{convertToEUR(transaction.amount)}
					{:else if transaction.currency === 'USD'}
						{convertToUSD(transaction.amount)}
					{:else if transaction.currency === 'RSD'}
						{convertToRSD(transaction.amount)}
					{/if}
				</span>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						><svg
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
						</svg></DropdownMenu.Trigger
					>
					<DropdownMenu.Content>
						<DropdownMenu.Item
							><a href={`/edit-transaction/${transaction.id}`} class="block w-full">Edit</a
							></DropdownMenu.Item
						>
						<DropdownMenu.Item
							><form action="?/deleteTransaction" method="post" use:enhance class="block w-full">
								<input type="hidden" name="id" value={transaction.id} />
								<button type="submit" class="w-full text-left text-red-500">Delete</button>
							</form></DropdownMenu.Item
						>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</li>
		{/each}
	</ul>
</div>
