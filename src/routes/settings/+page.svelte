<script lang="ts">
	import { onMount } from 'svelte';
	import { authUser } from '$lib/stores/auth';
	import { getUserProfile, updateBusinessInfo, updateSettings } from '$lib/services/user.service';
	import { uploadLogo } from '$lib/services/storage.service';
	import { toasts } from '$lib/stores/toast';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { BusinessInfo, UserSettings } from '$lib/types/user';

	let user = $state<any>(null);
	let businessInfo = $state<BusinessInfo>({
		name: '',
		address: '',
		phone: '',
		email: '',
		logoUrl: '',
		taxId: ''
	});

	let settings = $state<UserSettings>({
		defaultTaxRate: 0,
		invoicePrefix: 'INV',
		invoiceStartNumber: 1
	});

	let loading = $state(true);
	let saving = $state(false);
	let uploading = $state(false);
	let logoPreview = $state<string>('');

	authUser.subscribe((value) => {
		user = value;
	});

	// Load profile when user is available
	$effect(() => {
		if (user && loading) {
			loadUserProfile();
		}
	});

	async function loadUserProfile() {
		try {
			console.log('Loading user profile for:', user.uid);
			const profile = await getUserProfile(user.uid);
			console.log('Profile loaded:', profile);

			if (profile) {
				// Ensure all optional fields have default values to prevent undefined bindings
				businessInfo = {
					name: profile.businessInfo.name || '',
					address: profile.businessInfo.address || '',
					phone: profile.businessInfo.phone || '',
					email: profile.businessInfo.email || '',
					logoUrl: profile.businessInfo.logoUrl || '',
					taxId: profile.businessInfo.taxId || ''
				};
				settings = { ...profile.settings };
				logoPreview = profile.businessInfo.logoUrl || '';
			} else {
				console.log('No profile found, using defaults');
			}
		} catch (error) {
			console.error('Error loading profile:', error);
			toasts.show('Error loading profile', 'error');
		} finally {
			loading = false;
			console.log('Loading complete');
		}
	}

	async function handleLogoUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toasts.show('Please upload an image file', 'error');
			return;
		}

		// Validate file size (5MB)
		if (file.size > 5 * 1024 * 1024) {
			toasts.show('File size must be less than 5MB', 'error');
			return;
		}

		try {
			uploading = true;

			// Show preview
			const reader = new FileReader();
			reader.onload = (e) => {
				logoPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);

			// Upload to Firebase Storage
			const logoUrl = await uploadLogo(user.uid, file);
			businessInfo.logoUrl = logoUrl;

			toasts.show('Logo uploaded successfully', 'success');
		} catch (error) {
			toasts.show('Error uploading logo', 'error');
			logoPreview = businessInfo.logoUrl || '';
		} finally {
			uploading = false;
		}
	}

	async function handleSaveBusinessInfo() {
		try {
			saving = true;
			await updateBusinessInfo(user.uid, businessInfo);
			toasts.show('Business information saved', 'success');
		} catch (error) {
			toasts.show('Error saving business information', 'error');
		} finally {
			saving = false;
		}
	}

	async function handleSaveSettings() {
		try {
			saving = true;
			await updateSettings(user.uid, settings);
			toasts.show('Settings saved', 'success');
		} catch (error) {
			toasts.show('Error saving settings', 'error');
		} finally {
			saving = false;
		}
	}
</script>

<div class="max-w-4xl">
	<div class="mb-8">
		<h1 class="text-3xl font-mono text-accent-teal mb-2">Settings</h1>
		<p class="text-text-secondary font-mono text-sm code-comment">
			// Configure your business information and preferences
		</p>
	</div>

	{#if loading}
		<div class="text-center py-12">
			<p class="font-mono text-text-secondary">Loading settings...</p>
		</div>
	{:else}
		<div class="space-y-6">
			<!-- Business Information -->
			<Card title="/* Business Information */">
				<div class="space-y-4">
					<Input bind:value={businessInfo.name} label="Business Name" placeholder="Acme Corp" required />

					<Input
						bind:value={businessInfo.email}
						type="email"
						label="Business Email"
						placeholder="contact@example.com"
						required
					/>

					<Input
						bind:value={businessInfo.address}
						type="textarea"
						label="Address"
						placeholder="123 Main St, City, State 12345"
						required
						rows={3}
					/>

					<div class="grid grid-cols-2 gap-4">
						<Input
							bind:value={businessInfo.phone}
							type="tel"
							label="Phone"
							placeholder="+1 (555) 123-4567"
							required
						/>

						<Input bind:value={businessInfo.taxId} label="Tax ID (Optional)" placeholder="12-3456789" />
					</div>

					<!-- Logo Upload -->
					<div>
						<label class="text-sm font-mono text-text-secondary mb-2 block">
							<span class="code-comment">// Business Logo</span>
						</label>

						<div class="flex items-start gap-4">
							{#if logoPreview}
								<div class="w-32 h-32 bg-bg-primary border border-text-secondary/30 rounded flex items-center justify-center p-2">
									<img src={logoPreview} alt="Logo preview" class="max-w-full max-h-full object-contain" />
								</div>
							{:else}
								<div class="w-32 h-32 bg-bg-primary border border-text-secondary/30 rounded flex items-center justify-center">
									<span class="text-text-secondary text-sm">No logo</span>
								</div>
							{/if}

							<div class="flex-1">
								<input
									type="file"
									accept="image/*"
									onchange={handleLogoUpload}
									disabled={uploading}
									class="hidden"
									id="logo-upload"
								/>
								<label for="logo-upload">
									<Button variant="secondary" disabled={uploading} class="cursor-pointer">
										{uploading ? 'Uploading...' : 'Upload Logo'}
									</Button>
								</label>
								<p class="text-xs text-text-secondary mt-2">
									PNG, JPG, or GIF. Max 5MB. Recommended: 150x75px
								</p>
							</div>
						</div>
					</div>

					<div class="pt-4">
						<Button onclick={handleSaveBusinessInfo} disabled={saving} variant="primary">
							{saving ? 'Saving...' : 'Save Business Info'}
						</Button>
					</div>
				</div>
			</Card>

			<!-- Invoice Settings -->
			<Card title="/* Invoice Settings */">
				<div class="space-y-4">
					<Input
						bind:value={settings.defaultTaxRate}
						type="number"
						label="Default Tax Rate (%)"
						placeholder="10"
					/>

					<div class="grid grid-cols-2 gap-4">
						<Input
							bind:value={settings.invoicePrefix}
							label="Invoice Prefix"
							placeholder="INV"
							required
						/>

						<Input
							bind:value={settings.invoiceStartNumber}
							type="number"
							label="Starting Invoice Number"
							placeholder="1"
							required
						/>
					</div>

					<div class="bg-bg-primary border border-text-secondary/30 rounded p-4">
						<p class="text-sm font-mono text-text-secondary mb-2">Preview:</p>
						<p class="font-mono text-accent-teal">
							{settings.invoicePrefix}-{new Date().getFullYear()}-{String(settings.invoiceStartNumber).padStart(3, '0')}()
						</p>
					</div>

					<div class="pt-4">
						<Button onclick={handleSaveSettings} disabled={saving} variant="primary">
							{saving ? 'Saving...' : 'Save Settings'}
						</Button>
					</div>
				</div>
			</Card>
		</div>
	{/if}
</div>
