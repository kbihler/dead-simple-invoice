import type { LineItem } from '$lib/types/invoice';

export function calculateLineItemAmount(quantity: number, rate: number): number {
	return quantity * rate;
}

export function calculateSubtotal(lineItems: LineItem[]): number {
	return lineItems.reduce((sum, item) => sum + item.amount, 0);
}

export function calculateTaxAmount(subtotal: number, taxRate: number): number {
	return subtotal * (taxRate / 100);
}

export function calculateTotal(subtotal: number, taxAmount: number): number {
	return subtotal + taxAmount;
}

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(amount);
}

export function roundToTwo(num: number): number {
	return Math.round(num * 100) / 100;
}
