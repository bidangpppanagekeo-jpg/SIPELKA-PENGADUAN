import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Sheets and Drive.file scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

export interface GoogleAuthUser {
  email: string;
  displayName?: string;
  photoURL?: string;
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

// Dynamically load Google Identity Services script
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
    if (user && token) {
      if (onAuthSuccess) onAuthSuccess(user, token);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  };
  authListeners.push(listener);

  // If already authenticated in memory
  if (cachedUser && cachedAccessToken) {
    if (onAuthSuccess) onAuthSuccess(cachedUser, cachedAccessToken);
  }

  // Also hook into Firebase auth state as secondary
  const unsubscribeFb = onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser && cachedAccessToken) {
      cachedUser = {
        email: fbUser.email || 'bidangpppanagekeo@gmail.com',
        displayName: fbUser.displayName || undefined,
        photoURL: fbUser.photoURL || undefined
      };
      notifyListeners();
    } else if (!fbUser && !cachedUser && !isSigningIn) {
      cachedAccessToken = null;
      cachedUser = null;
      if (onAuthFailure) onAuthFailure();
    }
  });

  return () => {
    const idx = authListeners.indexOf(listener);
    if (idx !== -1) authListeners.splice(idx, 1);
    unsubscribeFb();
  };
};

// Sign in with Google (GIS Primary, Firebase Fallback)
export const signInWithGoogle = async (): Promise<{ user: GoogleAuthUser; accessToken: string } | null> => {
  isSigningIn = true;
  try {
    // 1. Try Google Identity Services (GIS) Token Client first
    await loadGisScript();
    
    const clientId = firebaseConfig.oAuthClientId || '280285921895-ubujbkjd0e2o89jns6nvh350otgfn8md.apps.googleusercontent.com';
    
    const token = await new Promise<string>((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
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

    // Fetch user info from Google OAuth2 API
    let userEmail = 'bidangpppanagekeo@gmail.com';
    let userName = 'Dinas PMDP3A Nagekeo';
    let userPhoto: string | undefined = undefined;

    try {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userInfoRes.ok) {
        const userInfo = await userInfoRes.json();
        if (userInfo.email) userEmail = userInfo.email;
        if (userInfo.name) userName = userInfo.name;
        if (userInfo.picture) userPhoto = userInfo.picture;
      }
    } catch (e) {
      console.warn('Gagal mengambil data profil Google UserInfo:', e);
    }

    const user: GoogleAuthUser = {
      email: userEmail,
      displayName: userName,
      photoURL: userPhoto
    };

    cachedAccessToken = token;
    cachedUser = user;
    notifyListeners();

    return { user, accessToken: token };
  } catch (gisError: any) {
    console.warn('GIS Token Client Error, trying Firebase Auth fallback:', gisError);
    
    // 2. Fallback to Firebase Auth popup if GIS fails
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error('Gagal mendapatkan access token Google Workspace');
      }
      cachedAccessToken = credential.accessToken;
      cachedUser = {
        email: result.user.email || 'bidangpppanagekeo@gmail.com',
        displayName: result.user.displayName || 'Dinas PMDP3A Nagekeo',
        photoURL: result.user.photoURL || undefined
      };
      notifyListeners();
      return { user: cachedUser, accessToken: cachedAccessToken };
    } catch (fbError: any) {
      console.error('Firebase Auth Sign In Error:', fbError);
      if (fbError.code === 'auth/unauthorized-domain' || fbError.message?.includes('unauthorized-domain')) {
        throw new Error('Gagal autentikasi Google OAuth. Silakan izinkan pop-up di browser dan coba lagi.');
      }
      throw fbError;
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
