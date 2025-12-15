import {
	collection,
	doc,
	addDoc,
	getDoc,
	getDocs,
	updateDoc,
	query,
	orderBy,
	where,
	serverTimestamp,
	Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Invoice, InvoiceStatus } from '$lib/types/invoice';
import { generateInvoiceNumber } from '$lib/utils/invoice-number';

export async function getInvoices(userId: string): Promise<Invoice[]> {
	try {
		const invoicesRef = collection(db, 'users', userId, 'invoices');
		const q = query(invoicesRef, orderBy('createdAt', 'desc'));
		const snapshot = await getDocs(q);

		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		})) as Invoice[];
	} catch (error) {
		console.error('Error getting invoices:', error);
		throw error;
	}
}

export async function getInvoice(userId: string, invoiceId: string): Promise<Invoice | null> {
	try {
		const invoiceDoc = await getDoc(doc(db, 'users', userId, 'invoices', invoiceId));
		if (invoiceDoc.exists()) {
			return {
				id: invoiceDoc.id,
				...invoiceDoc.data()
			} as Invoice;
		}
		return null;
	} catch (error) {
		console.error('Error getting invoice:', error);
		throw error;
	}
}

export async function createInvoice(
	userId: string,
	invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>,
	invoicePrefix: string
): Promise<string> {
	try {
		const invoiceNumber = await generateInvoiceNumber(userId, invoicePrefix);

		const invoicesRef = collection(db, 'users', userId, 'invoices');
		const docRef = await addDoc(invoicesRef, {
			...invoice,
			invoiceNumber,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp()
		});

		return docRef.id;
	} catch (error) {
		console.error('Error creating invoice:', error);
		throw error;
	}
}

export async function updateInvoice(
	userId: string,
	invoiceId: string,
	updates: Partial<Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
	try {
		const invoiceRef = doc(db, 'users', userId, 'invoices', invoiceId);
		await updateDoc(invoiceRef, {
			...updates,
			updatedAt: serverTimestamp()
		});
	} catch (error) {
		console.error('Error updating invoice:', error);
		throw error;
	}
}

export async function updateInvoiceStatus(
	userId: string,
	invoiceId: string,
	status: InvoiceStatus
): Promise<void> {
	try {
		const updates: any = { status };

		if (status === 'sent') {
			updates.sentAt = serverTimestamp();
		} else if (status === 'paid') {
			updates.paidAt = serverTimestamp();
		}

		await updateInvoice(userId, invoiceId, updates);
	} catch (error) {
		console.error('Error updating invoice status:', error);
		throw error;
	}
}

export async function getInvoicesByStatus(userId: string, status: InvoiceStatus): Promise<Invoice[]> {
	try {
		const invoicesRef = collection(db, 'users', userId, 'invoices');
		const q = query(invoicesRef, where('status', '==', status), orderBy('createdAt', 'desc'));
		const snapshot = await getDocs(q);

		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		})) as Invoice[];
	} catch (error) {
		console.error('Error getting invoices by status:', error);
		throw error;
	}
}

export async function getOverdueInvoices(userId: string): Promise<Invoice[]> {
	try {
		const now = Timestamp.now();
		const invoicesRef = collection(db, 'users', userId, 'invoices');
		const q = query(
			invoicesRef,
			where('status', '==', 'sent'),
			where('dueDate', '<', now),
			orderBy('dueDate', 'desc')
		);
		const snapshot = await getDocs(q);

		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		})) as Invoice[];
	} catch (error) {
		console.error('Error getting overdue invoices:', error);
		throw error;
	}
}
