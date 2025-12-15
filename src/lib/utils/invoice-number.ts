import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '$lib/services/firebase';

export async function generateInvoiceNumber(userId: string, prefix: string): Promise<string> {
	const year = new Date().getFullYear();

	// Get the last invoice for this year
	const invoicesRef = collection(db, 'users', userId, 'invoices');
	const q = query(
		invoicesRef,
		where('invoiceNumber', '>=', `${prefix}-${year}-000`),
		where('invoiceNumber', '<=', `${prefix}-${year}-999`),
		orderBy('invoiceNumber', 'desc'),
		limit(1)
	);

	const snapshot = await getDocs(q);

	let nextNumber = 1;
	if (!snapshot.empty) {
		const lastInvoice = snapshot.docs[0].data();
		const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
		nextNumber = lastNumber + 1;
	}

	const paddedNumber = String(nextNumber).padStart(3, '0');
	return `${prefix}-${year}-${paddedNumber}`;
}
