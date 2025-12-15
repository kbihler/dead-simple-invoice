import {
	collection,
	doc,
	addDoc,
	getDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	query,
	orderBy,
	serverTimestamp,
	where
} from 'firebase/firestore';
import { db } from './firebase';
import type { Client } from '$lib/types/client';

export async function getClients(userId: string): Promise<Client[]> {
	try {
		const clientsRef = collection(db, 'users', userId, 'clients');
		const q = query(clientsRef, orderBy('createdAt', 'desc'));
		const snapshot = await getDocs(q);

		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		})) as Client[];
	} catch (error) {
		console.error('Error getting clients:', error);
		throw error;
	}
}

export async function getClient(userId: string, clientId: string): Promise<Client | null> {
	try {
		const clientDoc = await getDoc(doc(db, 'users', userId, 'clients', clientId));
		if (clientDoc.exists()) {
			return {
				id: clientDoc.id,
				...clientDoc.data()
			} as Client;
		}
		return null;
	} catch (error) {
		console.error('Error getting client:', error);
		throw error;
	}
}

export async function createClient(
	userId: string,
	client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
	try {
		const clientsRef = collection(db, 'users', userId, 'clients');
		const docRef = await addDoc(clientsRef, {
			...client,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp()
		});
		return docRef.id;
	} catch (error) {
		console.error('Error creating client:', error);
		throw error;
	}
}

export async function updateClient(
	userId: string,
	clientId: string,
	updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
	try {
		const clientRef = doc(db, 'users', userId, 'clients', clientId);
		await updateDoc(clientRef, {
			...updates,
			updatedAt: serverTimestamp()
		});
	} catch (error) {
		console.error('Error updating client:', error);
		throw error;
	}
}

export async function deleteClient(userId: string, clientId: string): Promise<void> {
	try {
		// Check if client has any invoices
		const invoicesRef = collection(db, 'users', userId, 'invoices');
		const q = query(invoicesRef, where('clientId', '==', clientId));
		const snapshot = await getDocs(q);

		if (!snapshot.empty) {
			throw new Error('Cannot delete client with existing invoices');
		}

		await deleteDoc(doc(db, 'users', userId, 'clients', clientId));
	} catch (error) {
		console.error('Error deleting client:', error);
		throw error;
	}
}
