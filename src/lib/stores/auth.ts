import { writable } from 'svelte/store';
import { account } from '$lib/appwrite';

export const user = writable(null);

export async function initAuth() {
  try {
    const currentUser = await account.get();
    user.set(currentUser);
    return currentUser;
  } catch (error) {
    user.set(null);
    return null;
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
    user.set(null);
  } catch (error) {
    console.error('Logout error:', error);
  }
}
