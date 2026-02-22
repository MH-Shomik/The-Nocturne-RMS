// Seed utility – populates Firestore 'menuItems' with demo data on first run.
// Call seedMenuItems() once from the Management portal when the collection is empty.
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { mockMenuItems } from './mockData';

const COLLECTION = 'menuItems';

/**
 * Seeds mockMenuItems into Firestore, preserving their original IDs (m1–m20)
 * so the KDS hardcoded name-map keeps working.
 * Already-existing documents are skipped (idempotent).
 */
export async function seedMenuItems(): Promise<{ seeded: number; skipped: number; error?: string }> {
  try {
    let seeded = 0;
    let skipped = 0;

    for (const item of mockMenuItems) {
      const { id, ...data } = item;
      const ref = doc(db, COLLECTION, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, data);
        seeded++;
      } else {
        skipped++;
      }
    }

    return { seeded, skipped };
  } catch (error: any) {
    console.error('[seedService] seedMenuItems:', error);
    return { seeded: 0, skipped: 0, error: error.message };
  }
}

/** Returns true if the menuItems collection has at least one document. */
export async function menuCollectionHasData(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    return !snap.empty;
  } catch {
    return false;
  }
}
