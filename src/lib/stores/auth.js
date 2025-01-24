import { writable } from 'svelte/store'
import { account } from '$lib/appwrite'
import { ID } from 'appwrite'

export const user = writable(null)

export async function initAuth() {
	try {
		const currentUser = await account.get()
		user.set(currentUser)
		return currentUser
	} catch (error) {
		console.error('Error initializing auth:', error)
		user.set(null)
		return null
	}
}

export async function login(email, password) {
	try {
		await account.createEmailPasswordSession(email, password)
		await initAuth()
	} catch (error) {
		console.error('Login error:', error)
		throw error
	}
}

export async function register(email, password, name) {
	try {
		await account.create(ID.unique(), email, password, name)
		await account.createEmailPasswordSession(email, password)
		await initAuth()
	} catch (error) {
		console.error('Registration error:', error)
		throw error
	}
}

export async function logout() {
	try {
		await account.deleteSession('current')
		user.set(null)
	} catch (error) {
		console.error('Logout error:', error)
	}
}
