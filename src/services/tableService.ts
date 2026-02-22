// Table service for 3D spatial reservation system
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Table, ApiResponse } from '../types';

const COLLECTION_NAME = 'tables';
const tablesCollection = collection(db, COLLECTION_NAME);

export const tableService = {
  // Get all tables with their current status
  async getTables(): Promise<ApiResponse<Table[]>> {
    try {
      const q = query(tablesCollection, orderBy('number'));
      const querySnapshot = await getDocs(q);
      const tables = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
      })) as Table[];
      
      return { success: true, data: tables };
    } catch (error) {
      console.error('Error fetching tables:', error);
      return { 
        success: false, 
        data: [], 
        error: 'Failed to fetch tables' 
      };
    }
  },

  // Get available tables for a specific time
  async getAvailableTables(): Promise<ApiResponse<Table[]>> {
    try {
      const q = query(
        tablesCollection, 
        orderBy('number')
      );
      const querySnapshot = await getDocs(q);
      const tables = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
      })) as Table[];
      
      const availableTables = tables.filter(table => table.status === 'available');
      
      return { success: true, data: availableTables };
    } catch (error) {
      console.error('Error fetching available tables:', error);
      return { 
        success: false, 
        data: [], 
        error: 'Failed to fetch available tables' 
      };
    }
  },

  // Update table status (for seating/reservations)
  async updateTableStatus(
    tableId: string, 
    status: Table['status']
  ): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, tableId);
      await updateDoc(docRef, {
        status,
        lastUpdated: new Date()
      });
      
      return { 
        success: true, 
        data: undefined, 
        message: `Table status updated to ${status}` 
      };
    } catch (error) {
      console.error('Error updating table status:', error);
      return { 
        success: false, 
        data: undefined, 
        error: 'Failed to update table status' 
      };
    }
  },

  // Real-time listener for table status changes (for 3D visualization)
  subscribeToTableUpdates(
    callback: (tables: Table[]) => void,
    onError?: (error: Error) => void
  ): (() => void) {
    try {
      const q = query(tablesCollection, orderBy('number'));
      
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const tables = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
          })) as Table[];
          
          callback(tables);
        },
        (error) => {
          console.error('Error in table subscription:', error);
          onError?.(error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up table subscription:', error);
      onError?.(error as Error);
      return () => {}; // Return empty unsubscribe function
    }
  },

  // Reserve a table
  async reserveTable(
    tableId: string,
    reservationDetails?: { customerName: string; partySize: number }
  ): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, tableId);
      await updateDoc(docRef, {
        status: 'reserved',
        lastUpdated: new Date(),
        ...(reservationDetails && { reservationDetails })
      });
      
      return { 
        success: true, 
        data: undefined, 
        message: 'Table reserved successfully' 
      };
    } catch (error) {
      console.error('Error reserving table:', error);
      return { 
        success: false, 
        data: undefined, 
        error: 'Failed to reserve table' 
      };
    }
  },

  // Clear table (when guests leave)
  async clearTable(tableId: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, tableId);
      await updateDoc(docRef, {
        status: 'available',
        lastUpdated: new Date(),
        reservationDetails: null
      });
      
      return { 
        success: true, 
        data: undefined, 
        message: 'Table cleared successfully' 
      };
    } catch (error) {
      console.error('Error clearing table:', error);
      return { 
        success: false, 
        data: undefined, 
        error: 'Failed to clear table' 
      };
    }
  }
};