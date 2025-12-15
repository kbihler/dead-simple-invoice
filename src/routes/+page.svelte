<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authUser } from '$lib/stores/auth';
	import { getInvoices, getOverdueInvoices } from '$lib/services/invoice.service';
	import { formatCurrency } from '$lib/utils/calculations';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { Invoice } from '$lib/types/invoice';

	let user = $state<any>(null);
	let invoices = $state<Invoice[]>([]);
	let overdueInvoices = $state<Invoice[]>([]);
	let loading = $state(true);

	let totalOutstanding = $derived(
		invoices.filter((inv) => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0)
	);

	let totalPaidThisMonth = $derived(() => {
		const now = new Date();
		const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		return invoices
			.filter((inv) => {
				if (inv.status !== 'paid' || !inv.paidAt) return false;
				const paidDate = inv.paidAt.toDate ? inv.paidAt.toDate() : new Date(inv.paidAt);
				return paidDate >= firstDayOfMonth;
			})
			.reduce((sum, inv) => sum + inv.total, 0);
	});

	let draftCount = $derived(invoices.filter((inv) => inv.status === 'draft').length);
	let overdueCount = $derived(overdueInvoices.length);
	let recentInvoices = $derived(invoices.slice(0, 10));

	authUser.subscribe((value) => {
		user = value;
	});

	// Load data when user is available
	$effect(() => {
		if (user && loading) {
			loadData();
		}
	});

	async function loadData() {
		try {
			loading = true;
			const [allInvoices, overdue] = await Promise.all([
				getInvoices(user.uid),
				getOverdueInvoices(user.uid)
			]);

			invoices = allInvoices;
			overdueInvoices = overdue;
		} catch (error) {
			console.error('Error loading dashboard data:', error);
		} finally {
			loading = false;
		}
	}

	function formatDate(timestamp: any): string {
		if (!timestamp) return '';
		const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function getStatusVariant(status: Invoice['status']): 'draft' | 'sent' | 'paid' {
		return status;
	}
</script>

<div>
	<div class="mb-8">
		<h1 class="text-3xl font-mono text-accent-teal mb-2">Dashboard</h1>
		<p class="text-text-secondary font-mono text-sm code-comment">
			// Welcome back! Here's your invoice overview
		</p>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<p class="font-mono text-text-secondary">Loading dashboard...</p>
		</div>
	{:else}
		<div class="space-y-8">
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card class="border-primary/30">
					<div>
						<p class="text-sm font-mono text-text-secondary mb-2">/* Outstanding */</p>
						<p class="text-3xl font-mono text-accent-orange font-bold">
							{formatCurrency(totalOutstanding)}
						</p>
						<p class="text-xs text-text-secondary mt-1 font-mono">Unpaid invoices</p>
					</div>
				</Card>

				<Card class="border-accent-green/30">
					<div>
						<p class="text-sm font-mono text-text-secondary mb-2">/* Paid This Month */</p>
						<p class="text-3xl font-mono text-accent-green font-bold">
							{formatCurrency(totalPaidThisMonth)}
						</p>
						<p class="text-xs text-text-secondary mt-1 font-mono">Current month revenue</p>
					</div>
				</Card>

				<Card class="border-error/30">
					<div>
						<p class="text-sm font-mono text-text-secondary mb-2">/* Overdue */</p>
						<p class="text-3xl font-mono text-error font-bold">{overdueCount}</p>
						<p class="text-xs text-text-secondary mt-1 font-mono">Past due date</p>
					</div>
				</Card>

				<Card class="border-text-secondary/30">
					<div>
						<p class="text-sm font-mono text-text-secondary mb-2">/* Drafts */</p>
						<p class="text-3xl font-mono text-text-secondary font-bold">{draftCount}</p>
						<p class="text-xs text-text-secondary mt-1 font-mono">Unsent invoices</p>
					</div>
				</Card>
			</div>

			<!-- Quick Actions -->
			<Card title="/* Quick Actions */">
				<div class="flex flex-wrap gap-3">
					<Button onclick={() => goto('/invoices/new')} variant="primary">
						+ Create Invoice
					</Button>
					<Button onclick={() => goto('/clients')} variant="secondary">
						Manage Clients
					</Button>
					<Button onclick={() => goto('/settings')} variant="secondary">
						Settings
					</Button>
				</div>
			</Card>

			<!-- Recent Invoices -->
			<Card title="/* Recent Invoices */">
				{#if recentInvoices.length === 0}
					<div class="text-center py-8">
						<p class="text-text-secondary font-mono mb-4">No invoices yet</p>
						<Button onclick={() => goto('/invoices/new')} variant="primary"
							>Create Your First Invoice</Button
						>
					</div>
				{:else}
					<div class="space-y-3">
						{#each recentInvoices as invoice (invoice.id)}
							<div
								class="flex items-center justify-between p-3 bg-bg-secondary rounded hover:bg-surface transition-colors cursor-pointer"
								onclick={() => goto(`/invoices/${invoice.id}`)}
								role="button"
								tabindex="0"
							>
								<div class="flex-1">
									<div class="flex items-center gap-3 mb-1">
										<span class="font-mono text-accent-teal">{invoice.invoiceNumber}()</span>
										<Badge variant={getStatusVariant(invoice.status)}>
											{invoice.status.toUpperCase()}
										</Badge>
									</div>
									<p class="text-sm text-text-secondary">
										{invoice.clientSnapshot.name} • {formatDate(invoice.date)}
									</p>
								</div>

								<div class="text-right">
									<p class="font-mono text-accent-orange font-bold">
										{formatCurrency(invoice.total)}
									</p>
									<p class="text-xs text-text-secondary">Due: {formatDate(invoice.dueDate)}</p>
								</div>
							</div>
						{/each}
					</div>

					{#if invoices.length > 10}
						<div class="mt-4 text-center">
							<Button onclick={() => goto('/invoices')} variant="ghost" size="sm">
								View All Invoices →
							</Button>
						</div>
					{/if}
				{/if}
			</Card>

			<!-- Welcome Message -->
			{#if invoices.length === 0}
				<Card class="border-primary/30">
					<div class="font-mono text-sm text-accent-green leading-relaxed">
						<pre>
{`// Welcome to Invoice Generator!

function getStarted() {
  const steps = [
    "1. Set up your business info in Settings",
    "2. Add your clients",
    "3. Create and send invoices",
    "4. Track payments"
  ];

  return steps.map(step => console.log(step));
}

getStarted(); // Let's build something great!`}
            </pre>
					</div>
				</Card>
			{/if}
		</div>
	{/if}
</div>
