<script>
	export let data;
	import Footer from '$lib/components/Footer.svelte';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Chart, registerables } from 'chart.js';
	Chart.register(...registerables);

	let rates = data.rates;
	let totalBalanceRSD = 2937000;
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

	function convertToRSD(amount) {
		const currencyFormat = new Intl.NumberFormat('sr-Latn-RS', {
			style: 'currency',
			currency: 'EUR'
		});
		return currencyFormat.format(amount).replace('€', 'RSD');
	}

	function convertToEUR(amount) {
		const currencyFormat = new Intl.NumberFormat('sr-Latn-RS', {
			style: 'currency',
			currency: 'EUR'
		});
		return currencyFormat.format(amount);
	}

	function convertToUSD(amount) {
		const currencyFormat = new Intl.NumberFormat('sr-Latn-RS', {
			style: 'currency',
			currency: 'USD'
		});
		return currencyFormat.format(amount);
	}

	const { session, transactions, supabase } = data;

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
			new Date(currentYear, index).toLocaleString('default', { month: 'long' })
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
						backgroundColor: 'rgba(75, 192, 192, 0.6)'
					},
					{
						label: 'Expenses',
						data: monthlyData.expenses,
						backgroundColor: 'rgba(255, 99, 132, 0.6)'
					}
				]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});

		let currentMonthIncome = 0;
		let currentMonthExpenses = 0;

		data.transactions.forEach((transaction) => {
			const transactionDate = new Date(transaction.date);
			if (transactionDate.getMonth() === currentMonth) {
				if (transaction.type === 'income') {
					currentMonthIncome += transaction.amount;
				} else if (transaction.type === 'expense') {
					currentMonthExpenses += transaction.amount;
				}
			}
		});

		savings = currentMonthIncome - currentMonthExpenses;
		savingsEUR = savings / rates.RSD;

		savingsPercentage = currentMonthIncome > 0 ? (savings / currentMonthIncome) * 100 : 0; // Calculate savings percentage

		// const ctx = document.getElementById('monthlyChart').getContext('2d');
		// new Chart(ctx, {
		// 	type: 'doughnut',
		// 	data: {
		// 		labels: ['Income', 'Expenses'],
		// 		datasets: [
		// 			{
		// 				data: [
		// 					currentMonthTotals[currentMonth].income,
		// 					currentMonthTotals[currentMonth].expenses
		// 				],
		// 				backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)']
		// 			}
		// 		]
		// 	},
		// 	options: {
		// 		responsive: true,
		// 		plugins: {
		// 			legend: {
		// 				position: 'top'
		// 			},
		// 			title: {
		// 				display: true,
		// 				text: 'Chart.js Pie Chart'
		// 			}
		// 		}
		// 	}
		// });

		await invalidateAll();
	});

	async function deleteTransaction({ request }) {
		const session = await getSession();
		const formData = await request.formData();
		const id = formData.get('id');
		const { error } = await supabase
			.from('transactions')
			.delete()
			.match({ id: id, user_id: session.user.id });

		if (error) {
			return fail(500, { message: 'Server error. Try again later.', success: false, email });
		}
		await invalidateAll();
	}

	let isDropdownOpen = {}; // Change to an object to track dropdown states by transaction ID

	const handleDropdownClick = (transactionId) => {
		isDropdownOpen[transactionId] = !isDropdownOpen[transactionId]; // Toggle state for the specific transaction
	};

	const handleDropdownFocusLoss = ({ relatedTarget, currentTarget }) => {
		// ... existing code ...
		isDropdownOpen = {}; // Close all dropdowns when focus is lost
	};
</script>

