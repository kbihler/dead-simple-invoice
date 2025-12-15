<script lang="ts">
	type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
	type ButtonSize = 'sm' | 'md' | 'lg';

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		type = 'button',
		class: className = '',
		onclick,
		children
	}: {
		variant?: ButtonVariant;
		size?: ButtonSize;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children: any;
	} = $props();

	const baseStyles =
		'font-mono font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed terminal-effect';

	const variantStyles: Record<ButtonVariant, string> = {
		primary: 'bg-primary text-white hover:bg-primary/90 border border-primary',
		secondary: 'bg-surface text-text-primary hover:bg-surface/80 border border-text-secondary',
		danger: 'bg-error text-white hover:bg-error/90 border border-error',
		ghost: 'bg-transparent text-primary hover:bg-primary/10 border border-primary'
	};

	const sizeStyles: Record<ButtonSize, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-base',
		lg: 'px-6 py-3 text-lg'
	};

	const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
</script>

<button {type} {disabled} class={classes} {onclick}>
	{@render children()}
</button>
