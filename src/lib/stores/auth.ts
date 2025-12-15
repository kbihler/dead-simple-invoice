import { writable } from 'svelte/store';
import type { User } from 'firebase/auth';
import { onAuthChange } from '$lib/services/auth.service';

export const authUser = writable<User | null | undefined>(undefined);
export const authLoading = writable<boolean>(true);

// Initialize auth state listener
if (typeof window !== 'undefined') {
	onAuthChange((user) => {
		authUser.set(user);
		authLoading.set(false);
	});
}
