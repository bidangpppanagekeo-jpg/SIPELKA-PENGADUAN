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
import { INITIAL_REPORTS } from '../data/mockData';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Test server connection
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
 * Save a new or updated report to Firestore
 */
export const saveReportToFirestore = async (report: ReportItem): Promise<void> => {
  try {
    const docRef = doc(db, 'reports', report.ticketCode);
    await setDoc(docRef, report, { merge: true });
  } catch (error) {
    console.error('Gagal menyimpan pengaduan ke Firestore:', error);
  }
};

/**
 * Seed initial sample reports if collection is empty
 */
export const seedInitialReportsIfEmpty = async (): Promise<void> => {
  try {
    const snap = await getDocs(collection(db, 'reports'));
    if (snap.empty) {
      for (const rep of INITIAL_REPORTS) {
        await setDoc(doc(db, 'reports', rep.ticketCode), rep);
      }
    }
  } catch (error) {
    console.warn('Seed initial reports notice:', error);
  }
};

/**
 * Subscribe to all reports in real-time from Firestore
 */
export const subscribeToReports = (
  onSuccess: (reports: ReportItem[]) => void,
  onError?: (err: Error) => void
) => {
  try {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const loaded: ReportItem[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as ReportItem);
        });
        if (loaded.length > 0) {
          onSuccess(loaded);
        }
      },
      (err) => {
        console.error('Firestore snapshot listener error:', err);
        if (onError) onError(err);
      }
    );
  } catch (error: any) {
    console.error('Failed to setup Firestore subscription:', error);
    if (onError) onError(error);
    return () => {};
  }
};

/**
 * Update report status or notes in Firestore
 */
export const updateReportInFirestore = async (
  ticketCode: string,
  partial: Partial<ReportItem>
): Promise<void> => {
  try {
    const docRef = doc(db, 'reports', ticketCode);
    await updateDoc(docRef, {
      ...partial,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gagal memperbarui pengaduan di Firestore:', error);
  }
};

/**
 * Delete a report from Firestore
 */
export const deleteReportFromFirestore = async (ticketCode: string): Promise<void> => {
  try {
    const docRef = doc(db, 'reports', ticketCode);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Gagal menghapus pengaduan dari Firestore:', error);
  }
};

/**
 * Fetch a single report by ticketCode (for public tracking)
 */
export const getReportByTicketCode = async (ticketCode: string): Promise<ReportItem | null> => {
  try {
    const docRef = doc(db, 'reports', ticketCode.trim().toUpperCase());
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ReportItem;
    }
  } catch (error) {
    console.error('Gagal mencari tiket di Firestore:', error);
  }
  return null;
};
