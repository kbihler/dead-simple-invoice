<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authUser } from '$lib/stores/auth';
	import { getUserProfile } from '$lib/services/user.service';
	import { getClients } from '$lib/services/client.service';
	import { createInvoice } from '$lib/services/invoice.service';
	import { toasts } from '$lib/stores/toast';
	import {
		calculateLineItemAmount,
		calculateSubtotal,
		calculateTaxAmount,
		calculateTotal,
		formatCurrency,
		roundToTwo
	} from '$lib/utils/calculations';
	import { Timestamp } from 'firebase/firestore';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { Client } from '$lib/types/client';
	import type { LineItem } from '$lib/types/invoice';

	let user = $state<any>(null);
	let clients = $state<Client[]>([]);
	let loading = $state(true);
	let saving = $state(false);

	let selectedClientId = $state('');
	let invoiceDate = $state(new Date().toISOString().split('T')[0]);
	let dueDate = $state(
		new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
	);
	let lineItems = $state<LineItem[]>([
		{ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 }
	]);
	let taxRate = $state(0);
	let notes = $state('');

	let subtotal = $derived(calculateSubtotal(lineItems));
	let taxAmount = $derived(roundToTwo(calculateTaxAmount(subtotal, taxRate)));
	let total = $derived(roundToTwo(calculateTotal(subtotal, taxAmount)));

	authUser.subscribe((value) => {
		user = value;
	});

	// Load data when user is available
	$effect(() => {
		if (user && loading) {
			loadData();
		}
	});

	// Handle clientId from URL
	$effect(() => {
		if (user && !loading) {
			const urlClientId = $page.url.searchParams.get('clientId');
			if (urlClientId) {
				selectedClientId = urlClientId;
			}
		}
	});

	async function loadData() {
		try {
			loading = true;
			const [userProfile, clientsList] = await Promise.all([
				getUserProfile(user.uid),
				getClients(user.uid)
			]);

			clients = clientsList;

			if (userProfile) {
				taxRate = userProfile.settings.defaultTaxRate;
			}
		} catch (error) {
			toasts.show('Error loading data', 'error');
		} finally {
			loading = false;
		}
	}

	function addLineItem() {
		lineItems = [
			...lineItems,
			{ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 }
		];
	}

	function removeLineItem(id: string) {
		if (lineItems.length > 1) {
			lineItems = lineItems.filter((item) => item.id !== id);
		}
	}

	function updateLineItem(id: string, field: keyof LineItem, value: any) {
		lineItems = lineItems.map((item) => {
			if (item.id === id) {
				const updated = { ...item, [field]: value };
				if (field === 'quantity' || field === 'rate') {
					updated.amount = roundToTwo(calculateLineItemAmount(updated.quantity, updated.rate));
				}
				return updated;
			}
			return item;
		});
	}

	async function handleSave(asDraft: boolean) {
		if (!selectedClientId) {
			toasts.show('Please select a client', 'error');
			return;
		}

		if (lineItems.length === 0 || lineItems.some((item) => !item.description)) {
			toasts.show('Please add at least one line item with a description', 'error');
			return;
		}

		if (new Date(dueDate) < new Date(invoiceDate)) {
			toasts.show('Due date cannot be before invoice date', 'error');
			return;
		}

		try {
			saving = true;

			const selectedClient = clients.find((c) => c.id === selectedClientId);
			if (!selectedClient) {
				throw new Error('Selected client not found');
			}

			const userProfile = await getUserProfile(user.uid);
			if (!userProfile) {
				throw new Error('User profile not found');
			}

			const invoice = {
				clientId: selectedClientId,
				clientSnapshot: {
					name: selectedClient.name,
					email: selectedClient.email,
					address: selectedClient.address,
					phone: selectedClient.phone
				},
				date: Timestamp.fromDate(new Date(invoiceDate)),
				dueDate: Timestamp.fromDate(new Date(dueDate)),
				lineItems: lineItems.map((item) => ({
					id: item.id,
					description: item.description,
					quantity: item.quantity,
					rate: item.rate,
					amount: item.amount
				})),
				subtotal,
				taxRate,
				taxAmount,
				total,
				status: (asDraft ? 'draft' : 'sent') as 'draft' | 'sent',
				notes
			};

			const invoiceId = await createInvoice(user.uid, invoice, userProfile.settings.invoicePrefix);

			toasts.show(
				asDraft ? 'Invoice saved as draft' : 'Invoice created successfully',
				'success'
			);

			goto(`/invoices/${invoiceId}`);
		} catch (error: any) {
			toasts.show(error.message || 'Error saving invoice', 'error');
		} finally {
			saving = false;
		}
	}
</script>

