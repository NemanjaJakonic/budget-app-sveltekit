<script>
	import Input from '$lib/components/Input.svelte';
	import Error from '$lib/components/Error.svelte';
	import { cn } from '$lib/utils';
	import AnimatedShinyText from '$lib/components/AnimatedShinyText.svelte';

	import { zod } from 'sveltekit-superforms/adapters';
	import { loginSchema } from '$lib/schemas.js';
	import SuperDebug, { superForm } from 'sveltekit-superforms';

	let { data } = $props();
	const { form, constraints, errors, enhance, delayed, message } = superForm(data.form, {
		validators: zod(loginSchema)
	});

	function tryIt() {
		$form.email = 'test@test.com';
		$form.password = 'test123';
	}
</script>

<div class="pt-10 md:pt-20">
	<div class="p-4 mx-auto max-w-md rounded md:p-8 bg-card/40">
		<!-- <h1 class="mb-4 text-2xl font-semibold text-center">Welcome</h1> -->
		<img src="/logo.svg" alt="logo" class="mx-auto w-auto h-20" />

		<form id="login" method="post" use:enhance>
			<div class="flex z-10 justify-center items-center my-4">
				<button
					disabled={$delayed}
					onclick={tryIt}
					class={cn(
						'group rounded border p-1 text-base text-white transition-all ease-in hover:cursor-pointer  border-white/5 bg-background hover:bg-neutral-800'
					)}
				>
					<AnimatedShinyText
						class="inline-flex justify-center items-center px-4 py-1 transition ease-out hover:duration-300 hover:text-neutral-400"
					>
						<span>Try it now</span>

						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="ml-1 transition-transform duration-300 ease-in-out size-3 group-hover:translate-x-0.5"
							><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg
						>
					</AnimatedShinyText>
				</button>
			</div>

			<div class="mb-2 h-10">
				{#if $message}
					<Error message={$message} />
				{/if}
			</div>

			<div class="flex flex-col">
				<Input
					name="email"
					label="Email"
					type="text"
					placeholder="example@example.com"
					disabled={$delayed}
					bind:value={$form.email}
				/>
				<small class="block h-6 text-xs text-red-400">
					{#if $errors.email}
						{$errors.email}
					{/if}
				</small>

				<Input
					name="password"
					label="Password"
					type="password"
					placeholder="••••••••"
					disabled={$delayed}
					bind:value={$form.password}
				/>
				<small class="block h-6 text-xs text-red-400">
					{#if $errors.password}
						{$errors.password}
					{/if}
				</small>

				<button
					class="relative py-2 mt-4 w-full text-white rounded shadow-lg transition-all duration-300 md:py-3 bg-primary hover:brightness-75 disabled:opacity-70 shadow-primary/20"
					disabled={$delayed}
				>
					{#if $delayed}
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
					class="my-4 text-sm text-center text-gray-400 transition-colors hover:text-primary"
				>
					Forgot Password?
				</a>

				<a
					href="/register"
					class="py-2 w-full text-center text-gray-300 rounded border border-gray-700 transition-colors md:py-3 bg-gray-900/50 hover:border-primary"
				>
					Sign Up
				</a>
			</div>
		</form>
	</div>
</div>
