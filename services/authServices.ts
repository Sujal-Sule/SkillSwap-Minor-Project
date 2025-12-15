// src/services/authService.ts
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getAuthInstance, getGoogleProvider } from '../firebaseConfig';

import { api } from './api';

export async function verifyTokenWithBackend(idToken: string) {
    const backendRes = await api.post('/auth/login', { idToken });
    const user = backendRes.user;
    return {
        ...user,
        id: user._id || user.id
    };
}

export async function signInWithGooglePopup() {
    const auth = getAuthInstance();
    const provider = getGoogleProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    const user = await verifyTokenWithBackend(idToken);

    // We return consistent structure
    return { result, idToken, user };
}

export async function registerWithEmailAndPassword(email: string, password: string, displayName?: string) {
    const auth = getAuthInstance();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
        await updateProfile(userCredential.user, { displayName });
    }
    const idToken = await userCredential.user.getIdToken();

    const user = await verifyTokenWithBackend(idToken);

    return { user, idToken };
}

export async function loginWithEmailAndPasswordService(email: string, password: string) {
    const auth = getAuthInstance();
    try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await cred.user.getIdToken();
        const user = await verifyTokenWithBackend(idToken);
        return { user, idToken };
    } catch (firebaseError) {
        // Fallback to custom backend auth (for Admin or special users not in Firebase)
        console.warn("Firebase auth failed, trying custom backend auth...", firebaseError);
        try {
            const backendRes = await api.post('/auth/login', { email, password });
            console.log("Custom backend auth success", backendRes);
            return {
                user: {
                    ...backendRes.user,
                    id: backendRes.user._id || backendRes.user.id
                },
                idToken: backendRes.token
            };
        } catch (backendError) {
            throw firebaseError; // Throw original error if both fail, or maybe the backend error?
            // Throwing backend error might be more informative if it was a credential issue.
            // But usually firebase error is "user-not-found".
            throw backendError;
        }
    }
}