<div class="max-w-5xl">
	<div class="mb-8">
		<h1 class="text-3xl font-mono text-accent-teal mb-2">Create Invoice</h1>
		<p class="text-text-secondary font-mono text-sm code-comment">
			// Generate a new invoice for your client
		</p>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<p class="font-mono text-text-secondary">Loading...</p>
		</div>
	{:else}
		<div class="space-y-6">
			<!-- Client and Dates -->
			<Card>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label class="text-sm font-mono text-text-secondary mb-2 block">
							<span class="code-comment">// Client</span>
							<span class="text-error">*</span>
						</label>
						<select
							bind:value={selectedClientId}
							class="w-full bg-bg-secondary border border-text-secondary text-text-primary px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
						>
							<option value="">Select a client</option>
							{#each clients as client}
								<option value={client.id}>{client.name}</option>
							{/each}
						</select>
					</div>

					<Input bind:value={invoiceDate} type="date" label="Invoice Date" required />

					<Input bind:value={dueDate} type="date" label="Due Date" required />
				</div>
			</Card>

			<!-- Line Items -->
			<Card title="/* Line Items */">
				<div class="space-y-3">
					<div class="hidden md:grid grid-cols-12 gap-2 text-sm font-mono text-text-secondary mb-2">
						<div class="col-span-5">Description</div>
						<div class="col-span-2 text-right">Quantity</div>
						<div class="col-span-2 text-right">Rate</div>
						<div class="col-span-2 text-right">Amount</div>
						<div class="col-span-1"></div>
					</div>

					{#each lineItems as item (item.id)}
						<div class="grid grid-cols-12 gap-2 items-start">
							<div class="col-span-12 md:col-span-5">
								<input
									type="text"
									value={item.description}
									oninput={(e) => updateLineItem(item.id, 'description', e.currentTarget.value)}
									placeholder="Description"
									class="w-full bg-bg-secondary border border-text-secondary text-text-primary px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>

							<div class="col-span-4 md:col-span-2">
								<input
									type="number"
									value={item.quantity}
									oninput={(e) =>
										updateLineItem(item.id, 'quantity', parseFloat(e.currentTarget.value) || 0)}
									min="0"
									step="0.01"
									class="w-full bg-bg-secondary border border-text-secondary text-text-primary px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary text-right"
								/>
							</div>

							<div class="col-span-4 md:col-span-2">
								<input
									type="number"
									value={item.rate}
									oninput={(e) =>
										updateLineItem(item.id, 'rate', parseFloat(e.currentTarget.value) || 0)}
									min="0"
									step="0.01"
									class="w-full bg-bg-secondary border border-text-secondary text-text-primary px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary text-right"
								/>
							</div>

							<div class="col-span-3 md:col-span-2">
								<div
									class="w-full bg-bg-primary border border-text-secondary/30 text-text-primary px-3 py-2 rounded text-right font-mono"
								>
									{formatCurrency(item.amount)}
								</div>
							</div>

							<div class="col-span-1 md:col-span-1 flex items-center justify-center">
								<button
									onclick={() => removeLineItem(item.id)}
									disabled={lineItems.length === 1}
									class="text-error hover:text-error/70 disabled:opacity-30 disabled:cursor-not-allowed text-xl"
								>
									×
								</button>
							</div>
						</div>
					{/each}

					<Button onclick={addLineItem} variant="secondary" size="sm">+ Add Line Item</Button>
				</div>

				<!-- Totals -->
				<div class="mt-6 pt-6 border-t border-text-secondary/20">
					<div class="max-w-sm ml-auto space-y-2">
						<div class="flex justify-between font-mono text-sm">
							<span class="text-text-secondary">Subtotal:</span>
							<span class="text-text-primary">{formatCurrency(subtotal)}</span>
						</div>

						<div class="flex justify-between items-center gap-4">
							<span class="text-text-secondary font-mono text-sm">Tax:</span>
							<div class="flex items-center gap-2">
								<input
									type="number"
									bind:value={taxRate}
									min="0"
									max="100"
									step="0.1"
									class="w-20 bg-bg-secondary border border-text-secondary text-text-primary px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary text-right text-sm"
								/>
								<span class="text-text-secondary text-sm">%</span>
								<span class="font-mono text-sm text-text-primary ml-2">{formatCurrency(taxAmount)}</span>
							</div>
						</div>

						<div class="flex justify-between font-mono text-lg pt-2 border-t border-primary/30">
							<span class="text-accent-teal">Total:</span>
							<span class="text-accent-teal font-bold">{formatCurrency(total)}</span>
						</div>
					</div>
				</div>
			</Card>

			<!-- Notes -->
			<Card title="/* Notes */">
				<Input bind:value={notes} type="textarea" placeholder="Additional notes or payment terms" rows={3} />
			</Card>

			<!-- Actions -->
			<div class="flex gap-4">
				<Button onclick={() => handleSave(true)} disabled={saving} variant="secondary" class="flex-1">
					Save as Draft
				</Button>
				<Button onclick={() => handleSave(false)} disabled={saving} variant="primary" class="flex-1">
					{saving ? 'Creating...' : 'Create Invoice'}
				</Button>
				<Button onclick={() => goto('/invoices')} variant="ghost">Cancel</Button>
			</div>
		</div>
	{/if}
</div>
