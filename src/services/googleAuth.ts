import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithCredential,
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const OFFICIAL_DINAS_EMAIL = 'bidangpppanagekeo@gmail.com';

// Initialize Firebase App safely (singleton)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Sheets and Drive.file scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.setCustomParameters({
  login_hint: OFFICIAL_DINAS_EMAIL,
  prompt: 'select_account'
});

export interface GoogleAuthUser {
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
}

declare global {
  interface Window {
    google?: any;
  }
}

// In-memory token & user storage
let cachedAccessToken: string | null = null;
let cachedUser: GoogleAuthUser | null = null;
let isSigningIn = false;
const authListeners: Array<(user: GoogleAuthUser | null, token: string | null) => void> = [];

// Helper to notify all registered auth listeners
const notifyListeners = () => {
  authListeners.forEach((listener) => listener(cachedUser, cachedAccessToken));
};

export const isFirebaseOfficerSignedIn = (allowedEmail: string = OFFICIAL_DINAS_EMAIL): boolean => {
  const user = auth.currentUser;
  return Boolean(
    user &&
    user.email &&
    user.email.trim().toLowerCase() === allowedEmail.trim().toLowerCase() &&
    user.emailVerified
  );
};

// Dynamically load Google Identity Services script (fallback for custom domains)
const loadGisScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.getElementById('gis-client-script');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Gagal memuat Google Identity Services script.')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'gis-client-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Gagal memuat Google Identity Services script.'));
    document.head.appendChild(script);
  });
};

// Initialize Auth listener
export const initAuth = (
  onAuthSuccess?: (user: GoogleAuthUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  const listener = (user: GoogleAuthUser | null, token: string | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, token || '');
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  };
  authListeners.push(listener);

  // Immediately emit current Firebase user if already persisted in session
  if (auth.currentUser?.email) {
    cachedUser = {
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName || undefined,
      photoURL: auth.currentUser.photoURL || undefined,
      emailVerified: auth.currentUser.emailVerified
    };
    if (onAuthSuccess) onAuthSuccess(cachedUser, cachedAccessToken || '');
  } else if (cachedUser) {
    if (onAuthSuccess) onAuthSuccess(cachedUser, cachedAccessToken || '');
  }

  // Subscribe to Firebase Auth persistence (survives page reloads)
  const unsubscribeFb = onAuthStateChanged(auth, (fbUser) => {
    if (fbUser && fbUser.email) {
      cachedUser = {
        email: fbUser.email,
        displayName: fbUser.displayName || undefined,
        photoURL: fbUser.photoURL || undefined,
        emailVerified: fbUser.emailVerified
      };
      notifyListeners();
    } else if (!fbUser && !isSigningIn) {
      cachedAccessToken = null;
      cachedUser = null;
      notifyListeners();
    }
  });

  return () => {
    const idx = authListeners.indexOf(listener);
    if (idx !== -1) authListeners.splice(idx, 1);
    unsubscribeFb();
  };
};

// Sign in with Google (Firebase Auth Primary + GIS Credential Fallback for custom domains)
export const signInWithGoogle = async (): Promise<{ user: GoogleAuthUser; accessToken: string } | null> => {
  isSigningIn = true;
  try {
    // 1. Primary: Firebase Auth signInWithPopup (authenticates Firestore & returns Google OAuth token)
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || '';

    const user: GoogleAuthUser = {
      email: result.user.email || '',
      displayName: result.user.displayName || 'Dinas PMDP3A Nagekeo',
      photoURL: result.user.photoURL || undefined,
      emailVerified: result.user.emailVerified
    };

    cachedAccessToken = token || null;
    cachedUser = user;
    notifyListeners();

    return { user, accessToken: token };
  } catch (fbError: any) {
    // If user intentionally closed popup, don't open another popup
    if (
      fbError?.code === 'auth/popup-closed-by-user' ||
      fbError?.code === 'auth/cancelled-popup-request'
    ) {
      throw new Error('Login Google dibatalkan. Silakan klik kembali untuk masuk.');
    }

    // If current domain (e.g. custom Cloudflare domain) is not yet listed in Firebase Authorized Domains,
    // GIS will also fail with Error 400: origin_mismatch. Surface an actionable error immediately.
    if (fbError?.code === 'auth/unauthorized-domain') {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const err: any = new Error(
        `Domain "${host}" belum didaftarkan di Firebase Authentication Authorized Domains.`
      );
      err.code = 'auth/unauthorized-domain';
      err.hostname = host;
      err.projectId = firebaseConfig.projectId;
      throw err;
    }

    if (fbError?.code === 'auth/popup-blocked') {
      throw new Error('Pop-up login diblokir oleh browser. Silakan izinkan pop-up untuk situs ini lalu coba lagi.');
    }

    console.warn('Firebase signInWithPopup notice, attempting GIS + signInWithCredential fallback:', fbError?.code || fbError?.message);

    // 2. Fallback: GIS Token Client + Firebase signInWithCredential
    try {
      await loadGisScript();
      const clientId = firebaseConfig.oAuthClientId || '280285921895-ubujbkjd0e2o89jns6nvh350otgfn8md.apps.googleusercontent.com';

      const token = await new Promise<string>((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          hint: OFFICIAL_DINAS_EMAIL,
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
            } else if (response.access_token) {
              resolve(response.access_token);
            } else {
              reject(new Error('Respon token Google tidak valid.'));
            }
          },
          error_callback: (err: any) => {
            reject(new Error(err.message || 'Gagal melakukan autentikasi Google.'));
          }
        });
        client.requestAccessToken({ prompt: 'consent' });
      });

      // Sign into Firebase Auth using the Google OAuth access token so Firestore Security Rules recognize the officer
      const oauthCred = GoogleAuthProvider.credential(null, token);
      const fbCredResult = await signInWithCredential(auth, oauthCred);

      const user: GoogleAuthUser = {
        email: fbCredResult.user.email || '',
        displayName: fbCredResult.user.displayName || 'Dinas PMDP3A Nagekeo',
        photoURL: fbCredResult.user.photoURL || undefined,
        emailVerified: fbCredResult.user.emailVerified
      };

      cachedAccessToken = token;
      cachedUser = user;
      notifyListeners();

      return { user, accessToken: token };
    } catch (gisError: any) {
      console.error('Google Sign-In failed on both Firebase Popup and GIS fallback:', gisError);
      throw new Error(gisError?.message || fbError?.message || 'Gagal autentikasi Google. Pastikan pop-up diizinkan dan domain terdaftar.');
    }
  } finally {
    isSigningIn = false;
  }
};

// Retrieve in-memory access token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Sign out and clear cached token
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Firebase SignOut Warning:', e);
  }
  cachedAccessToken = null;
  cachedUser = null;
  notifyListeners();
};
