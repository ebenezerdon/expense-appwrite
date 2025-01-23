import { writable } from 'svelte/store'
import { databases } from '$lib/appwrite'
import { DATABASE_ID, EXPENSES_COLLECTION_ID } from '$lib/appwrite'
import type { Expense } from '$lib/appwrite'
import { ID, Query, Permission, Role } from 'appwrite'

export const expenses = writable<Expense[]>([])

export const fetchExpenses = async (userId: string) => {
	try {
		const response = await databases.listDocuments(DATABASE_ID, EXPENSES_COLLECTION_ID, [
			Query.equal('userId', userId)
		])
		expenses.set(response.documents as unknown as Expense[])
	} catch (error) {
		console.error('Error fetching expenses:', error)
		expenses.set([])
	}
}

export const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
	try {
		const now = new Date().toISOString()
		const response = await databases.createDocument(
			DATABASE_ID,
			EXPENSES_COLLECTION_ID,
			ID.unique(),
			{
				userId: expense.userId,
				amount: expense.amount,
				category: expense.category,
				description: expense.description,
				date: new Date(expense.date).toISOString(),
				createdAt: now,
				updatedAt: now
			},
			[
				Permission.read(Role.user(expense.userId)),
				Permission.update(Role.user(expense.userId)),
				Permission.delete(Role.user(expense.userId))
			]
		)
		expenses.update((current) => [...current, response as unknown as Expense])
	} catch (error) {
		console.error('Error adding expense:', error)
		throw error
	}
}

export const updateExpense = async (id: string, expense: Partial<Expense>) => {
	try {
		const now = new Date().toISOString()
		const updateData = {
			...expense,
			date: expense.date ? new Date(expense.date).toISOString() : undefined,
			updatedAt: now
		}
		const response = await databases.updateDocument(
			DATABASE_ID,
			EXPENSES_COLLECTION_ID,
			id,
			updateData
		)
		expenses.update((current) =>
			current.map((item) => (item.id === id ? (response as unknown as Expense) : item))
		)
	} catch (error) {
		console.error('Error updating expense:', error)
		throw error
	}
}

export const deleteExpense = async (id: string) => {
	try {
		await databases.deleteDocument(DATABASE_ID, EXPENSES_COLLECTION_ID, id)
		expenses.update((current) => current.filter((item) => item.id !== id))
	} catch (error) {
		console.error('Error deleting expense:', error)
		throw error
	}
}
