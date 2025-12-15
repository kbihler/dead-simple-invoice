import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { User, BusinessInfo, UserSettings } from '$lib/types/user';

export async function getUserProfile(uid: string): Promise<User | null> {
	try {
		const userDoc = await getDoc(doc(db, 'users', uid));
		if (userDoc.exists()) {
			return userDoc.data() as User;
		}
		return null;
	} catch (error) {
		console.error('Error getting user profile:', error);
		throw error;
	}
}

export async function createUserProfile(uid: string, email: string, displayName: string): Promise<User> {
	try {
		const defaultSettings: UserSettings = {
			defaultTaxRate: 0,
			invoicePrefix: 'INV',
			invoiceStartNumber: 1
		};

		const defaultBusinessInfo: BusinessInfo = {
			name: '',
			address: '',
			phone: '',
			email: email
		};

		const user: Omit<User, 'createdAt' | 'updatedAt'> = {
			uid,
			email,
			displayName,
			businessInfo: defaultBusinessInfo,
			settings: defaultSettings
		};

		await setDoc(doc(db, 'users', uid), {
			...user,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp()
		});

		return {
			...user,
			createdAt: serverTimestamp() as any,
			updatedAt: serverTimestamp() as any
		};
	} catch (error) {
		console.error('Error creating user profile:', error);
		throw error;
	}
}

export async function updateUserProfile(
	uid: string,
	updates: Partial<Pick<User, 'businessInfo' | 'settings'>>
): Promise<void> {
	try {
		await updateDoc(doc(db, 'users', uid), {
			...updates,
			updatedAt: serverTimestamp()
		});
	} catch (error) {
		console.error('Error updating user profile:', error);
		throw error;
	}
}

export async function updateBusinessInfo(uid: string, businessInfo: BusinessInfo): Promise<void> {
	return updateUserProfile(uid, { businessInfo });
}

export async function updateSettings(uid: string, settings: UserSettings): Promise<void> {
	return updateUserProfile(uid, { settings });
}
