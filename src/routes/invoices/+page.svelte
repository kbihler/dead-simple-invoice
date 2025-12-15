<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authUser } from '$lib/stores/auth';
	import { getInvoices, updateInvoiceStatus } from '$lib/services/invoice.service';
	import { toasts } from '$lib/stores/toast';
	import { formatCurrency } from '$lib/utils/calculations';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { Invoice, InvoiceStatus } from '$lib/types/invoice';

	let user = $state<any>(null);
	let invoices = $state<Invoice[]>([]);
	let filteredInvoices = $state<Invoice[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let statusFilter = $state<InvoiceStatus | 'all'>('all');

	authUser.subscribe((value) => {
		user = value;
	});

	// Load invoices when user is available
	$effect(() => {
		if (user && loading) {
			loadInvoices();
		}
	});

	$effect(() => {
		let filtered = invoices;

		if (statusFilter !== 'all') {
			filtered = filtered.filter((inv) => inv.status === statusFilter);
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(inv) =>
					inv.invoiceNumber.toLowerCase().includes(query) ||
					inv.clientSnapshot.name.toLowerCase().includes(query)
			);
		}

		filteredInvoices = filtered;
	});

	async function loadInvoices() {
		try {
			loading = true;
			invoices = await getInvoices(user.uid);
			filteredInvoices = invoices;
		} catch (error) {
			toasts.show('Error loading invoices', 'error');
		} finally {
			loading = false;
		}
	}

	async function markAsPaid(invoiceId: string) {
		try {
			await updateInvoiceStatus(user.uid, invoiceId, 'paid');
			toasts.show('Invoice marked as paid', 'success');
			await loadInvoices();
		} catch (error) {
			toasts.show('Error updating invoice', 'error');
		}
	}

	function formatDate(timestamp: any): string {
		if (!timestamp) return '';
		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function getStatusVariant(status: InvoiceStatus): 'draft' | 'sent' | 'paid' {
		return status;
	}
</script>

<div>
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-mono text-accent-teal mb-2">Invoices</h1>
			<p class="text-text-secondary font-mono text-sm code-comment">
				// View and manage all invoices
			</p>
		</div>
		<Button onclick={() => goto('/invoices/new')} variant="primary">+ New Invoice</Button>
	</div>

	<!-- Filters -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
		<div class="md:col-span-3">
			<Input bind:value={searchQuery} placeholder="Search by invoice # or client name..." />
		</div>

		<div>
			<select
				bind:value={statusFilter}
				class="w-full bg-bg-secondary border border-text-secondary text-text-primary px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
			>
				<option value="all">All Statuses</option>
				<option value="draft">Draft</option>
				<option value="sent">Sent</option>
				<option value="paid">Paid</option>
			</select>
		</div>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<p class="font-mono text-text-secondary">Loading invoices...</p>
		</div>
	{:else if filteredInvoices.length === 0}
		<div class="text-center py-12">
			<p class="font-mono text-text-secondary mb-4">
				{searchQuery || statusFilter !== 'all' ? 'No invoices found' : 'No invoices yet'}
			</p>
			{#if !searchQuery && statusFilter === 'all'}
				<Button onclick={() => goto('/invoices/new')} variant="primary"
					>Create Your First Invoice</Button
				>
			{/if}
		</div>
	{:else}
		<div class="grid gap-4">
			{#each filteredInvoices as invoice (invoice.id)}
				<Card class="hover:border-primary/40 transition-colors">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-3">
								<h3 class="text-lg font-mono text-accent-teal">
									{invoice.invoiceNumber}()
								</h3>
								<Badge variant={getStatusVariant(invoice.status)}>
									{invoice.status.toUpperCase()}
								</Badge>
							</div>

							<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
								<div>
									<p class="text-text-secondary font-mono mb-1">Client:</p>
									<p class="text-text-primary">{invoice.clientSnapshot.name}</p>
								</div>

								<div>
									<p class="text-text-secondary font-mono mb-1">Date:</p>
									<p class="text-text-primary">{formatDate(invoice.date)}</p>
									<p class="text-text-secondary text-xs">Due: {formatDate(invoice.dueDate)}</p>
								</div>

								<div>
									<p class="text-text-secondary font-mono mb-1">Amount:</p>
									<p class="text-accent-orange text-lg font-bold">{formatCurrency(invoice.total)}</p>
								</div>
							</div>
						</div>

						<div class="flex flex-col gap-2 ml-4">
							<Button onclick={() => goto(`/invoices/${invoice.id}`)} variant="primary" size="sm">
								View
							</Button>
							{#if invoice.status === 'sent'}
								<Button onclick={() => markAsPaid(invoice.id)} variant="secondary" size="sm">
									Mark Paid
								</Button>
							{/if}
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>
