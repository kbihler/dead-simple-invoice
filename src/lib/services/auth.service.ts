import {
	signInWithPopup,
	signOut as firebaseSignOut,
	GoogleAuthProvider,
	onAuthStateChanged,
	type User
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

// Add required scopes for Gmail API
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

export async function signInWithGoogle() {
	try {
		const result = await signInWithPopup(auth, googleProvider);

		// Get the OAuth access token for Gmail API
		const credential = GoogleAuthProvider.credentialFromResult(result);
		const accessToken = credential?.accessToken;

		// Store the access token for later use with Gmail API
		if (accessToken) {
			sessionStorage.setItem('gmail_access_token', accessToken);
		}

		return result.user;
	} catch (error) {
		console.error('Error signing in with Google:', error);
		throw error;
	}
}

export async function signOut() {
	try {
		await firebaseSignOut(auth);
		sessionStorage.removeItem('gmail_access_token');
	} catch (error) {
		console.error('Error signing out:', error);
		throw error;
	}
}

export function onAuthChange(callback: (user: User | null) => void) {
	return onAuthStateChanged(auth, callback);
}
