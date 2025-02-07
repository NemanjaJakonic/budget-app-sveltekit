<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	export let id;

	let openDropdown = {};

	const handleDropdownClick = (transactionId) => {
		// Close all other dropdowns first
		const newOpenDropdown = {};
		// Toggle the clicked dropdown
		newOpenDropdown[transactionId] = !openDropdown[transactionId];
		// Update the state
		openDropdown = newOpenDropdown;
	};

	function handleClickOutside(event, transactionId) {
		const dropdown = document.querySelector(`[data-dropdown="${transactionId}"]`);
		const button = document.querySelector(`[data-button="${transactionId}"]`);

		if (dropdown && !dropdown.contains(event.target) && !button.contains(event.target)) {
			openDropdown = {}; // Reset all dropdowns
		}
	}

	onMount(() => {
		document.addEventListener('click', (event) => {
			Object.keys(openDropdown).forEach((id) => {
				if (openDropdown[id]) {
					handleClickOutside(event, id);
				}
			});
		});
	});
</script>

<div class="relative">
	<button data-button={id} on:click={() => handleDropdownClick(id)}>
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
		data-dropdown={id}
		class="absolute right-0 z-10 mt-2 w-40 rounded-md ring-1 ring-black ring-opacity-5 shadow-lg bg-footerheader focus:outline-none"
		style:visibility={openDropdown[id] ? 'visible' : 'hidden'}
	>
		<div class="py-1">
			<a
				href={`/edit-transaction/${id}`}
				class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/40"
				role="menuitem">Edit</a
			>
			<form action="?/deleteTransaction" method="post" use:enhance>
				<input type="hidden" name="id" value={id} />
				<button
					type="submit"
					class="block px-4 py-2 w-full text-sm text-left text-red-500 hover:bg-gray-800/40"
					>Delete</button
				>
			</form>
		</div>
	</div>

	<div
		data-dropdown={id}
		class="absolute right-0 z-10 mt-2 w-40 rounded-md ring-1 ring-black ring-opacity-5 shadow-lg bg-footerheader focus:outline-none"
		style:visibility={openDropdown[id] ? 'visible' : 'hidden'}
	/>
</div>
