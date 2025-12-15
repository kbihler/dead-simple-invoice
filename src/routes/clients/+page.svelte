<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authUser } from '$lib/stores/auth';
	import { getClients, createClient, updateClient, deleteClient } from '$lib/services/client.service';
	import { toasts } from '$lib/stores/toast';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { Client } from '$lib/types/client';

	let user = $state<any>(null);
	let clients = $state<Client[]>([]);
	let filteredClients = $state<Client[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');

	let showModal = $state(false);
	let editingClient: Client | null = $state(null);
	let modalMode: 'add' | 'edit' = $state('add');

	let formData = $state({
		name: '',
		email: '',
		address: '',
		phone: '',
		notes: ''
	});

	let showDeleteConfirm = $state(false);
	let deletingClient: Client | null = $state(null);

	authUser.subscribe((value) => {
		user = value;
	});

	// Load clients when user is available
	$effect(() => {
		if (user && loading) {
			loadClients();
		}
	});

	$effect(() => {
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filteredClients = clients.filter(
				(client) =>
					client.name.toLowerCase().includes(query) || client.email.toLowerCase().includes(query)
			);
		} else {
			filteredClients = clients;
		}
	});

	async function loadClients() {
		try {
			loading = true;
			clients = await getClients(user.uid);
			filteredClients = clients;
		} catch (error) {
			toasts.show('Error loading clients', 'error');
		} finally {
			loading = false;
		}
	}

	function openAddModal() {
		modalMode = 'add';
		editingClient = null;
		formData = {
			name: '',
			email: '',
			address: '',
			phone: '',
			notes: ''
		};
		showModal = true;
	}

	function openEditModal(client: Client) {
		modalMode = 'edit';
		editingClient = client;
		formData = {
			name: client.name,
			email: client.email,
			address: client.address,
			phone: client.phone || '',
			notes: client.notes || ''
		};
		showModal = true;
	}

	async function handleSubmit() {
		if (!formData.name || !formData.email || !formData.address) {
			toasts.show('Please fill in all required fields', 'error');
			return;
		}

		try {
			if (modalMode === 'add') {
				await createClient(user.uid, formData);
				toasts.show('Client created successfully', 'success');
			} else if (editingClient) {
				await updateClient(user.uid, editingClient.id, formData);
				toasts.show('Client updated successfully', 'success');
			}

			showModal = false;
			await loadClients();
		} catch (error) {
			toasts.show('Error saving client', 'error');
		}
	}

	function openDeleteConfirm(client: Client) {
		deletingClient = client;
		showDeleteConfirm = true;
	}

	async function handleDelete() {
		if (!deletingClient) return;

		try {
			await deleteClient(user.uid, deletingClient.id);
			toasts.show('Client deleted successfully', 'success');
			showDeleteConfirm = false;
			deletingClient = null;
			await loadClients();
		} catch (error: any) {
			toasts.show(error.message || 'Error deleting client', 'error');
		}
	}

	function createInvoiceForClient(clientId: string) {
		goto(`/invoices/new?clientId=${clientId}`);
	}
</script>

<div>
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-mono text-accent-teal mb-2">Clients</h1>
			<p class="text-text-secondary font-mono text-sm code-comment">// Manage your client contacts</p>
		</div>
		<Button onclick={openAddModal} variant="primary">+ Add Client</Button>
	</div>

	<!-- Search -->
	<div class="mb-6">
		<Input bind:value={searchQuery} placeholder="Search by name or email..." />
	</div>

	{#if loading}
		<div class="text-center py-12">
			<p class="font-mono text-text-secondary">Loading clients...</p>
		</div>
	{:else if filteredClients.length === 0}
		<div class="text-center py-12">
			<p class="font-mono text-text-secondary mb-4">
				{searchQuery ? 'No clients found matching your search' : 'No clients yet'}
			</p>
			{#if !searchQuery}
				<Button onclick={openAddModal} variant="primary">Add Your First Client</Button>
			{/if}
		</div>
	{:else}
		<div class="grid gap-4">
			{#each filteredClients as client (client.id)}
				<Card class="hover:border-primary/40 transition-colors">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<h3 class="text-lg font-mono text-accent-teal mb-2">{client.name}</h3>

							<div class="space-y-1 text-sm text-text-secondary font-mono">
								<p>📧 {client.email}</p>
								<p>📍 {client.address}</p>
								{#if client.phone}
									<p>📞 {client.phone}</p>
								{/if}
								{#if client.notes}
									<p class="mt-2 text-xs italic code-comment">/* {client.notes} */</p>
								{/if}
							</div>
						</div>

						<div class="flex gap-2">
							<Button onclick={() => createInvoiceForClient(client.id)} variant="primary" size="sm">
								Create Invoice
							</Button>
							<Button onclick={() => openEditModal(client)} variant="secondary" size="sm">Edit</Button>
							<Button onclick={() => openDeleteConfirm(client)} variant="danger" size="sm">Delete</Button>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<!-- Add/Edit Modal -->
<Modal bind:open={showModal} title={modalMode === 'add' ? 'Add Client' : 'Edit Client'}>
	<div class="space-y-4">
		<Input bind:value={formData.name} label="Name" placeholder="John Doe" required />

		<Input
			bind:value={formData.email}
			type="email"
			label="Email"
			placeholder="john@example.com"
			required
		/>

		<Input
			bind:value={formData.address}
			type="textarea"
			label="Address"
			placeholder="123 Main St, City, State 12345"
			required
			rows={3}
		/>

		<Input bind:value={formData.phone} type="tel" label="Phone" placeholder="+1 (555) 123-4567" />

		<Input bind:value={formData.notes} type="textarea" label="Notes (Optional)" rows={2} />

		<div class="flex gap-3 pt-4">
			<Button onclick={handleSubmit} variant="primary" class="flex-1">
				{modalMode === 'add' ? 'Create Client' : 'Save Changes'}
			</Button>
			<Button onclick={() => (showModal = false)} variant="ghost">Cancel</Button>
		</div>
	</div>
</Modal>

<!-- Delete Confirmation Modal -->
<Modal bind:open={showDeleteConfirm} title="Delete Client">
	<div class="space-y-4">
		<p class="text-text-secondary">
			Are you sure you want to delete <span class="text-accent-teal font-mono"
				>{deletingClient?.name}</span
			>?
		</p>
		<p class="text-sm text-text-secondary code-comment">
			// This action cannot be undone. Clients with existing invoices cannot be deleted.
		</p>

		<div class="flex gap-3 pt-4">
			<Button onclick={handleDelete} variant="danger" class="flex-1">Delete Client</Button>
			<Button onclick={() => (showDeleteConfirm = false)} variant="ghost">Cancel</Button>
		</div>
	</div>
</Modal>
