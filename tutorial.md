# Building an Expense Tracker with SvelteKit and Appwrite

This tutorial will guide you through building a full-stack expense tracking application using SvelteKit and Appwrite. The app features user authentication, expense management, and real-time statistics.

## Prerequisites

- Node.js (v18 or later)
- pnpm
- Appwrite instance (self-hosted or cloud)
- Basic knowledge of TypeScript and Svelte

## Step 1: Project Setup

1. Create a new SvelteKit project:

```bash
npx sv create expense-app
```

Choose the following options:

- Skeleton project
- TypeScript
- Yes for Tailwind CSS
- Yes for ESLint
- Yes for Prettier
- No for Playwright
- No for Vitest

2. Navigate to the project and install dependencies:

```bash
cd expense-app
pnpm install
pnpm add appwrite date-fns
```

## Step 2: Environment Setup

1. Create `.env` and `.env.example` files in your project root:

```env
PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
PUBLIC_APPWRITE_PROJECT_ID=your-project-id
PUBLIC_APPWRITE_DATABASE_ID=expense-tracker
PUBLIC_APPWRITE_COLLECTION_ID=expenses
```

## Step 3: Appwrite Configuration

1. Create a new project in Appwrite Console
2. Create a database named "expense-tracker"
3. Create a collection named "expenses" with these attributes:

   - `userId` (String, required)
   - `amount` (Float, required)
   - `category` (String enum, required)
     - Values: "food", "transport", "shopping", "entertainment", "health", "utilities", "other"
   - `description` (String, required)
   - `date` (DateTime, required)
   - `createdAt` (DateTime, required)
   - `updatedAt` (DateTime, required)

4. Configure collection permissions:
   - Enable Document Security
   - Set collection-level permissions:
     - CREATE: ["role:all"] (allows authenticated users to create documents)
   - Document-level permissions will be set per user when creating documents

## Step 4: Project Structure

Create the following directory structure:

```
src/
├── lib/
│   ├── stores/
│   │   └── auth.ts
│   └── appwrite.ts
├── routes/
│   ├── auth/
│   │   └── +page.svelte
│   ├── +layout.svelte
│   └── +page.svelte
├── app.html
└── app.css
```

## Step 5: Base HTML Template

Create `src/app.html`:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

## Step 6: Authentication Layout

Create `src/routes/+layout.svelte`:

```svelte
<script>
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { account } from '$lib/appwrite'
	import { user } from '$lib/stores/auth'
	import '../app.css'

	let loading = true

	onMount(async () => {
		try {
			const currentUser = await account.get()
			user.set(currentUser)

			// Redirect to home if on auth page and logged in
			if ($page.url.pathname === '/auth' && currentUser) {
				goto('/')
			}
		} catch (e) {
			// Redirect to auth page if not logged in and not already there
			if ($page.url.pathname !== '/auth') {
				goto('/auth')
			}
		} finally {
			loading = false
		}
	})
</script>

{#if loading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="loading-spinner"></div>
	</div>
{:else}
	<slot />
{/if}
```

## Step 7: Appwrite Client Setup

Create `src/lib/appwrite.ts`:

```typescript
import { Client, Databases, Account } from 'appwrite'

const client = new Client()
	.setEndpoint(import.meta.env.PUBLIC_APPWRITE_ENDPOINT)
	.setProject(import.meta.env.PUBLIC_APPWRITE_PROJECT_ID)

export const databases = new Databases(client)
export const account = new Account(client)

export const DATABASE_ID = import.meta.env.PUBLIC_APPWRITE_DATABASE_ID
export const EXPENSES_COLLECTION_ID = import.meta.env.PUBLIC_APPWRITE_COLLECTION_ID
```

## Step 8: Authentication Store

Create `src/lib/stores/auth.ts`:

```typescript
import { writable } from 'svelte/store'

export const user = writable(null)
```

## Step 9: Authentication Page

Create `src/routes/auth/+page.svelte`:

```svelte
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

<div class="auth-container">
	<div class="auth-content">
		<div class="auth-header">
			<div class="mb-3 text-4xl">💰</div>
			<h2 class="auth-title">
				{isLogin ? 'Welcome back!' : 'Create your account'}
			</h2>
			<p class="auth-subtitle">
				{isLogin
					? "Track your expenses with ease. Let's get you signed in."
					: 'Start your journey to better expense management'}
			</p>
		</div>

		{#if error}
			<div class="auth-error">
				{error}
			</div>
		{/if}

		<form on:submit|preventDefault={handleSubmit} class="auth-form">
			{#if !isLogin}
				<div>
					<label for="name" class="form-label"> Full Name </label>
					<input
						type="text"
						id="name"
						bind:value={name}
						required
						class="input form-input-container"
						placeholder="John Doe"
					/>
				</div>
			{/if}

			<div>
				<label for="email" class="form-label"> Email address </label>
				<input
					type="email"
					id="email"
					bind:value={email}
					required
					class="input form-input-container"
					placeholder="you@example.com"
				/>
			</div>

			<div>
				<label for="password" class="form-label"> Password </label>
				<input
					type="password"
					id="password"
					bind:value={password}
					required
					minlength="8"
					class="input form-input-container"
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
						<div class="loading-spinner-small mr-2"></div>
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
```

