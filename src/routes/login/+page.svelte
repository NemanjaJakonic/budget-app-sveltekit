<script>
	import { enhance } from '$app/forms';

	let loading = false;
	let errorMessage = '';

	function handleSubmit() {
		loading = true;

		return async ({ result, update }) => {
			if (result.type === 'failure') {
				errorMessage = result.data?.message || 'Login failed. Please try again.';
			}

			await update();
			loading = false;
		};
	}
</script>

<div class="min-h-screen">
	<form
		action="?/login"
		method="post"
		use:enhance={handleSubmit}
		class="p-8 mx-auto mt-20 max-w-md rounded-3xl bg-gray-800/50"
	>
		<h1 class="mb-12 text-2xl font-semibold text-primary">Welcome</h1>

		{#if errorMessage}
			<div class="p-4 mb-6 text-sm text-center text-red-400 rounded-xl bg-red-900/20">
				{errorMessage}
			</div>
		{/if}

		<div class="flex flex-col gap-6">
			<div class="space-y-2">
				<label for="email" class="text-sm text-gray-300">Username Or Email</label>
				<input
					id="email"
					class="p-3 w-full text-gray-100 rounded-xl border border-gray-700 transition-colors outline-none bg-gray-900/50 focus:border-primary"
					type="text"
					name="email"
					placeholder="example@example.com"
					disabled={loading}
				/>
			</div>

			<div class="space-y-2">
				<label for="password" class="text-sm text-gray-300">Password</label>
				<input
					id="password"
					class="p-3 w-full text-gray-100 rounded-xl border border-gray-700 transition-colors outline-none bg-gray-900/50 focus:border-primary"
					type="password"
					name="password"
					placeholder="••••••••"
					disabled={loading}
				/>
			</div>

			<button
				class="relative py-3 mt-4 w-full text-white rounded-xl shadow-lg transition-all duration-300 bg-primary hover:brightness-75 disabled:opacity-70 shadow-primary/20"
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
					<span class="opacity-0">Log In</span>
				{:else}
					Log In
				{/if}
			</button>

			<a
				href="/forgot-password"
				class="text-sm text-center text-gray-400 transition-colors hover:text-primary"
			>
				Forgot Password?
			</a>

			<a
				href="/register"
				class="py-3 w-full text-center text-gray-300 rounded-xl border border-gray-700 transition-colors bg-gray-900/50 hover:border-primary"
			>
				Sign Up
			</a>
		</div>
	</form>
</div>
