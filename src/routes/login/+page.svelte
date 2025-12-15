<script lang="ts">
	import { goto } from '$app/navigation';
	import { signInWithGoogle } from '$lib/services/auth.service';
	import { getUserProfile, createUserProfile } from '$lib/services/user.service';
	import { toasts } from '$lib/stores/toast';
	import Button from '$lib/components/ui/Button.svelte';

	let loading = $state(false);

	async function handleGoogleSignIn() {
		loading = true;
		try {
			const user = await signInWithGoogle();

			// Check if user profile exists, if not create it
			const profile = await getUserProfile(user.uid);
			if (!profile) {
				await createUserProfile(user.uid, user.email || '', user.displayName || '');
				toasts.show('Welcome! Please complete your profile in Settings', 'info');
			} else {
				toasts.show('Signed in successfully', 'success');
			}

			goto('/');
		} catch (error: any) {
			console.error('Sign in error:', error);
			toasts.show(error.message || 'Failed to sign in', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-bg-primary">
	<div class="max-w-md w-full px-6">
		<div class="bg-surface border-2 border-primary/30 rounded-lg p-8 shadow-2xl">
			<div class="text-center mb-8">
				<h1 class="text-4xl font-mono text-accent-teal mb-2">
					Invoice<span class="text-primary">()</span>
				</h1>
				<p class="text-text-secondary font-mono text-sm">// Developer Invoice Generator</p>
			</div>

			<div class="mb-8">
				<pre class="text-xs text-accent-green leading-relaxed">
{`/* Welcome! */
function createInvoice() {
  const invoice = {
    generate: () => PDF,
    send: () => Email,
    track: () => Status
  };
  return invoice;
}`}
				</pre>
			</div>

			<div class="space-y-4">
				<Button
					variant="primary"
					size="lg"
					disabled={loading}
					onclick={handleGoogleSignIn}
					class="w-full"
				>
					{#if loading}
						<span>// Connecting...</span>
					{:else}
						<span>Sign in with Google</span>
					{/if}
				</Button>

				<p class="text-xs text-text-secondary text-center font-mono">
					Sign in to create and send professional invoices
				</p>
			</div>

			<div class="mt-8 pt-6 border-t border-text-secondary/20">
				<p class="text-xs text-text-secondary font-mono text-center">
					<span class="code-comment">// OAuth Scopes:</span><br />
					Gmail API • Profile • Email
				</p>
			</div>
		</div>
	</div>
</div>
