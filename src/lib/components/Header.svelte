<script>
	export let session;
</script>

<div class="mb-6 h-14 bg-[#1B2129]">
	<div class="mx-auto max-w-xl">
		<div class="flex justify-between items-center p-3">
			<div class="flex gap-2 items-center">
				<a href="/">
					<img src="/logo.png" alt="logo" class="size-10" />
				</a>
				<p class="text-sm">
					Welcome back,
					<span class="font-bold text-primary">{session.user.user_metadata.first_name}</span>!
				</p>
			</div>
			<form action="/logout" method="post">
				<button class="flex gap-1 items-center text-sm hover:text-expense" type="submit">
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
	</div>
</div>
