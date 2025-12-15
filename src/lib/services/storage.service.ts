import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadLogo(userId: string, file: File): Promise<string> {
	try {
		const fileExtension = file.name.split('.').pop();
		const fileName = `logo.${fileExtension}`;
		const storageRef = ref(storage, `users/${userId}/${fileName}`);

		await uploadBytes(storageRef, file);
		const downloadURL = await getDownloadURL(storageRef);

		return downloadURL;
	} catch (error) {
		console.error('Error uploading logo:', error);
		throw error;
	}
}

export async function deleteLogo(userId: string, logoUrl: string): Promise<void> {
	try {
		const fileName = logoUrl.split('/').pop()?.split('?')[0];
		if (fileName) {
			const storageRef = ref(storage, `users/${userId}/${fileName}`);
			await deleteObject(storageRef);
		}
	} catch (error) {
		console.error('Error deleting logo:', error);
		throw error;
	}
}