## Step 10: Main Expense Tracker Page

Create `src/routes/+page.svelte`:

```svelte
<script lang="ts">
	import { onMount } from 'svelte'
	import { databases, account } from '$lib/appwrite'
	import { DATABASE_ID, EXPENSES_COLLECTION_ID } from '$lib/appwrite'
	import { Query, Permission, Role } from 'appwrite'
	import { formatDistanceToNow } from 'date-fns'

	let expenses = []
	let loading = true
	let error = null
	let showForm = false
	let formData = {
		amount: '',
		description: '',
		category: 'other'
	}

	let editingExpense = null
	let editFormData = {
		amount: '',
		description: '',
		category: 'other'
	}

	const categories = [
		{ id: 'food', name: 'Food & Dining', icon: '🍽️' },
		{ id: 'transport', name: 'Transportation', icon: '🚗' },
		{ id: 'shopping', name: 'Shopping', icon: '🛍️' },
		{ id: 'entertainment', name: 'Entertainment', icon: '🎮' },
		{ id: 'health', name: 'Healthcare', icon: '🏥' },
		{ id: 'utilities', name: 'Utilities', icon: '💡' },
		{ id: 'other', name: 'Other', icon: '📦' }
	]

	let stats = {
		total: 0,
		thisMonth: 0,
		thisWeek: 0
	}

	$: currentAmount = editingExpense ? editFormData.amount : formData.amount
	$: currentDescription = editingExpense ? editFormData.description : formData.description
	$: currentCategory = editingExpense ? editFormData.category : formData.category

	onMount(async () => {
		await fetchExpenses()
	})

	async function fetchExpenses() {
		try {
			loading = true
			const response = await databases.listDocuments(DATABASE_ID, EXPENSES_COLLECTION_ID, [
				Query.orderDesc('$createdAt')
			])
			expenses = response.documents
			calculateStats()
		} catch (e) {
			error = 'Failed to load expenses'
			console.error('Error fetching expenses:', e)
		} finally {
			loading = false
		}
	}

	function calculateStats() {
		const now = new Date()
		const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
		const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()))

		stats.total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
		stats.thisMonth = expenses
			.filter((exp) => new Date(exp.$createdAt) >= thisMonth)
			.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
		stats.thisWeek = expenses
			.filter((exp) => new Date(exp.$createdAt) >= thisWeek)
			.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
	}

	async function handleSubmit() {
		try {
			const user = await account.get()
			const now = new Date().toISOString()
			const expenseData = {
				amount: parseFloat(currentAmount),
				description: currentDescription,
				category: currentCategory,
				userId: user.$id,
				date: now,
				createdAt: now,
				updatedAt: now
			}

			if (editingExpense) {
				await databases.updateDocument(DATABASE_ID, EXPENSES_COLLECTION_ID, editingExpense.$id, {
					...expenseData,
					updatedAt: now
				})
			} else {
				await databases.createDocument(
					DATABASE_ID,
					EXPENSES_COLLECTION_ID,
					'unique()',
					expenseData,
					[
						Permission.read(Role.user(user.$id)),
						Permission.update(Role.user(user.$id)),
						Permission.delete(Role.user(user.$id))
					]
				)
			}

			// Reset form
			formData = { amount: '', description: '', category: 'other' }
			editFormData = { amount: '', description: '', category: 'other' }
			editingExpense = null
			showForm = false
			await fetchExpenses()
		} catch (e) {
			console.error('Error saving expense:', e)
			error = 'Failed to save expense'
		}
	}

	async function deleteExpense(id) {
		try {
			await databases.deleteDocument(DATABASE_ID, EXPENSES_COLLECTION_ID, id)
			await fetchExpenses()
		} catch (e) {
			error = 'Failed to delete expense'
			console.error('Error deleting expense:', e)
		}
	}

	function formatAmount(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount)
	}

	function getCategoryIcon(categoryId) {
		return categories.find((cat) => cat.id === categoryId)?.icon || '📦'
	}

	function getCategoryName(categoryId) {
		return categories.find((cat) => cat.id === categoryId)?.name || 'Other'
	}

	function editExpense(expense) {
		editingExpense = expense
		editFormData = {
			amount: expense.amount.toString(),
			description: expense.description,
			category: expense.category
		}
		showForm = true
	}
</script>

<!-- Template section continues in next step -->
```

