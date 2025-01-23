<script>
	import { account } from '$lib/appwrite'
	import { goto } from '$app/navigation'
	import { ID } from 'appwrite'
	import { user } from '$lib/stores/auth'

	let email = ''
	let password = ''
	let name = ''
	let isLogin = true
	let loading = false
	let error = null

	async function handleSubmit() {
		try {
			loading = true
			error = null

			if (isLogin) {
				await account.createEmailPasswordSession(email, password)
			} else {
				await account.create(ID.unique(), email, password, name)
				await account.createEmailPasswordSession(email, password)
			}

			// Update user store after successful login
			const currentUser = await account.get()
			user.set(currentUser)
			goto('/')
		} catch (e) {
			console.error('Auth error:', e)
			error = isLogin ? 'Invalid credentials' : 'Failed to create account'
		} finally {
			loading = false
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
	<div class="w-full max-w-md -mt-32 space-y-6">
		<div class="text-center">
			<div class="mb-3 text-4xl">💰</div>
			<h2 class="text-3xl font-bold tracking-tight text-neutral-900">
				{isLogin ? 'Welcome back!' : 'Create your account'}
			</h2>
			<p class="mt-2 text-sm text-neutral-600">
				{isLogin
					? "Track your expenses with ease. Let's get you signed in."
					: 'Start your journey to better expense management'}
			</p>
		</div>

		{#if error}
			<div class="rounded-lg bg-red-50 p-4 text-sm text-red-700">
				{error}
			</div>
		{/if}

		<form on:submit|preventDefault={handleSubmit} class="mt-6 space-y-4">
			{#if !isLogin}
				<div>
					<label for="name" class="block text-sm font-medium text-neutral-700"> Full Name </label>
					<input
						type="text"
						id="name"
						bind:value={name}
						required
						class="input mt-1 block w-full"
						placeholder="John Doe"
					/>
				</div>
			{/if}

			<div>
				<label for="email" class="block text-sm font-medium text-neutral-700">
					Email address
				</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					required
					class="input mt-1 block w-full"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-neutral-700"> Password </label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					minlength="8"
					class="input mt-1 block w-full"
					placeholder="••••••••"
				/>
			</div>

			<div>
				<button
					type="submit"
					class="btn btn-primary w-full {loading ? 'opacity-75 cursor-not-allowed' : ''}"
					disabled={loading}
				>
					{#if loading}
						<div
							class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
					{/if}
					{isLogin ? 'Sign in' : 'Create account'}
				</button>
			</div>
		</form>

		<div class="text-center">
			<button
				on:click={() => (isLogin = !isLogin)}
				class="text-sm text-primary-600 hover:text-primary-500"
			>
				{isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
			</button>
		</div>
	</div>
</div>
