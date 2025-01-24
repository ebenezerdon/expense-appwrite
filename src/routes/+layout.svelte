<script lang="ts">
	import '../app.css'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { user, initAuth, logout } from '$lib/stores/auth'
	import { goto } from '$app/navigation'

	let isDropdownOpen = false

	onMount(async () => {
		try {
			const currentUser = await initAuth()
			if (!currentUser && !$page.url.pathname.startsWith('/auth')) {
				goto('/auth')
			}
		} catch (error) {
			if (!$page.url.pathname.startsWith('/auth')) {
				goto('/auth')
			}
		}
	})

	const toggleDropdown = () => {
		isDropdownOpen = !isDropdownOpen
	}

	const handleLogout = async () => {
		try {
			await logout()
			goto('/auth')
		} catch (error) {
			console.error('Logout failed:', error)
		}
	}
</script>

<div class="layout-container">
	<nav class="main-nav">
		<div class="nav-container">
			<div class="nav-content">
				<div class="flex items-center">
					<a href="/" class="brand-link">
						<span class="brand-emoji">💰</span>
						<span class="brand-text">ExpenseTracker</span>
					</a>
				</div>

				{#if $user}
					<div class="user-nav">
						<div class="user-dropdown">
							<button on:click={toggleDropdown} class="user-button">
								<img
									src={`https://api.dicebear.com/7.x/initials/svg?seed=${$user?.name || 'User'}`}
									alt="avatar"
									class="user-avatar"
								/>
								<span>{$user?.name || 'User'}</span>
							</button>
							{#if isDropdownOpen}
								<div class="dropdown-menu">
									<button on:click={handleLogout} class="dropdown-item"> Sign out </button>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</nav>

	<main class="main-content">
		{#if !$page.url.pathname.startsWith('/auth')}
			<div class="content-container">
				<slot />
			</div>
		{:else}
			<slot />
		{/if}
	</main>

	<footer class="main-footer">
		<div class="footer-container">
			<p class="footer-text">
				&copy; {new Date().getFullYear()} ExpenseTracker. All rights reserved.
			</p>
		</div>
	</footer>
</div>
