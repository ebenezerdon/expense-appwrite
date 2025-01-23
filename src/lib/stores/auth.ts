import { writable } from 'svelte/store'
import { account } from '$lib/appwrite'
import { ID, type Models } from 'appwrite'

export const user = writable<Models.User<Models.Preferences> | null>(null)
console.log('hey==>user: ', user)

export const initAuth = async () => {
	try {
		const session = await account.get()
		user.set(session)
		console.log(session)
	} catch (error) {
		user.set(null)
	}
}

export const login = async (email: string, password: string) => {
	try {
		await account.createEmailPasswordSession(email, password)
		await initAuth()
	} catch (error: any) {
		throw new Error(error?.message || 'Login failed')
	}
}

export const register = async (email: string, password: string, name: string) => {
	try {
		await account.create(ID.unique(), email, password, name)
		await login(email, password)
	} catch (error: any) {
		throw new Error(error?.message || 'Registration failed')
	}
}

export const logout = async () => {
	try {
		await account.deleteSession('current')
		user.set(null)
	} catch (error: any) {
		throw new Error(error?.message || 'Logout failed')
	}
}
