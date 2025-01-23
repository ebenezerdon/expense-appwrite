<script lang="ts">
	import { onMount } from 'svelte'
	import { user } from '$lib/stores/auth'
	import {
		expenses,
		fetchExpenses,
		addExpense,
		updateExpense,
		deleteExpense
	} from '$lib/stores/expenses'
	import { EXPENSE_CATEGORIES, type ExpenseCategory } from '$lib/appwrite'
	import { format } from 'date-fns'

	let loading = true
	let error = ''
	let showForm = false
	let editingExpense: any = null

	// Form data
	let amount = ''
	let category: ExpenseCategory = 'other'
	let description = ''
	let date = format(new Date(), 'yyyy-MM-dd')

	$: if ($user && loading) {
		fetchExpenses($user.$id)
			.then(() => {
				loading = false
			})
			.catch((e) => {
				error = 'Failed to load expenses'
				loading = false
			})
	}

	const handleSubmit = async () => {
		try {
			if (editingExpense) {
				await updateExpense(editingExpense.id, {
					amount: parseFloat(amount),
					category,
					description,
					date,
					userId: $user?.$id
				})
			} else {
				await addExpense({
					amount: parseFloat(amount),
					category,
					description,
					date,
					userId: $user?.$id
				})
			}
			resetForm()
		} catch (e) {
			error = 'Failed to save expense'
		}
	}

	const handleEdit = (expense: any) => {
		editingExpense = expense
		amount = expense.amount.toString()
		category = expense.category
		description = expense.description
		date = expense.date
		showForm = true
	}

	const handleDelete = async (id: string) => {
		if (confirm('Are you sure you want to delete this expense?')) {
			try {
				await deleteExpense(id)
			} catch (e) {
				error = 'Failed to delete expense'
			}
		}
	}

	const resetForm = () => {
		amount = ''
		category = 'other'
		description = ''
		date = format(new Date(), 'yyyy-MM-dd')
		editingExpense = null
		showForm = false
	}

	$: total = $expenses.reduce((sum, exp) => sum + exp.amount, 0)
</script>

<div class="min-h-screen bg-gray-100">
	<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<div class="flex justify-between items-center mb-6">
				<h1 class="text-3xl font-bold text-gray-900">Expenses</h1>
				<button
					on:click={() => (showForm = !showForm)}
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
				>
					{showForm ? 'Close Form' : 'Add Expense'}
				</button>
			</div>

			{#if error}
				<div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="ml-3">
							<p class="text-sm text-red-700">{error}</p>
						</div>
					</div>
				</div>
			{/if}

			{#if showForm}
				<div class="bg-white shadow rounded-lg p-6 mb-6">
					<form on:submit|preventDefault={handleSubmit} class="space-y-4">
						<div>
							<label for="amount" class="block text-sm font-medium text-gray-700">Amount</label>
							<input
								type="number"
								id="amount"
								bind:value={amount}
								required
								min="0"
								step="0.01"
								class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
						</div>

						<div>
							<label for="category" class="block text-sm font-medium text-gray-700">Category</label>
							<select
								id="category"
								bind:value={category}
								required
								class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							>
								{#each EXPENSE_CATEGORIES as cat}
									<option value={cat}>{cat}</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="description" class="block text-sm font-medium text-gray-700"
								>Description</label
							>
							<input
								type="text"
								id="description"
								bind:value={description}
								required
								class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
						</div>

						<div>
							<label for="date" class="block text-sm font-medium text-gray-700">Date</label>
							<input
								type="date"
								id="date"
								bind:value={date}
								required
								class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							/>
						</div>

						<div class="flex justify-end space-x-3">
							<button
								type="button"
								on:click={resetForm}
								class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Cancel
							</button>
							<button
								type="submit"
								class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								{editingExpense ? 'Update' : 'Add'} Expense
							</button>
						</div>
					</form>
				</div>
			{/if}

			{#if loading}
				<div class="text-center py-12">
					<svg
						class="animate-spin h-8 w-8 text-indigo-600 mx-auto"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				</div>
			{:else if $expenses.length === 0}
				<div class="text-center py-12">
					<p class="text-gray-500">No expenses yet. Add your first expense!</p>
				</div>
			{:else}
				<div class="bg-white shadow overflow-hidden sm:rounded-lg">
					<div class="px-4 py-5 border-b border-gray-200 sm:px-6">
						<h3 class="text-lg leading-6 font-medium text-gray-900">
							Total Expenses: ${total.toFixed(2)}
						</h3>
					</div>
					<ul class="divide-y divide-gray-200">
						{#each $expenses as expense}
							<li class="px-4 py-4 sm:px-6">
								<div class="flex items-center justify-between">
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium text-indigo-600 truncate">
											{expense.description}
										</p>
										<p class="text-sm text-gray-500">
											{expense.category} • {format(new Date(expense.date), 'MMM d, yyyy')}
										</p>
									</div>
									<div class="flex items-center space-x-4">
										<div class="flex-shrink-0">
											<span class="text-lg font-semibold text-gray-900">
												${expense.amount.toFixed(2)}
											</span>
										</div>
										<div class="flex space-x-2">
											<button
												on:click={() => handleEdit(expense)}
												class="text-indigo-600 hover:text-indigo-900"
											>
												Edit
											</button>
											<button
												on:click={() => handleDelete(expense.id)}
												class="text-red-600 hover:text-red-900"
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</div>
</div>
