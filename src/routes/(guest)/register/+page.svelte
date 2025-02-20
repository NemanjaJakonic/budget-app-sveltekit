<script>
	import { enhance } from '$app/forms';
	import Input from '$lib/components/Input.svelte';
	import Error from '$lib/components/Error.svelte';

	let loading = false;
	let errorMessage = '';
	let showPassword = false;

	function handleSubmit() {
		loading = true;

		return async ({ result, update }) => {
			if (result.type === 'failure') {
				errorMessage = result.data?.message || 'Registration failed. Please try again.';
				loading = false;
			}

			if (result.type === 'redirect') {
				await update();
			}
		};
	}
</script>

<div class="pt-10 md:pt-20">
	<div class="p-4 mx-auto max-w-md rounded md:p-8 bg-card/40">
		<form action="?/register" method="post" use:enhance={handleSubmit}>
			<h1 class="mb-12 text-2xl font-semibold text-center">Create Account</h1>

			<div class="mb-2 h-10">
				<Error message={errorMessage} />
			</div>

			<div class="flex flex-col gap-6">
				<Input
					name="first_name"
					type="text"
					placeholder="First Name"
					label="First Name"
					disabled={loading}
				/>

				<Input
					name="last_name"
					type="text"
					placeholder="Last Name"
					label="Last Name"
					disabled={loading}
				/>

				<Input
					name="email"
					type="email"
					placeholder="example@example.com"
					label="Email"
					disabled={loading}
				/>

				<div class="space-y-2">
					<label for="password" class="text-sm text-gray-300">Password</label>
					<div class="relative">
						<input
							id="password"
							class="p-2 w-full text-gray-100 rounded border border-gray-700 transition-colors outline-none md:p-3 bg-gray-900/50 focus:border-primary"
							type={showPassword ? 'text' : 'password'}
							name="password"
							placeholder="••••••••"
							disabled={loading}
						/>
						<button
							type="button"
							class="flex absolute right-3 top-1/2 justify-center items-center w-6 h-6 text-gray-400 -translate-y-1/2 hover:text-primary"
							on:click={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-5 h-5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
									/>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-5 h-5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							{/if}
						</button>
					</div>
				</div>

				<button
					class="relative py-2 mt-4 w-full text-white rounded shadow-lg transition-all duration-300 md:py-3 bg-primary hover:brightness-75 disabled:opacity-70 shadow-primary/20"
					disabled={loading}
				>
					{#if loading}
						<div class="flex absolute inset-0 justify-center items-center">
							<svg
								class="w-5 h-5 text-white animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
						</div>
						<span class="opacity-0">Register</span>
					{:else}
						Register
					{/if}
				</button>

				<div class="text-center">
					<a href="/login" class="text-sm text-gray-400 transition-colors hover:text-primary">
						Already have an account? Log in
					</a>
				</div>
			</div>
		</form>
	</div>
</div>
