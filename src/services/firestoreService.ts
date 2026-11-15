import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ReportItem } from '../types';
import { auth } from './googleAuth';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Security / Operation Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Test server connection safely
 */
export const testFirestoreConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice.');
    }
  }
};
testFirestoreConnection();

/**
 * Save a new public complaint to Firestore (clean create operation)
 */
export const saveReportToFirestore = async (report: ReportItem): Promise<void> => {
  const path = `reports/${report.ticketCode}`;
  try {
    const docRef = doc(db, 'reports', report.ticketCode);
    await setDoc(docRef, report);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

/**
 * Fetch all reports once (Restricted to Authorized Dinas Officer)
 */
export const fetchReportsFromFirestoreOnce = async (): Promise<ReportItem[]> => {
  const path = 'reports';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const loaded: ReportItem[] = [];
    snapshot.forEach((docSnap) => {
      loaded.push(docSnap.data() as ReportItem);
    });
    return loaded;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

/**
 * Seed initial sample reports - Disabled in production to protect data integrity and avoid mock leaks
 */
export const seedInitialReportsIfEmpty = async (): Promise<void> => {
  // In production, real complaints submitted by citizens are stored directly.
};

/**
 * Subscribe to all reports in real-time from Firestore (Authorized for Dinas Officer)
 */
export const subscribeToReports = (
  onSuccess: (reports: ReportItem[]) => void,
  onError?: (err: Error) => void
) => {
  const path = 'reports';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const loaded: ReportItem[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as ReportItem);
        });
        onSuccess(loaded);
      },
      (err) => {
        console.warn('Firestore subscription notice (Restricted to Authorized Officer):', err.message);
        if (onError) onError(err);
      }
    );
  } catch (error: any) {
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Update report status or notes in Firestore (Restricted to Authorized Officer)
 */
export const updateReportInFirestore = async (
  ticketCode: string,
  partial: Partial<ReportItem>
): Promise<void> => {
  const path = `reports/${ticketCode}`;
  try {
    const docRef = doc(db, 'reports', ticketCode);
    await updateDoc(docRef, {
      ...partial,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

/**
 * Delete a report from Firestore (Restricted to Authorized Officer)
 */
export const deleteReportFromFirestore = async (ticketCode: string): Promise<void> => {
  const path = `reports/${ticketCode}`;
  try {
    const docRef = doc(db, 'reports', ticketCode);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

/**
 * Fetch a single report by ticketCode
 */
export const getReportByTicketCode = async (ticketCode: string): Promise<ReportItem | null> => {
  const path = `reports/${ticketCode}`;
  try {
    const docRef = doc(db, 'reports', ticketCode.trim().toUpperCase());
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ReportItem;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
  return null;
};
