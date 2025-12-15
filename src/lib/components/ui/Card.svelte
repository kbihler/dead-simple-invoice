<script lang="ts">
	let {
		title = '',
		class: className = '',
		children
	}: {
		title?: string;
		class?: string;
		children: any;
	} = $props();

	const classes = `bg-surface border border-text-secondary/20 rounded-lg p-6 shadow-lg ${className}`;
</script>

<div class={classes}>
	{#if title}
		<h3 class="text-lg font-mono text-accent-teal mb-4">{title}</h3>
	{/if}
	{@render children()}
</div>
