<script lang="ts">
  import { onMount } from 'svelte';
  import { databases, account } from '$lib/appwrite';
  import { DATABASE_ID, EXPENSES_COLLECTION_ID } from '$lib/appwrite';
  import { Query } from 'appwrite';
  import { formatDistanceToNow } from 'date-fns';

  let expenses = [];
  let loading = true;
  let error = null;
  let showForm = false;
  let formData = {
    amount: '',
    description: '',
    category: 'other',
  };

  let editingExpense = null;
  let editFormData = {
    amount: '',
    description: '',
    category: 'other',
  };

  const categories = [
    { id: 'food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'transport', name: 'Transportation', icon: '🚗' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮' },
    { id: 'health', name: 'Healthcare', icon: '🏥' },
    { id: 'utilities', name: 'Utilities', icon: '💡' },
    { id: 'other', name: 'Other', icon: '📦' },
  ];

  let stats = {
    total: 0,
    thisMonth: 0,
    thisWeek: 0,
  };

  $: currentAmount = editingExpense ? editFormData.amount : formData.amount;
  $: currentDescription = editingExpense ? editFormData.description : formData.description;
  $: currentCategory = editingExpense ? editFormData.category : formData.category;

  function handleInputChange(field, value) {
    if (editingExpense) {
      editFormData[field] = value;
    } else {
      formData[field] = value;
    }
  }

  onMount(async () => {
    await fetchExpenses();
  });

  async function fetchExpenses() {
    try {
      loading = true;
      const response = await databases.listDocuments(
        DATABASE_ID,
        EXPENSES_COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
      );
      expenses = response.documents;
      calculateStats();
    } catch (e) {
      error = 'Failed to load expenses';
      console.error('Error fetching expenses:', e);
    } finally {
      loading = false;
    }
  }

  function calculateStats() {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    stats.total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    stats.thisMonth = expenses
      .filter(exp => new Date(exp.$createdAt) >= thisMonth)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    stats.thisWeek = expenses
      .filter(exp => new Date(exp.$createdAt) >= thisWeek)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  }

  async function handleSubmit() {
    try {
      const user = await account.get();
      
      if (editingExpense) {
        await databases.updateDocument(
          DATABASE_ID,
          EXPENSES_COLLECTION_ID,
          editingExpense.$id,
          {
            amount: parseFloat(currentAmount),
            description: currentDescription,
            category: currentCategory,
            userId: user.$id,
          }
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          EXPENSES_COLLECTION_ID,
          'unique()',
          {
            amount: parseFloat(currentAmount),
            description: currentDescription,
            category: currentCategory,
            userId: user.$id,
          }
        );
      }

      // Reset form
      formData = { amount: '', description: '', category: 'other' };
      editFormData = { amount: '', description: '', category: 'other' };
      editingExpense = null;
      showForm = false;
      await fetchExpenses();
    } catch (e) {
      console.error('Error saving expense:', e);
    }
  }

  async function deleteExpense(id) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        EXPENSES_COLLECTION_ID,
        id
      );
      await fetchExpenses();
    } catch (e) {
      error = 'Failed to delete expense';
      console.error('Error deleting expense:', e);
    }
  }

  function formatAmount(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  function getCategoryIcon(categoryId) {
    return categories.find(cat => cat.id === categoryId)?.icon || '📦';
  }

  function getCategoryName(categoryId) {
    return categories.find(cat => cat.id === categoryId)?.name || 'Other';
  }

  function editExpense(expense) {
    editingExpense = expense;
    editFormData = {
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category,
    };
    showForm = true;
  }

  function cancelEdit() {
    editingExpense = null;
    editFormData = { amount: '', description: '', category: 'other' };
    showForm = false;
  }
</script>

<div class="space-y-8">
  <!-- Stats Overview -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div class="card bg-gradient-to-br from-primary-500 to-primary-600">
      <h3 class="text-sm font-medium text-primary-50">Total Expenses</h3>
      <p class="mt-2 text-2xl font-bold text-white">{formatAmount(stats.total)}</p>
    </div>
    <div class="card bg-gradient-to-br from-accent-500 to-accent-600">
      <h3 class="text-sm font-medium text-accent-50">This Month</h3>
      <p class="mt-2 text-2xl font-bold text-white">{formatAmount(stats.thisMonth)}</p>
    </div>
    <div class="card bg-gradient-to-br from-neutral-600 to-neutral-700 sm:col-span-2 lg:col-span-1">
      <h3 class="text-sm font-medium text-neutral-50">This Week</h3>
      <p class="mt-2 text-2xl font-bold text-white">{formatAmount(stats.thisWeek)}</p>
    </div>
  </div>

  <!-- Add Expense Button -->
  <div class="flex justify-end">
    <button
      on:click={() => (showForm = true)}
      class="btn btn-primary"
    >
      Add Expense
    </button>
  </div>

  <!-- Add Expense Form -->
  {#if showForm}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-neutral-900">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <button
            on:click={() => (showForm = false)}
            class="text-neutral-500 hover:text-neutral-700"
          >
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
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
          <div>
            <label for="amount" class="block text-sm font-medium text-neutral-700">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              bind:value={currentAmount}
              step="0.01"
              required
              class="input mt-1 w-full"
              placeholder="0.00"
            />
          </div>
          <div>
            <label for="description" class="block text-sm font-medium text-neutral-700">
              Description
            </label>
            <input
              type="text"
              id="description"
              bind:value={currentDescription}
              required
              class="input mt-1 w-full"
              placeholder="What did you spend on?"
            />
          </div>
          <div>
            <label for="category" class="block text-sm font-medium text-neutral-700">
              Category
            </label>
            <select
              id="category"
              bind:value={currentCategory}
              class="input mt-1 w-full"
            >
              {#each categories as category}
                <option value={category.id}>
                  {category.icon} {category.name}
                </option>
              {/each}
            </select>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              on:click={() => (showForm = false)}
              class="btn btn-secondary"
            >
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
  <div class="space-y-4">
    <h2 class="text-lg font-semibold text-neutral-900">Recent Expenses</h2>
    {#if loading}
      <div class="flex justify-center py-8">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    {:else if error}
      <div class="rounded-lg bg-red-50 p-4 text-red-700">
        <p>{error}</p>
      </div>
    {:else if expenses.length === 0}
      <div class="flex flex-col items-center justify-center space-y-4 rounded-lg bg-white py-12">
        <div class="text-6xl">💸</div>
        <h3 class="text-lg font-medium text-neutral-900">No expenses yet</h3>
        <p class="text-neutral-600">Start tracking your expenses by adding one above!</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each expenses as expense}
          <div class="card flex items-center justify-between hover:bg-neutral-50">
            <div class="flex items-center space-x-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-2xl">
                {getCategoryIcon(expense.category)}
              </div>
              <div>
                <p class="font-medium text-neutral-900">{expense.description}</p>
                <p class="text-sm text-neutral-600">
                  {getCategoryName(expense.category)} •
                  {formatDistanceToNow(new Date(expense.$createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <p class="text-lg font-semibold text-neutral-900">
                {formatAmount(expense.amount)}
              </p>
              <button
                on:click={() => editExpense(expense)}
                class="text-neutral-400 hover:text-primary-600"
              >
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                on:click={() => deleteExpense(expense.$id)}
                class="text-neutral-400 hover:text-error"
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
