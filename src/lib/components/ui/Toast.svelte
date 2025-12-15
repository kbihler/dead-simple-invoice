<script lang="ts">
	import { toasts, type Toast } from '$lib/stores/toast';
	import { fly } from 'svelte/transition';

	let toastList = $state<Toast[]>([]);

	toasts.subscribe((value) => {
		toastList = value;
	});

	function getToastStyles(type: Toast['type']): string {
		switch (type) {
			case 'success':
				return 'bg-accent-green/20 border-accent-green text-accent-green';
			case 'error':
				return 'bg-error/20 border-error text-error';
			case 'info':
			default:
				return 'bg-primary/20 border-primary text-primary';
		}
	}
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
	{#each toastList as toast (toast.id)}
		<div
			transition:fly={{ y: -20, duration: 300 }}
			class="flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm {getToastStyles(toast.type)}"
		>
			<div class="flex-1 font-mono text-sm">{toast.message}</div>
			<button
				onclick={() => toasts.dismiss(toast.id)}
				class="text-current hover:opacity-70 transition-opacity"
			>
				×
			</button>
		</div>
	{/each}
</div>
