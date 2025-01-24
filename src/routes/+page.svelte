<script lang="ts">
	import { onMount } from 'svelte'
	import { databases, account } from '$lib/appwrite'
	import { DATABASE_ID, EXPENSES_COLLECTION_ID } from '$lib/appwrite'
	import { Query } from 'appwrite'
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

	function handleInputChange(field, value) {
		if (editingExpense) {
			editFormData[field] = value
		} else {
			formData[field] = value
		}
	}

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
					updatedAt: now // Only update the updatedAt timestamp
				})
			} else {
				await databases.createDocument(DATABASE_ID, EXPENSES_COLLECTION_ID, 'unique()', expenseData)
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

	function cancelEdit() {
		editingExpense = null
		editFormData = { amount: '', description: '', category: 'other' }
		showForm = false
	}
</script>

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
					<button on:click={() => (showForm = false)} class="close-button">
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

<style>
	/* Add any additional component-specific styles here */
</style>
