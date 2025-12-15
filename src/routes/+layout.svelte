<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { authUser, authLoading } from '$lib/stores/auth';
	import { signOut } from '$lib/services/auth.service';
	import { getUserProfile, createUserProfile } from '$lib/services/user.service';
	import Toast from '$lib/components/ui/Toast.svelte';
	import { toasts } from '$lib/stores/toast';

	let user = $state<any>(null);
	let loading = $state(true);

	authUser.subscribe((value) => {
		user = value;
	});

	authLoading.subscribe((value) => {
		loading = value;
	});

	let isLoginPage = $derived($page.url.pathname === '/login');

	onMount(() => {
		const unsubscribe = authUser.subscribe(async (u) => {
			if (!loading && !u && !isLoginPage) {
				goto('/login');
			} else if (!loading && u && isLoginPage) {
				goto('/');
			} else if (!loading && u && !isLoginPage) {
				// Ensure user profile exists
				try {
					const profile = await getUserProfile(u.uid);
					if (!profile) {
						await createUserProfile(u.uid, u.email || '', u.displayName || '');
					}
				} catch (error) {
					console.error('Error checking user profile:', error);
				}
			}
		});

		return unsubscribe;
	});

	async function handleSignOut() {
		try {
			await signOut();
			toasts.show('Signed out successfully', 'success');
			goto('/login');
		} catch (error) {
			toasts.show('Error signing out', 'error');
		}
	}

	const navItems = [
		{ path: '/', label: 'Dashboard', icon: '💻' },
		{ path: '/invoices', label: 'Invoices', icon: '📄' },
		{ path: '/clients', label: 'Clients', icon: '👥' },
		{ path: '/settings', label: 'Settings', icon: '⚙️' }
	];
</script>

<Toast />

{#if loading}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<div class="text-4xl mb-4 font-mono text-primary">// Loading...</div>
			<div class="text-text-secondary">Initializing application</div>
		</div>
	</div>
{:else if isLoginPage}
	<slot />
{:else if user}
	<div class="flex min-h-screen">
		<!-- Sidebar Navigation -->
		<nav class="w-64 bg-bg-secondary border-r border-text-secondary/20 p-6 flex flex-col">
			<div class="mb-8">
				<h1 class="text-2xl font-mono text-accent-teal mb-1">Invoice<span class="text-primary">()</span></h1>
				<p class="text-xs text-text-secondary font-mono">// Generator v1.0</p>
			</div>

			<ul class="space-y-2 flex-1">
				{#each navItems as item}
					<li>
						<a
							href={item.path}
							class="flex items-center gap-3 px-4 py-2 rounded transition-all font-mono text-sm {$page.url
								.pathname === item.path
								? 'bg-primary/20 text-primary border-l-2 border-primary'
								: 'text-text-primary hover:bg-surface hover:text-accent-teal'}"
						>
							<span>{item.icon}</span>
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>

			<div class="border-t border-text-secondary/20 pt-4 mt-4">
				<div class="flex items-center gap-3 mb-3 px-2">
					<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
						{user.displayName?.[0]?.toUpperCase() || '?'}
					</div>
					<div class="flex-1 min-w-0">
						<div class="text-sm font-mono text-text-primary truncate">{user.displayName}</div>
						<div class="text-xs text-text-secondary truncate">{user.email}</div>
					</div>
				</div>
				<button
					onclick={handleSignOut}
					class="w-full px-4 py-2 text-sm font-mono text-text-secondary hover:text-error hover:bg-error/10 rounded transition-all"
				>
					Sign Out
				</button>
			</div>
		</nav>

		<!-- Main Content -->
		<main class="flex-1 p-8 overflow-y-auto">
			<slot />
		</main>
	</div>
{:else}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<p class="text-error font-mono">Authentication required</p>
		</div>
	</div>
{/if}
