<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { user, initAuth, logout } from '$lib/stores/auth'
	import { browser } from '$app/environment'
	import '../app.css'

	let initialized = false

	onMount(async () => {
		await initAuth()
		initialized = true
	})

	const handleLogout = async () => {
		await logout()
		goto('/auth')
	}

	$: if (browser && initialized && !$user && !$page.url.pathname.includes('/auth')) {
		goto('/auth')
	}
</script>

<div class="min-h-screen bg-gray-100">
	{#if $user && !$page.url.pathname.includes('/auth')}
		<nav class="bg-white shadow">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between h-16">
					<div class="flex">
						<div class="flex-shrink-0 flex items-center">
							<a href="/" class="text-xl font-bold text-indigo-600">ExpenseTracker</a>
						</div>
					</div>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<span class="text-gray-700 mr-4">{$user.name}</span>
							<button
								on:click={handleLogout}
								class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</div>
		</nav>
	{/if}

	<slot />
</div>