{#if data.session}
	<div class="flex justify-between py-4 mx-auto max-w-xl font-bold">
		<p>Welcome back, {data.session.user.user_metadata.first_name}!</p>
		<form action="/logout" method="post">
			<button class="flex hover:text-primary" type="submit">
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
						d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
					/>
				</svg>
				<span>Log Out</span>
			</button>
		</form>
	</div>
	<div class="pb-4 mx-auto w-full max-w-xl rounded-lg md:py-6">
		<div class="py-2 rounded">
			<div>
				<p class="h-8">
					{#if rates}
						Današnji EUR kurs: <span class="text-primary">{rates.RSD}</span>
					{/if}
				</p>
				<p class="text-xs font-bold uppercase">Total balance</p>
				<h2 class="text-2xl font-extrabold uppercase">
					{convertToRSD(totalBalanceRSD)}
				</h2>
				<h2 class="text-2xl font-extrabold uppercase">
					{convertToEUR(totalBalanceEUR)}
				</h2>
			</div>
		</div>
	</div>

	<div class="pt-2 mx-auto w-full max-w-xl chart-container">
		<canvas id="monthlyChart" />
	</div>

	<div class="pt-8 mx-auto max-w-xl">
		<p>
			{new Date().toLocaleString('default', { month: 'long' })} Savings:
			<span class="font-bold">{convertToEUR(savingsEUR)}</span>
		</p>
		<div class="relative w-full rounded border">
			<div class="flex absolute left-1/2 items-center h-full font-bold -translate-x-1/2">
				{savingsPercentage.toFixed(2)}%
			</div>
			<div
				class="flex justify-center items-center h-8 rounded-tl rounded-bl bg-primary"
				style="width: {savingsPercentage}%;"
			/>
		</div>
	</div>

	<h3 class="pt-4 text-xl font-bold text-center text-primary">Transactions</h3>
	<div class="py-4 mx-auto w-full max-w-xl rounded-lg md:py-6">
		<ul>
			{#each data.transactions as transaction}
				<li class="flex gap-4 items-center p-3 my-3 rounded-lg bg-gray-800/40">
					<div class="flex-1 hover:text-primary">
						<a href="/edit-transaction/{transaction.id}">{transaction.name}</a>
						<p class="text-xs">{transaction.date}</p>
					</div>
					<span
						class="flex-1 font-semibold text-right {transaction.type === 'expense'
							? 'text-red-400'
							: 'text-green-400'}"
						>{transaction.type === 'expense' ? '-' : ''}
						{#if transaction.currency === 'EUR'}
							{convertToEUR(transaction.amount)}
						{:else if transaction.currency === 'USD'}
							{convertToUSD(transaction.amount)}
						{:else if transaction.currency === 'RSD'}
							{convertToRSD(transaction.amount)}
						{/if}
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
		</ul>
	</div>
{:else}
	<div class="flex inset-x-0 justify-center pt-40">
		<svg
			width="160"
			height="160"
			viewBox="0 0 160 160"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M146.675 61.075V141.95C146.749 143.598 146.496 145.244 145.93 146.794C145.364 148.344 144.498 149.766 143.38 150.979C142.262 152.192 140.915 153.172 139.417 153.862C137.919 154.552 136.299 154.939 134.65 155H25.325C23.6721 154.936 22.0482 154.544 20.5477 153.848C19.0472 153.152 17.6998 152.165 16.5836 150.944C15.4673 149.723 14.6046 148.293 14.0452 146.736C13.4859 145.179 13.2411 143.527 13.325 141.875V61.075C13.2376 59.4209 13.4799 57.7659 14.0377 56.2063C14.5955 54.6466 15.4577 53.2134 16.5743 51.9898C17.6908 50.7663 19.0394 49.7769 20.5416 49.079C22.0439 48.3812 23.6698 47.989 25.325 47.925H134.65C137.986 48.0807 141.125 49.5519 143.378 52.0165C145.632 54.4811 146.818 57.7383 146.675 61.075Z"
				fill="#C18E59"
			/>
			<path
				d="M146.65 118.175H112.75C110.761 118.175 108.853 117.385 107.447 115.978C106.04 114.572 105.25 112.664 105.25 110.675V92.35C105.25 90.3609 106.04 88.4532 107.447 87.0467C108.853 85.6402 110.761 84.85 112.75 84.85H146.65V118.175ZM66.4 30C66.3878 35.5869 68.2644 41.0139 71.725 45.4C71.0118 46.2966 70.2258 47.1328 69.375 47.9H34.65C32.1899 45.5153 30.2462 42.6504 28.9396 39.4831C27.633 36.3157 26.9914 32.9137 27.0547 29.488C27.1179 26.0624 27.8846 22.6863 29.3072 19.5694C30.7297 16.4525 32.7778 13.6612 35.3242 11.3689C37.8707 9.07658 40.8611 7.33217 44.1099 6.24393C47.3587 5.15569 50.7965 4.74686 54.2099 5.04282C57.6233 5.33878 60.9395 6.33321 63.9525 7.96437C66.9655 9.59554 69.6111 11.8286 71.725 14.525C68.2501 18.9322 66.3728 24.3877 66.4 30Z"
				fill="#F4A93C"
			/>
			<path
				d="M50.85 41.5V38.05C49.0008 38.0346 47.1922 37.5067 45.625 36.525L46.425 34.25C47.9219 35.1944 49.6551 35.697 51.425 35.7C53.925 35.7 55.5 34.3 55.5 32.35C55.5 30.4 54.15 29.3 51.625 28.275C48.125 26.925 45.975 25.35 45.975 22.35C45.9959 20.9529 46.5384 19.6141 47.4959 18.5964C48.4534 17.5788 49.7567 16.9559 51.15 16.85V13.4H53.275V16.7C54.8354 16.7213 56.3654 17.134 57.725 17.9L56.85 20.175C55.5431 19.3733 54.0328 18.9654 52.5 19C49.85 19 48.875 20.575 48.875 21.95C48.875 23.725 50.125 24.625 53.1 25.85C56.65 27.3 58.425 29.075 58.425 32.125C58.3937 33.5902 57.8229 34.9923 56.8218 36.0626C55.8207 37.1328 54.4598 37.796 53 37.925V41.5H50.85ZM116.4 30C116.407 33.3578 115.732 36.682 114.417 39.7716C113.102 42.8612 111.174 45.652 108.75 47.975H74.025C73.1838 47.2135 72.4139 46.3767 71.725 45.475C69.2685 42.3414 67.596 38.6664 66.8467 34.7558C66.0974 30.8452 66.293 26.8123 67.4172 22.9926C68.5415 19.1729 70.5618 15.677 73.31 12.7958C76.0583 9.91463 79.4549 7.73157 83.2173 6.42832C86.9797 5.12507 90.9989 4.73933 94.9405 5.30321C98.882 5.86708 102.632 7.36427 105.878 9.67014C109.124 11.976 111.772 15.0239 113.603 18.56C115.433 22.0962 116.392 26.0183 116.4 30Z"
				fill="#F4A93C"
			/>
			<path
				d="M90.225 41.5V38.05C88.3758 38.0346 86.5672 37.5067 85 36.525L85.825 34.25C87.3185 35.202 89.0539 35.7053 90.825 35.7C93.325 35.7 94.9 34.3 94.9 32.35C94.9 30.4 93.575 29.3 91.025 28.275C87.525 26.925 85.375 25.35 85.375 22.35C85.3959 20.9529 85.9384 19.6141 86.8959 18.5964C87.8534 17.5788 89.1567 16.9559 90.55 16.85V13.4H92.5V16.7C94.0604 16.7213 95.5904 17.134 96.95 17.9L96.1 20.175C94.7965 19.3868 93.2981 18.9798 91.775 19C89.275 19 88.15 20.575 88.15 21.95C88.15 23.725 89.425 24.625 92.4 25.85C95.925 27.3 97.7 29.075 97.7 32.125C97.6805 33.5569 97.1431 34.9334 96.1871 35.9997C95.2311 37.0659 93.9213 37.7499 92.5 37.925V41.5H90.225Z"
				fill="#F4A93C"
			/>
			<path
				d="M61.725 45.35C61.0187 46.2525 60.2321 47.0892 59.375 47.85H64.05C63.1946 47.0952 62.4158 46.2578 61.725 45.35Z"
				fill="#B77F2D"
			/>
			<path
				d="M91.4 4.99999H90.85C89.3792 5.04704 87.9152 5.22271 86.475 5.52499C92.1218 6.67765 97.197 9.7459 100.842 14.2105C104.486 18.6751 106.476 24.2617 106.475 30.025C106.488 33.3836 105.816 36.7096 104.501 39.8001C103.185 42.8905 101.254 45.6805 98.825 48H108.825C112.418 44.537 114.892 40.0779 115.93 35.1967C116.967 30.3155 116.52 25.2356 114.646 20.6107C112.771 15.9858 109.556 12.0276 105.413 9.24555C101.271 6.46349 96.3902 4.98487 91.4 4.99999Z"
				fill="#B77F2D"
			/>
			<path
				d="M138.075 154.55C136.968 154.904 135.812 155.082 134.65 155.075C135.804 155.079 136.951 154.902 138.05 154.55M134.675 47.925C138.011 48.0807 141.15 49.5519 143.403 52.0165C145.657 54.4811 146.843 57.7383 146.7 61.075C146.787 59.4209 146.545 57.7659 145.987 56.2063C145.43 54.6466 144.567 53.2134 143.451 51.9898C142.334 50.7663 140.986 49.7769 139.483 49.079C137.981 48.3812 136.355 47.989 134.7 47.925"
				fill="#BFBFBF"
			/>
			<path
				d="M134.65 47.925H124.65C126.305 47.989 127.931 48.3812 129.433 49.079C130.936 49.7769 132.284 50.7663 133.401 51.9898C134.517 53.2134 135.379 54.6466 135.937 56.2063C136.495 57.7659 136.737 59.4209 136.65 61.075V84.85H146.65V118.175H136.65V141.95C136.724 143.594 136.472 145.236 135.91 146.783C135.347 148.329 134.485 149.749 133.373 150.962C132.26 152.174 130.919 153.155 129.426 153.848C127.934 154.541 126.319 154.933 124.675 155H134.675C135.837 155.007 136.993 154.829 138.1 154.475C140.657 153.55 142.86 151.847 144.398 149.604C145.936 147.362 146.733 144.694 146.675 141.975V61.075C146.817 57.7383 145.632 54.4811 143.378 52.0165C141.125 49.5519 137.986 48.0807 134.65 47.925Z"
				fill="#916A43"
			/>
			<path d="M146.65 84.85H136.65V118.175H146.65V84.85Z" fill="#B77F2D" />
			<path
				d="M35.325 47.925H25.325C23.6698 47.989 22.0439 48.3812 20.5416 49.079C19.0394 49.7769 17.6908 50.7663 16.5743 51.9898C15.4577 53.2134 14.5955 54.6466 14.0377 56.2063C13.4799 57.7659 13.2376 59.4209 13.325 61.075V141.95C13.2513 143.596 13.5036 145.24 14.0676 146.788C14.6316 148.336 15.496 149.758 16.6112 150.97C17.7265 152.183 19.0704 153.164 20.5659 153.855C22.0613 154.547 23.6787 154.936 25.325 155H35.325C33.6742 154.933 32.0531 154.539 30.5555 153.841C29.0578 153.144 27.7133 152.156 26.5997 150.935C25.4862 149.715 24.6256 148.286 24.0678 146.731C23.51 145.175 23.266 143.525 23.35 141.875V61.075C23.2626 59.4229 23.5041 57.7699 24.0603 56.2119C24.6166 54.6538 25.4766 53.2216 26.5905 51.9984C27.7044 50.7752 29.05 49.7853 30.5494 49.0861C32.0487 48.3868 33.672 47.9922 35.325 47.925Z"
				fill="#D1AA6F"
			/>
			<path
				d="M52.025 5C47.0412 4.99987 42.1711 6.48932 38.04 9.27711C33.9089 12.0649 30.7053 16.0238 28.8404 20.6456C26.9756 25.2673 26.5347 30.3409 27.5744 35.2151C28.614 40.0892 31.0867 44.5414 34.675 48H44.675C41.3941 44.8454 39.0367 40.8549 37.8569 36.459C36.6772 32.063 36.7199 27.4284 37.9805 23.055C39.241 18.6815 41.6717 14.7352 45.0102 11.6416C48.3487 8.54793 52.4684 6.42441 56.925 5.5C55.4676 5.20321 53.9869 5.03589 52.5 5H51.975"
				fill="#F7BF4B"
			/>
			<path
				d="M134.65 157.5H25.325C23.3439 157.436 21.3952 156.979 19.5915 156.157C17.7878 155.335 16.1649 154.164 14.8166 152.711C13.4683 151.258 12.4213 149.553 11.7362 147.693C11.0511 145.833 10.7414 143.855 10.825 141.875V61.075C10.6895 57.0814 12.1373 53.196 14.8531 50.2649C17.5689 47.3337 21.3327 45.5941 25.325 45.425H134.65C138.647 45.5877 142.417 47.3245 145.138 50.2564C147.859 53.1882 149.31 57.0773 149.175 61.075V141.95C149.248 143.926 148.93 145.898 148.239 147.75C147.548 149.603 146.497 151.301 145.147 152.746C143.797 154.192 142.175 155.356 140.373 156.171C138.572 156.987 136.627 157.439 134.65 157.5ZM25.325 50.425C22.6586 50.5926 20.1657 51.8047 18.3873 53.7985C16.6088 55.7922 15.6881 58.4068 15.825 61.075V141.95C15.7086 144.603 16.6392 147.196 18.4162 149.169C20.1932 151.142 22.6743 152.339 25.325 152.5H134.65C137.316 152.339 139.812 151.133 141.595 149.144C143.378 147.155 144.305 144.543 144.175 141.875V61.075C144.312 58.4027 143.388 55.7846 141.604 53.7901C139.82 51.7957 137.321 50.5863 134.65 50.425H25.325Z"
				fill="black"
			/>
			<path
				d="M146.65 120.675H112.75C110.098 120.675 107.554 119.621 105.679 117.746C103.804 115.871 102.75 113.327 102.75 110.675V92.35C102.75 89.6978 103.804 87.1543 105.679 85.2789C107.554 83.4036 110.098 82.35 112.75 82.35H146.65C147.313 82.35 147.949 82.6134 148.418 83.0822C148.887 83.5511 149.15 84.187 149.15 84.85V118.175C149.15 118.838 148.887 119.474 148.418 119.943C147.949 120.412 147.313 120.675 146.65 120.675ZM112.75 87.35C111.424 87.35 110.152 87.8768 109.214 88.8145C108.277 89.7522 107.75 91.0239 107.75 92.35V110.65C107.75 111.976 108.277 113.248 109.214 114.186C110.152 115.123 111.424 115.65 112.75 115.65H144.15V87.35H112.75ZM69.375 50.425H34.65C34.0063 50.4224 33.3884 50.1717 32.925 49.725C30.2176 47.104 28.0778 43.9545 26.6383 40.4721C25.1988 36.9896 24.4904 33.2484 24.557 29.4808C24.6236 25.7131 25.4638 21.9993 27.0255 18.5699C28.5872 15.1405 30.837 12.0687 33.6354 9.54502C36.4337 7.02135 39.7209 5.09972 43.2929 3.89939C46.8648 2.69905 50.6454 2.24563 54.3999 2.56726C58.1544 2.88888 61.8027 3.9787 65.1185 5.76907C68.4342 7.55943 71.3466 10.0121 73.675 12.975C74.0238 13.4164 74.2135 13.9625 74.2135 14.525C74.2135 15.0875 74.0238 15.6336 73.675 16.075C70.5792 20.0327 68.8973 24.9128 68.8973 29.9375C68.8973 34.9622 70.5792 39.8423 73.675 43.8C74.125 44.375 74.575 45 75 45.425ZM35.7 45.425H68.375L68.55 45.25C65.519 40.7231 63.9008 35.3979 63.9008 29.95C63.9008 24.5021 65.519 19.1769 68.55 14.65C66.4448 12.3738 63.8877 10.5621 61.0421 9.33089C58.1966 8.0997 55.1254 7.47609 52.025 7.49999C47.6223 7.49696 43.3155 8.78565 39.6381 11.2064C35.9607 13.6271 33.0743 17.0736 31.3365 21.1188C29.5987 25.1639 29.0858 29.63 29.8614 33.9638C30.637 38.2976 32.6671 42.3087 35.7 45.5V45.425Z"
				fill="black"
			/>
			<path
				d="M53 44H50.85C50.1869 44 49.5511 43.7366 49.0822 43.2678C48.6134 42.7989 48.35 42.163 48.35 41.5V40.275C46.8503 39.9951 45.4221 39.417 44.15 38.575C43.7078 38.2588 43.3807 37.8071 43.2183 37.2883C43.0559 36.7695 43.067 36.2119 43.25 35.7L44.075 33.4C44.2012 33.0399 44.4083 32.7136 44.6801 32.4459C44.952 32.1782 45.2816 31.9763 45.6435 31.8557C46.0055 31.735 46.3903 31.6988 46.7684 31.7498C47.1465 31.8008 47.5079 31.9377 47.825 32.15C48.8797 32.8407 50.1143 33.2059 51.375 33.2C51.525 33.2 52.95 33.2 52.95 32.35C52.95 32.1 52.95 31.525 50.625 30.6C48.3 29.675 43.425 27.775 43.425 22.35C43.4001 20.7169 43.8853 19.1166 44.8129 17.7723C45.7405 16.4279 47.0643 15.4064 48.6 14.85V13.4C48.6 12.737 48.8634 12.1011 49.3322 11.6322C49.8011 11.1634 50.4369 10.9 51.1 10.9H53.225C53.888 10.9 54.5239 11.1634 54.9927 11.6322C55.4616 12.1011 55.725 12.737 55.725 13.4V14.5C56.8502 14.7477 57.9298 15.1694 58.925 15.75C59.4364 16.0487 59.8252 16.5192 60.022 17.0778C60.2189 17.6363 60.2111 18.2467 60 18.8L59.15 21.05C59.0222 21.3901 58.8217 21.6982 58.5627 21.953C58.3036 22.2077 57.9922 22.4029 57.65 22.525C57.3119 22.6467 56.9515 22.694 56.5934 22.6638C56.2353 22.6336 55.8879 22.5266 55.575 22.35C54.6501 21.7835 53.5845 21.489 52.5 21.5C52.225 21.5 51.375 21.5 51.375 21.95C51.375 22.4 51.875 22.625 54.075 23.55C57 24.75 60.925 26.925 60.925 32.125C60.9289 33.8121 60.4092 35.4589 59.4375 36.8381C58.4658 38.2173 57.09 39.2609 55.5 39.825V41.5C55.5 41.8283 55.4353 42.1534 55.3097 42.4567C55.184 42.76 54.9999 43.0356 54.7677 43.2678C54.5356 43.4999 54.26 43.6841 53.9567 43.8097C53.6534 43.9353 53.3283 44 53 44ZM108.75 50.425H74.025C73.3934 50.4228 72.786 50.1817 72.325 49.75C71.4141 48.853 70.578 47.8831 69.825 46.85C66.044 42.0137 63.99 36.0513 63.99 29.9125C63.99 23.7736 66.044 17.8113 69.825 12.975C72.1533 10.0121 75.0658 7.55943 78.3815 5.76907C81.6973 3.9787 85.3456 2.88888 89.1001 2.56726C92.8546 2.24563 96.6352 2.69905 100.207 3.89939C103.779 5.09972 107.066 7.02135 109.865 9.54502C112.663 12.0687 114.913 15.1405 116.474 18.5699C118.036 21.9993 118.876 25.7131 118.943 29.4808C119.01 33.2484 118.301 36.9896 116.862 40.4721C115.422 43.9545 113.282 47.104 110.575 49.725C110.333 49.9583 110.047 50.1405 109.734 50.2607C109.42 50.381 109.086 50.4369 108.75 50.425ZM75 45.425H107.725C109.813 43.2143 111.431 40.6033 112.481 37.7498C113.532 34.8963 113.993 31.8595 113.837 28.8227C113.682 25.786 112.912 22.8123 111.575 20.0814C110.237 17.3504 108.36 14.9189 106.057 12.9336C103.754 10.9483 101.072 9.45043 98.1739 8.53051C95.2757 7.61059 92.221 7.28768 89.1945 7.58129C86.1679 7.8749 83.2323 8.77893 80.5649 10.2388C77.8975 11.6986 75.5536 13.684 73.675 16.075C70.5792 20.0327 68.8973 24.9128 68.8973 29.9375C68.8973 34.9622 70.5792 39.8423 73.675 43.8C74.125 44.375 74.575 45 75 45.425Z"
				fill="black"
			/>
			<path
				d="M92.5 44H90.325C89.6619 44 89.0261 43.7366 88.5572 43.2678C88.0884 42.7989 87.825 42.163 87.825 41.5V40.275C86.3317 39.9999 84.9107 39.4213 83.65 38.575C83.2078 38.2588 82.8807 37.8071 82.7183 37.2883C82.5559 36.7695 82.567 36.2119 82.75 35.7L83.575 33.4C83.7018 33.0455 83.9071 32.7242 84.1755 32.4602C84.4439 32.1961 84.7685 31.9961 85.125 31.875C85.4846 31.7526 85.8674 31.7137 86.2442 31.7614C86.6211 31.809 86.9822 31.9419 87.3 32.15C88.3577 32.8341 89.5903 33.1986 90.85 33.2C91 33.2 92.425 33.2 92.425 32.35C92.425 32.1 92.425 31.525 90.125 30.6C87.825 29.675 82.9 27.775 82.9 22.35C82.8825 20.7185 83.3706 19.1216 84.2972 17.7787C85.2238 16.4358 86.5435 15.4127 88.075 14.85V13.4C88.075 12.737 88.3384 12.1011 88.8072 11.6322C89.2761 11.1634 89.9119 10.9 90.575 10.9H92.5C93.163 10.9 93.7989 11.1634 94.2677 11.6322C94.7366 12.1011 95 12.737 95 13.4V14.5C96.1265 14.7433 97.2068 15.1653 98.2 15.75C98.7114 16.0487 99.1002 16.5192 99.297 17.0778C99.4939 17.6363 99.4861 18.2467 99.275 18.8L98.425 21.05C98.2971 21.3901 98.0967 21.6982 97.8377 21.953C97.5786 22.2077 97.2672 22.4029 96.925 22.525C96.6086 22.6251 96.2754 22.6611 95.9449 22.6311C95.6144 22.601 95.2932 22.5055 95 22.35C94.0768 21.7797 93.01 21.4849 91.925 21.5C91.675 21.5 90.8 21.5 90.8 21.95C90.8 22.4 91.3 22.625 93.5 23.55C96.425 24.75 100.35 26.925 100.35 32.125C100.359 33.8031 99.8507 35.4432 98.8931 36.8214C97.9356 38.1995 96.576 39.2485 95 39.825V41.5C95 42.163 94.7366 42.7989 94.2677 43.2678C93.7989 43.7366 93.163 44 92.5 44ZM116.425 145.15H88.025C87.3619 145.15 86.7261 144.887 86.2572 144.418C85.7884 143.949 85.525 143.313 85.525 142.65C85.525 141.987 85.7884 141.351 86.2572 140.882C86.7261 140.413 87.3619 140.15 88.025 140.15H116.425C117.088 140.15 117.724 140.413 118.193 140.882C118.662 141.351 118.925 141.987 118.925 142.65C118.925 143.313 118.662 143.949 118.193 144.418C117.724 144.887 117.088 145.15 116.425 145.15ZM132.5 145.15H125.375C124.712 145.15 124.076 144.887 123.607 144.418C123.138 143.949 122.875 143.313 122.875 142.65C122.875 141.987 123.138 141.351 123.607 140.882C124.076 140.413 124.712 140.15 125.375 140.15H132.5C133.163 140.15 133.799 140.413 134.268 140.882C134.737 141.351 135 141.987 135 142.65C135 143.313 134.737 143.949 134.268 144.418C133.799 144.887 133.163 145.15 132.5 145.15ZM32.35 106.75C31.6869 106.75 31.0511 106.487 30.5822 106.018C30.1134 105.549 29.85 104.913 29.85 104.25V49C29.85 48.337 30.1134 47.7011 30.5822 47.2322C31.0511 46.7634 31.6869 46.5 32.35 46.5C33.013 46.5 33.6489 46.7634 34.1177 47.2322C34.5866 47.7011 34.85 48.337 34.85 49V104.25C34.85 104.913 34.5866 105.549 34.1177 106.018C33.6489 106.487 33.013 106.75 32.35 106.75ZM32.35 128.4C31.6869 128.4 31.0511 128.137 30.5822 127.668C30.1134 127.199 29.85 126.563 29.85 125.9V113.225C29.85 112.562 30.1134 111.926 30.5822 111.457C31.0511 110.988 31.6869 110.725 32.35 110.725C33.013 110.725 33.6489 110.988 34.1177 111.457C34.5866 111.926 34.85 112.562 34.85 113.225V125.9C34.85 126.563 34.5866 127.199 34.1177 127.668C33.6489 128.137 33.013 128.4 32.35 128.4Z"
				fill="black"
			/>
		</svg>
	</div>
	<div class="flex inset-x-0 gap-12 justify-center pt-10">
		<a
			href="/register"
			class="flex justify-center items-center px-4 py-2.5 w-24 rounded-md border shadow-lg border-primary"
			><span class="shadow-lg">Sign Up</span></a
		>
		<a
			href="/login"
			class="flex justify-center items-center px-4 py-2.5 w-24 rounded-md border border-primary bg-primary"
			>Login</a
		>
	</div>
{/if}
