<script lang="ts">
	type BadgeVariant = 'draft' | 'sent' | 'paid' | 'overdue' | 'default';

	let {
		variant = 'default',
		class: className = '',
		children
	}: {
		variant?: BadgeVariant;
		class?: string;
		children: any;
	} = $props();

	const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-medium';

	const variantStyles: Record<BadgeVariant, string> = {
		draft: 'bg-text-secondary/20 text-text-secondary border border-text-secondary/30',
		sent: 'bg-primary/20 text-primary border border-primary/30',
		paid: 'bg-accent-green/20 text-accent-green border border-accent-green/30',
		overdue: 'bg-error/20 text-error border border-error/30',
		default: 'bg-surface text-text-primary border border-text-secondary/30'
	};

	const classes = `${baseStyles} ${variantStyles[variant]} ${className}`;
</script>

<span class={classes}>
	{@render children()}
</span>
