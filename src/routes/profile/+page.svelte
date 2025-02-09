<script>
	import { enhance } from '$app/forms';
	import Input from '../../lib/components/Input.svelte';
	import Error from '../../lib/components/Error.svelte';

	export let data;
	const { profile } = data;

	let starting_balance = profile.starting_balance;

	let loading = false;
	let errorMessage = '';

	function handleSubmit() {
		loading = true;

		return async ({ result, update }) => {
			if (result.type === 'failure') {
				errorMessage = result.data?.message || 'Update failed. Please try again.';
			}

			await update();
			loading = false;
		};
	}
</script>

<div class="mx-auto max-w-lg md:pt-10">
	<!-- <div class="flex justify-between items-center pb-4 mx-auto max-w-lg">
		<button on:click={() => history.back()}>
			<span class="text-white hover:text-primary">
				<svg
					class="fill-current size-6"
					version="1.0"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512.000000 512.000000"
					preserveAspectRatio="xMidYMid meet"
				>
					<g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" stroke="none">
						<path
							d="M1160 4458 c-50 -18 -90 -55 -421 -387 -418 -417 -414 -412 -414
-551 0 -138 -3 -134 409 -547 316 -317 368 -365 421 -389 255 -117 540 164
423 417 -15 32 -54 87 -93 128 l-68 72 969 -4 c966 -3 969 -3 1053 -25 412
-110 692 -452 718 -878 28 -459 -271 -870 -718 -985 -78 -21 -116 -23 -529
-28 -441 -6 -445 -6 -498 -30 -71 -32 -147 -115 -167 -183 -19 -66 -19 -150 0
-216 20 -68 96 -151 167 -183 52 -24 57 -24 443 -27 423 -4 553 4 713 43 748
181 1265 866 1229 1627 -32 661 -465 1234 -1093 1444 -58 20 -149 45 -202 57
-94 20 -125 21 -1090 24 l-994 4 66 69 c89 94 108 135 114 236 4 73 1 88 -23
143 -34 76 -113 152 -181 175 -66 22 -166 20 -234 -6z"
						/>
					</g>
				</svg>
			</span>
		</button>

		<h1 class="text-base font-bold text-white md:text-lg">Profile</h1>
		<span />
	</div> -->
	<h1 class="pb-4 text-base font-bold text-center text-white md:text-lg">Profile</h1>
	<form
		action="?/editProfile"
		method="post"
		use:enhance={handleSubmit}
		class="p-4 rounded-lg md:p-8 bg-gray-800/50"
	>
		<div class="mb-2 h-10">
			<Error message={errorMessage} />
		</div>

		<div class="flex flex-col gap-4 md:gap-6">
			<Input
				name="starting_balance"
				type="text"
				placeholder="Starting Balance"
				label="Starting Balance"
				value={starting_balance}
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
