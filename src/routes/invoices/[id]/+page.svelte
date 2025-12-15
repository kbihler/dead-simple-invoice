<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authUser } from '$lib/stores/auth';
	import { getInvoice, updateInvoiceStatus } from '$lib/services/invoice.service';
	import { getUserProfile } from '$lib/services/user.service';
	import { generateInvoicePDF, downloadPDF } from '$lib/services/pdf.service';
	import { toasts } from '$lib/stores/toast';
	import { formatCurrency } from '$lib/utils/calculations';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { Invoice } from '$lib/types/invoice';

	let user = $state<any>(null);
	let invoice = $state<Invoice | null>(null);
	let loading = $state(true);
	let downloadingPDF = $state(false);

	authUser.subscribe((value) => {
		user = value;
	});

	// Load invoice when user is available
	$effect(() => {
		if (user && loading) {
			loadInvoice();
		}
	});

	async function loadInvoice() {
		try {
			loading = true;
			const invoiceId = $page.params.id;
			invoice = await getInvoice(user.uid, invoiceId);

			if (!invoice) {
				toasts.show('Invoice not found', 'error');
				goto('/invoices');
			}
		} catch (error) {
			toasts.show('Error loading invoice', 'error');
			goto('/invoices');
		} finally {
			loading = false;
		}
	}

	async function markAsPaid() {
		if (!invoice) return;

		try {
			await updateInvoiceStatus(user.uid, invoice.id, 'paid');
			toasts.show('Invoice marked as paid', 'success');
			await loadInvoice();
		} catch (error) {
			toasts.show('Error updating invoice', 'error');
		}
	}

	async function handleDownloadPDF() {
		if (!invoice) return;

		try {
			downloadingPDF = true;

			// Get user profile for business info
			const userProfile = await getUserProfile(user.uid);
			if (!userProfile) {
				toasts.show('User profile not found', 'error');
				return;
			}

			// Generate PDF
			const pdfBlob = await generateInvoicePDF(invoice, userProfile);

			// Download PDF
			downloadPDF(pdfBlob, `invoice-${invoice.invoiceNumber}.pdf`);

			toasts.show('PDF downloaded successfully', 'success');
		} catch (error) {
			console.error('Error generating PDF:', error);
			toasts.show('Error generating PDF', 'error');
		} finally {
			downloadingPDF = false;
		}
	}

	function formatDate(timestamp: any): string {
		if (!timestamp) return '';
		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	}

	function getStatusVariant(status: Invoice['status']): 'draft' | 'sent' | 'paid' {
		return status;
	}
</script>

{#if loading}
	<div class="text-center py-12">
		<p class="font-mono text-text-secondary">Loading invoice...</p>
	</div>
{:else if invoice}
	<div class="max-w-4xl">
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-3xl font-mono text-accent-teal mb-2">
					{invoice.invoiceNumber}()
				</h1>
				<Badge variant={getStatusVariant(invoice.status)} class="text-base">
					{invoice.status.toUpperCase()}
				</Badge>
			</div>

			<div class="flex gap-3">
				<Button onclick={() => goto('/invoices')} variant="ghost">← Back</Button>
				{#if invoice.status === 'draft'}
					<Button variant="primary">Send Invoice</Button>
				{:else if invoice.status === 'sent'}
					<Button onclick={markAsPaid} variant="primary">Mark as Paid</Button>
				{/if}
				<Button onclick={handleDownloadPDF} disabled={downloadingPDF} variant="secondary">
					{downloadingPDF ? 'Generating...' : 'Download PDF'}
				</Button>
			</div>
		</div>

		<div class="space-y-6">
			<!-- Invoice Details -->
			<Card title="/* Invoice Information */">
				<div class="grid grid-cols-2 gap-6">
					<div>
						<p class="text-sm font-mono text-text-secondary mb-1">Invoice Date:</p>
						<p class="text-text-primary">{formatDate(invoice.date)}</p>
					</div>

					<div>
						<p class="text-sm font-mono text-text-secondary mb-1">Due Date:</p>
						<p class="text-text-primary">{formatDate(invoice.dueDate)}</p>
					</div>

					{#if invoice.sentAt}
						<div>
							<p class="text-sm font-mono text-text-secondary mb-1">Sent:</p>
							<p class="text-text-primary">{formatDate(invoice.sentAt)}</p>
						</div>
					{/if}

					{#if invoice.paidAt}
						<div>
							<p class="text-sm font-mono text-text-secondary mb-1">Paid:</p>
							<p class="text-text-primary">{formatDate(invoice.paidAt)}</p>
						</div>
					{/if}
				</div>
			</Card>

			<!-- Client Info -->
			<Card title="/* Billed To */">
				<div>
					<p class="font-mono text-accent-teal text-lg mb-2">{invoice.clientSnapshot.name}</p>
					<p class="text-text-secondary text-sm">{invoice.clientSnapshot.email}</p>
					<p class="text-text-secondary text-sm">{invoice.clientSnapshot.address}</p>
					{#if invoice.clientSnapshot.phone}
						<p class="text-text-secondary text-sm">{invoice.clientSnapshot.phone}</p>
					{/if}
				</div>
			</Card>

			<!-- Line Items -->
			<Card title="/* Line Items */">
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b border-text-secondary/30">
								<th class="text-left font-mono text-sm text-text-secondary py-2">Description</th>
								<th class="text-right font-mono text-sm text-text-secondary py-2">Qty</th>
								<th class="text-right font-mono text-sm text-text-secondary py-2">Rate</th>
								<th class="text-right font-mono text-sm text-text-secondary py-2">Amount</th>
							</tr>
						</thead>
						<tbody>
							{#each invoice.lineItems as item}
								<tr class="border-b border-text-secondary/10">
									<td class="py-3 text-text-primary">{item.description}</td>
									<td class="py-3 text-right font-mono text-text-primary">{item.quantity}</td>
									<td class="py-3 text-right font-mono text-text-primary">
										{formatCurrency(item.rate)}
									</td>
									<td class="py-3 text-right font-mono text-text-primary">
										{formatCurrency(item.amount)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="mt-6 pt-6 border-t border-text-secondary/30">
					<div class="max-w-sm ml-auto space-y-2">
						<div class="flex justify-between font-mono text-sm">
							<span class="text-text-secondary">Subtotal:</span>
							<span class="text-text-primary">{formatCurrency(invoice.subtotal)}</span>
						</div>

						<div class="flex justify-between font-mono text-sm">
							<span class="text-text-secondary">Tax ({invoice.taxRate}%):</span>
							<span class="text-text-primary">{formatCurrency(invoice.taxAmount)}</span>
						</div>

						<div class="flex justify-between font-mono text-lg pt-2 border-t border-primary/30">
							<span class="text-accent-teal font-bold">Total:</span>
							<span class="text-accent-teal font-bold">{formatCurrency(invoice.total)}</span>
						</div>
					</div>
				</div>
			</Card>

			<!-- Notes -->
			{#if invoice.notes}
				<Card title="/* Notes */">
					<p class="text-text-secondary whitespace-pre-wrap">{invoice.notes}</p>
				</Card>
			{/if}
		</div>
	</div>
{/if}
