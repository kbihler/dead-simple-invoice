import type { Timestamp } from 'firebase/firestore';

export interface LineItem {
	id: string;
	description: string;
	quantity: number;
	rate: number;
	amount: number;
}

export interface ClientSnapshot {
	name: string;
	email: string;
	address: string;
	phone?: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid';

export interface Invoice {
	id: string;
	invoiceNumber: string;
	clientId: string;
	clientSnapshot: ClientSnapshot;
	date: Timestamp;
	dueDate: Timestamp;
	lineItems: LineItem[];
	subtotal: number;
	taxRate: number;
	taxAmount: number;
	total: number;
	status: InvoiceStatus;
	sentAt?: Timestamp;
	paidAt?: Timestamp;
	notes?: string;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}
