import { Client, Account, Databases } from 'appwrite';
import {
	PUBLIC_APPWRITE_ENDPOINT,
	PUBLIC_APPWRITE_PROJECT_ID,
	PUBLIC_APPWRITE_DATABASE_ID,
	PUBLIC_APPWRITE_COLLECTION_ID
} from '$env/static/public';

const client = new Client();

client.setEndpoint(PUBLIC_APPWRITE_ENDPOINT).setProject(PUBLIC_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);

// Collection IDs from environment variables
export const EXPENSES_COLLECTION_ID = PUBLIC_APPWRITE_COLLECTION_ID;
export const DATABASE_ID = PUBLIC_APPWRITE_DATABASE_ID;

// Expense categories
export const EXPENSE_CATEGORIES = [
	'food',
	'rent',
	'transportation',
	'entertainment',
	'shopping',
	'healthcare',
	'utilities',
	'education',
	'other'
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface Expense {
	id: string;
	userId: string;
	amount: number;
	category: ExpenseCategory;
	description: string;
	date: string;
	createdAt: string;
	updatedAt: string;
}
