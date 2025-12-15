<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import Button from './Button.svelte';

	let {
		open = $bindable(false),
		title = '',
		onclose,
		children
	}: {
		open?: boolean;
		title?: string;
		onclose?: () => void;
		children: any;
	} = $props();

	function handleClose() {
		open = false;
		onclose?.();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		transition:fade={{ duration: 200 }}
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
	>
		<div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

		<div
			class="relative bg-bg-secondary border-2 border-primary/30 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			{#if title}
				<div class="flex items-center justify-between p-6 border-b border-text-secondary/20">
					<h2 class="text-xl font-mono text-accent-teal">{title}</h2>
					<button
						onclick={handleClose}
						class="text-text-secondary hover:text-text-primary transition-colors text-2xl leading-none"
					>
						×
					</button>
				</div>
			{/if}

			<div class="p-6">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
