// Menu service – real Firestore CRUD for the 'menuItems' collection
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { MenuItem, DietaryTag, ApiResponse } from '../types';

const COLLECTION = 'menuItems';
const col = collection(db, COLLECTION);

export const menuService = {
  // ── Read ──────────────────────────────────────────────────────────────────
  async getMenuItems(): Promise<ApiResponse<MenuItem[]>> {
    try {
      const q = query(col, orderBy('category'));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MenuItem[];
      return { success: true, data: items };
    } catch (error: any) {
      console.error('[menuService] getMenuItems:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Filter client-side (avoids composite index requirements)
  async getMenuItemsByDietaryTags(tags: DietaryTag[]): Promise<ApiResponse<MenuItem[]>> {
    try {
      const { data: all } = await menuService.getMenuItems();
      const filtered = (all ?? []).filter(
        item => item.available && tags.some(tag => item.dietaryTags.includes(tag))
      );
      return { success: true, data: filtered };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  },

  // Returns { id → name } map — used by KDS to display item names
  async getMenuNamesMap(): Promise<Record<string, string>> {
    try {
      const snap = await getDocs(col);
      const map: Record<string, string> = {};
      snap.docs.forEach(d => { map[d.id] = (d.data() as MenuItem).name; });
      return map;
    } catch {
      return {};
    }
  },

  // ── Create ────────────────────────────────────────────────────────────────
  async addMenuItem(item: Omit<MenuItem, 'id'>): Promise<ApiResponse<string>> {
    try {
      const ref = await addDoc(col, item);
      return { success: true, data: ref.id, message: 'Item added' };
    } catch (error: any) {
      console.error('[menuService] addMenuItem:', error);
      return { success: false, data: '', error: error.message };
    }
  },

  // ── Update ────────────────────────────────────────────────────────────────
  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, COLLECTION, id), updates as Record<string, unknown>);
      return { success: true, data: undefined, message: 'Item updated' };
    } catch (error: any) {
      console.error('[menuService] updateMenuItem:', error);
      return { success: false, data: undefined, error: error.message };
    }
  },

  // ── Delete ────────────────────────────────────────────────────────────────
  async deleteMenuItem(id: string): Promise<ApiResponse<void>> {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return { success: true, data: undefined, message: 'Item deleted' };
    } catch (error: any) {
      console.error('[menuService] deleteMenuItem:', error);
      return { success: false, data: undefined, error: error.message };
    }
  },

  // ── Toggle ────────────────────────────────────────────────────────────────
  async toggleAvailability(id: string, available: boolean): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, COLLECTION, id), { available });
      return { success: true, data: undefined, message: `Availability set to ${available}` };
    } catch (error: any) {
      console.error('[menuService] toggleAvailability:', error);
      return { success: false, data: undefined, error: error.message };
    }
  },
};