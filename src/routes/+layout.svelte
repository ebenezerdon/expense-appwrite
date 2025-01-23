<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { user, initAuth, logout } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let isMobileMenuOpen = false;
  let isDropdownOpen = false;

  onMount(async () => {
    try {
      const currentUser = await initAuth();
      if (!currentUser && !$page.url.pathname.startsWith('/auth')) {
        goto('/auth');
      }
    } catch (error) {
      if (!$page.url.pathname.startsWith('/auth')) {
        goto('/auth');
      }
    }
  });

  const toggleMobileMenu = () => {
    isMobileMenuOpen = !isMobileMenuOpen;
  };

  const toggleDropdown = () => {
    isDropdownOpen = !isDropdownOpen;
  };

  const handleLogout = async () => {
    try {
      await logout();
      goto('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
</script>

<div class="flex min-h-screen flex-col">
  <nav class="border-b border-neutral-200 bg-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center">
          <a href="/" class="flex items-center space-x-2">
            <span class="text-2xl font-bold text-primary-600">💰</span>
            <span class="text-lg font-semibold text-neutral-900">ExpenseTracker</span>
          </a>
        </div>

        <!-- Desktop Navigation -->
        {#if $user}
          <div class="hidden md:block">
            <div class="ml-10 flex items-center space-x-4">
              <a
                href="/"
                class="px-3 py-2 text-sm font-medium {$page.url.pathname === '/'
                  ? 'text-primary-600'
                  : 'text-neutral-600 hover:text-primary-600'}"
              >
                Dashboard
              </a>
              <div class="relative">
                <button
                  on:click={toggleDropdown}
                  class="flex items-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:text-primary-600"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${$user?.name || 'User'}`}
                    alt="avatar"
                    class="h-8 w-8 rounded-full"
                  />
                  <span>{$user?.name || 'User'}</span>
                </button>
                {#if isDropdownOpen}
                  <div class="absolute right-0 -translate-x-3 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                    <button
                      on:click={handleLogout}
                      class="block w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      Sign out
                    </button>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}

        <!-- Mobile menu button -->
        {#if $user}
          <div class="flex md:hidden">
            <button
              on:click={toggleMobileMenu}
              class="inline-flex items-center justify-center rounded-md p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Mobile menu -->
    {#if isMobileMenuOpen && $user}
      <div class="md:hidden">
        <div class="space-y-1 px-2 pb-3 pt-2">
          <a
            href="/"
            class="block rounded-md px-3 py-2 text-base font-medium {$page.url.pathname === '/'
              ? 'bg-primary-50 text-primary-600'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-primary-600'}"
          >
            Dashboard
          </a>
          <button
            on:click={handleLogout}
            class="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-neutral-600 hover:bg-neutral-100 hover:text-primary-600"
          >
            Sign out
          </button>
        </div>
      </div>
    {/if}
  </nav>

  <main class="flex-1">
    {#if !$page.url.pathname.startsWith('/auth')}
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <slot />
      </div>
    {:else}
      <slot />
    {/if}
  </main>

  <footer class="border-t border-neutral-200 bg-white">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <p class="text-center text-sm text-neutral-600">
        &copy; {new Date().getFullYear()} ExpenseTracker. All rights reserved.
      </p>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    @apply bg-neutral-50;
  }
</style>
