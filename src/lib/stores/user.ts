import { writable } from 'svelte/store';
import type { User } from '$lib/types/user';

export const userProfile = writable<User | null>(null);
export const userLoading = writable<boolean>(true);