## Step 11: Main Page Template

Add this template section to `src/routes/+page.svelte`:

```svelte
<div class="page-container">
	<!-- Stats Overview -->
	<div class="stats-grid">
		<div class="stats-card stats-card-primary">
			<h3 class="stats-title">Total Expenses</h3>
			<p class="stats-value">{formatAmount(stats.total)}</p>
		</div>
		<div class="stats-card stats-card-accent">
			<h3 class="stats-title">This Month</h3>
			<p class="stats-value">{formatAmount(stats.thisMonth)}</p>
		</div>
		<div class="stats-card stats-card-neutral">
			<h3 class="stats-title">This Week</h3>
			<p class="stats-value">{formatAmount(stats.thisWeek)}</p>
		</div>
	</div>

	<!-- Add Expense Button -->
	<div class="flex justify-end">
		<button on:click={() => (showForm = true)} class="btn btn-primary"> Add Expense </button>
	</div>

	<!-- Add Expense Form -->
	{#if showForm}
		<div class="modal-overlay">
			<div class="modal-container">
				<div class="modal-header">
					<h2 class="modal-title">
						{editingExpense ? 'Edit Expense' : 'Add New Expense'}
					</h2>
					<button on:click={() => (showForm = false)} class="close-button" aria-label="Close modal">
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<form on:submit|preventDefault={handleSubmit} class="form-container">
					<div>
						<label for="amount" class="form-label"> Amount </label>
						<input
							type="number"
							id="amount"
							bind:value={currentAmount}
							step="0.01"
							required
							class="input form-input-container"
							placeholder="0.00"
						/>
					</div>
					<div>
						<label for="description" class="form-label"> Description </label>
						<input
							type="text"
							id="description"
							bind:value={currentDescription}
							required
							class="input form-input-container"
							placeholder="What did you spend on?"
						/>
					</div>
					<div>
						<label for="category" class="form-label"> Category </label>
						<select id="category" bind:value={currentCategory} class="input form-input-container">
							{#each categories as category}
								<option value={category.id}>
									{category.icon}
									{category.name}
								</option>
							{/each}
						</select>
					</div>
					<div class="flex justify-end space-x-3">
						<button type="button" on:click={() => (showForm = false)} class="btn btn-secondary">
							Cancel
						</button>
						<button type="submit" class="btn btn-primary">
							{editingExpense ? 'Update Expense' : 'Add Expense'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Expenses List -->
	<div class="expense-list">
		<h2 class="modal-title">Recent Expenses</h2>
		{#if loading}
			<div class="flex justify-center py-8">
				<div class="loading-spinner"></div>
			</div>
		{:else if error}
			<div class="auth-error">
				<p>{error}</p>
			</div>
		{:else if expenses.length === 0}
			<div class="empty-state">
				<div class="empty-state-icon">💸</div>
				<h3 class="empty-state-title">No expenses yet</h3>
				<p class="empty-state-text">Start tracking your expenses by adding one above!</p>
			</div>
		{:else}
			<div class="expense-list">
				{#each expenses as expense}
					<div class="expense-item">
						<div class="expense-details">
							<div class="expense-icon">
								{getCategoryIcon(expense.category)}
							</div>
							<div>
								<p class="expense-description">{expense.description}</p>
								<p class="expense-meta">
									{getCategoryName(expense.category)} •
									{formatDistanceToNow(new Date(expense.$createdAt), { addSuffix: true })}
								</p>
							</div>
						</div>
						<div class="expense-actions">
							<p class="expense-amount">
								{formatAmount(expense.amount)}
							</p>
							<button
								on:click={() => editExpense(expense)}
								class="action-button action-button-edit"
								aria-label="Edit expense"
							>
								<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path
										d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
									/>
								</svg>
							</button>
							<button
								on:click={() => deleteExpense(expense.$id)}
								class="action-button action-button-delete"
								aria-label="Delete expense"
							>
								<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
										clip-rule="evenodd"
									/>
								</svg>
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
```

## Step 12: Styling

The app uses a comprehensive set of Tailwind CSS classes organized in `app.css`. The file includes:

- Custom color variables
- Base styles
- Component classes
- Utility classes
- Custom animations

[Link to complete app.css code]

## Running the Application

1. Start the development server:

```bash
pnpm dev
```

2. Visit `http://localhost:5173` in your browser

The application should now be fully functional with:

- User authentication (signup/login)
- Expense creation and management
- Real-time statistics
- Responsive design
- Accessibility features
