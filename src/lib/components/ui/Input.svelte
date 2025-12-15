<script lang="ts">
	type InputType = 'text' | 'email' | 'number' | 'tel' | 'date' | 'textarea';

	let {
		type = 'text',
		value = $bindable(''),
		label = '',
		placeholder = '',
		required = false,
		disabled = false,
		error = '',
		class: className = '',
		rows = 3
	}: {
		type?: InputType;
		value?: string | number;
		label?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		class?: string;
		rows?: number;
	} = $props();

	const baseStyles =
		'w-full bg-bg-secondary border text-text-primary px-3 py-2 rounded focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sans';

	const errorStyles = error ? 'border-error focus:ring-error' : 'border-text-secondary focus:ring-primary focus:border-primary';

	const classes = `${baseStyles} ${errorStyles} ${className}`;
</script>

<div class="flex flex-col gap-1.5">
	{#if label}
		<label class="text-sm font-mono text-text-secondary">
			<span class="code-comment">// {label}</span>
			{#if required}
				<span class="text-error">*</span>
			{/if}
		</label>
	{/if}

	{#if type === 'textarea'}
		<textarea bind:value {placeholder} {required} {disabled} {rows} class={classes}></textarea>
	{:else}
		<input {type} bind:value {placeholder} {required} {disabled} class={classes} />
	{/if}

	{#if error}
		<span class="text-error text-sm font-mono">{error}</span>
	{/if}
</div>
