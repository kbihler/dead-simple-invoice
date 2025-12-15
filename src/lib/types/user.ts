import type { Timestamp } from 'firebase/firestore';

export interface BusinessInfo {
	name: string;
	address: string;
	phone: string;
	email: string;
	logoUrl?: string;
	taxId?: string;
}

export interface UserSettings {
	defaultTaxRate: number;
	invoicePrefix: string;
	invoiceStartNumber: number;
}

export interface User {
	uid: string;
	email: string;
	displayName: string;
	businessInfo: BusinessInfo;
	settings: UserSettings;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}
