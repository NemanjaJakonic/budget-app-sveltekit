<script>
	// let data = $props();
	// import { enhance } from '$app/forms';
	import { onDestroy, onMount } from 'svelte';
	import Error from '$lib/components/Error.svelte';
	import Input from '$lib/components/Input.svelte';

	import CalendarIcon from 'lucide-svelte/icons/calendar';
	import { DateFormatter, getLocalTimeZone, today, CalendarDate } from '@internationalized/date';
	import { cn } from '$lib/utils.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	import { zod } from 'sveltekit-superforms/adapters';
	import { transactionSchema } from '$lib/schemas.js';
	import SuperDebug, { superForm } from 'sveltekit-superforms';

	const { data } = $props();
	const { transaction } = data;

	const { form, constraints, errors, enhance, delayed } = superForm(data.form, {
		validators: zod(transactionSchema)
	});

	const df = new DateFormatter('en-GB', {
		dateStyle: 'long'
	});

	let dateObj = new Date(transaction[0].date);

	let errorTimeout;

	$form.name = transaction[0].name;
	$form.type = transaction[0].type;
	$form.amount = transaction[0].amount;
	$form.currency = transaction[0].currency;

	let initialDate = new CalendarDate(
		dateObj.getFullYear(),
		dateObj.getMonth() + 1,
		dateObj.getDate()
	);

	function setTemporaryError(message) {
		errorMessage = message;
		if (errorTimeout) clearTimeout(errorTimeout);
		errorTimeout = setTimeout(() => {
			errorMessage = '';
		}, 3000);
	}

	onDestroy(() => {
		if (errorTimeout) clearTimeout(errorTimeout);
	});

	onMount(() => {
		$form.date = initialDate.toString();
		// console.log(document.referrer);
	});
</script>

<!-- <SuperDebug data={$form} /> -->

<div class="mx-auto max-w-xl md:pt-10">
	<h1 class="pb-4 text-base font-bold text-center text-white md:text-lg">Edit Transaction</h1>
	<form action="?/editTransaction" method="post" use:enhance class="p-4 rounded md:p-8 bg-card/40">
		<div class="flex flex-col gap-4">
			<div class="flex gap-4 items-end">
				<div class="w-2/3">
					<Input name="name" type="text" bind:value={$form.name} placeholder="Name" label="Name" />
					<small class="block h-6 text-red-400">
						{#if $errors.name}
							{$errors.name}
						{/if}
					</small>
				</div>
				<div class="w-1/3">
					<div class="space-y-2">
						<label for="type" class="text-sm text-gray-300">Type</label>

						<Select.Root type="single" name="type" id="type" bind:value={$form.type}>
							<Select.Trigger
								class="p-2 w-full text-gray-100 capitalize rounded border border-gray-700 transition-colors appearance-none outline-none focus:ring-offset-0 md:p-3 bg-footerheader focus:border-primary"
								>{$form.type}</Select.Trigger
							>
							<Select.Content>
								<Select.Item value="expense">Expense</Select.Item>
								<Select.Item value="income">Income</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<small class="block h-6 text-red-400">
						{#if $errors.type}
							{$errors.type}
						{/if}
					</small>
				</div>
			</div>
			<div class="flex gap-4 items-end">
				<div class="w-2/3">
					<Input
						name="amount"
						type="number"
						bind:value={$form.amount}
						placeholder="Amount"
						label="Amount"
						step="0.01"
					/>
					<small class="block h-6 text-red-400">
						{#if $errors.amount}
							{$errors.amount}
						{/if}
					</small>
				</div>
				<div class="w-1/3">
					<div class="relative space-y-2 w-full">
						<label for="currency" class="text-sm text-gray-300">Currency</label>

						<Select.Root type="single" name="currency" id="currency" bind:value={$form.currency}>
							<Select.Trigger
								class="p-2 w-full text-gray-100 rounded border border-gray-700 transition-colors appearance-none outline-none focus:ring-offset-0 md:p-3 bg-footerheader focus:border-primary"
								>{$form.currency}</Select.Trigger
							>
							<Select.Content>
								<Select.Item value="RSD">RSD</Select.Item>
								<Select.Item value="EUR">EUR</Select.Item>
								<Select.Item value="USD">USD</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<small class="block h-6 text-red-400">
						{#if $errors.currency}
							{$errors.currency}
						{/if}
					</small>
				</div>
			</div>

			<div class="space-y-2">
				<label for="date" class="text-sm text-gray-300">Date</label>
				<Popover.Root>
					<Popover.Trigger>
						{#snippet child({ props })}
							<Button
								variant="outline"
								class={cn(
									'p-2 w-full text-gray-100 rounded border border-gray-700 transition-colors outline-none md:p-3 bg-footerheader focus:border-primary',
									!initialDate && 'text-muted-foreground'
								)}
								{...props}
							>
								<CalendarIcon class="mr-2 size-4" />
								{initialDate}
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="p-0 w-auto">
						<Calendar
							value={initialDate}
							type="single"
							initialFocus
							onValueChange={(v) => {
								if (v) {
									$form.date = v.toString();
								} else {
									v = '';
								}
							}}
						/>
					</Popover.Content>
				</Popover.Root>
				<small class="block h-6 text-red-400">
					{#if $errors.date}
						{$errors.date}
					{/if}
					<input type="hidden" bind:value={$form.date} name="date" />
				</small>
			</div>

			<button
				class="relative py-2 mt-4 w-full text-white rounded shadow-lg transition-all duration-300 md:py-3 bg-primary hover:bg-primary/60 disabled:opacity-70 shadow-primary/20"
				disabled={$delayed}
			>
				{#if $delayed}
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
				<span class={$delayed ? 'opacity-0' : ''}>SUBMIT</span>
			</button>
		</div>
	</form>
</div>
