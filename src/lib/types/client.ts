import type { Timestamp } from 'firebase/firestore';

export interface Client {
	id: string;
	name: string;
	email: string;
	address: string;
	phone?: string;
	notes?: string;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}
