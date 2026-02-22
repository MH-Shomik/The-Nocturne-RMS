// Order service for Kitchen Display System with real-time updates
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Order, OrderItem, ApiResponse } from '../types';

const COLLECTION_NAME = 'orders';
const ordersCollection = collection(db, COLLECTION_NAME);

export const orderService = {
  // Get all orders for Kitchen Display
  async getOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const q = query(
        ordersCollection, 
        where('status', 'in', ['incoming', 'cooking', 'ready']),
        orderBy('timestamp', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Order[];
      
      return { success: true, data: orders };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { 
        success: false, 
        data: [], 
        error: 'Failed to fetch orders' 
      };
    }
  },

  // Create new order (from customer menu)
  async createOrder(orderData: {
    tableId: string;
    items: OrderItem[];
    specialInstructions?: string;
    hasAllergy: boolean;
    allergyNotes?: string;
  }): Promise<ApiResponse<string>> {
    try {
      const newOrder: Omit<Order, 'id'> = {
        ...orderData,
        status: 'incoming',
        timestamp: new Date(),
        estimatedTime: calculateEstimatedTime(orderData.items)
      };

      const docRef = await addDoc(ordersCollection, {
        ...newOrder,
        timestamp: Timestamp.fromDate(newOrder.timestamp)
      });
      
      return { 
        success: true, 
        data: docRef.id, 
        message: 'Order placed successfully' 
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return { 
        success: false, 
        data: '', 
        error: 'Failed to place order' 
      };
    }
  },

  // Update order status (Kitchen workflow)
  async updateOrderStatus(
    orderId: string, 
    status: Order['status'],
    assignedChef?: string
  ): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, orderId);
      const updateData: any = {
        status,
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (assignedChef !== undefined) {
        updateData.assignedChef = assignedChef;
      }

      // Set completion time when order is ready
      if (status === 'ready') {
        updateData.completedAt = Timestamp.fromDate(new Date());
      }

      await updateDoc(docRef, updateData);
      
      return { 
        success: true, 
        data: undefined, 
        message: `Order status updated to ${status}` 
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { 
        success: false, 
        data: undefined, 
        error: 'Failed to update order status' 
      };
    }
  },

  // Real-time listener for Kitchen Display System
  subscribeToOrders(
    callback: (orders: Order[]) => void,
    onError?: (error: Error) => void
  ): (() => void) {
    try {
      const q = query(
        ordersCollection,
        where('status', 'in', ['incoming', 'cooking', 'ready']),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const orders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
            completedAt: doc.data().completedAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          })) as Order[];
          
          // Sort orders: allergy orders first, then by timestamp
          orders.sort((a, b) => {
            if (a.hasAllergy && !b.hasAllergy) return -1;
            if (!a.hasAllergy && b.hasAllergy) return 1;
            return a.timestamp.getTime() - b.timestamp.getTime();
          });
          
          callback(orders);
        },
        (error) => {
          console.error('Error in orders subscription:', error);
          onError?.(error);
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up orders subscription:', error);
      onError?.(error as Error);
      return () => {};
    }
  },

  // Mark order as served/completed
  async completeOrder(orderId: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, orderId);
      await updateDoc(docRef, {
        status: 'served',
        servedAt: Timestamp.fromDate(new Date())
      });
      
      return { 
        success: true, 
        data: undefined, 
        message: 'Order marked as served' 
      };
    } catch (error) {
      console.error('Error completing order:', error);
      return { 
        success: false, 
        data: undefined, 
        error: 'Failed to complete order' 
      };
    }
  },

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, COLLECTION_NAME, orderId);
      await updateDoc(docRef, {
        status: 'cancelled',
        cancelledAt: Timestamp.fromDate(new Date()),
        cancellationReason: reason
      });
      
      return { 
        success: true, 
        data: undefined, 
        message: 'Order cancelled successfully' 
      };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { 
        success: false, 
        data: undefined, 
        error: 'Failed to cancel order' 
      };
    }
  },

  // Get orders by table (for service staff)
  async getOrdersByTable(tableId: string): Promise<ApiResponse<Order[]>> {
    try {
      const q = query(
        ordersCollection,
        where('tableId', '==', tableId),
        where('status', 'in', ['incoming', 'cooking', 'ready']),
        orderBy('timestamp', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Order[];
      
      return { success: true, data: orders };
    } catch (error) {
      console.error('Error fetching table orders:', error);
      return { 
        success: false, 
        data: [], 
        error: 'Failed to fetch table orders' 
      };
    }
  }
};

// Helper function to calculate estimated cooking time
function calculateEstimatedTime(items: OrderItem[]): number {
  // Base time calculation logic
  // This would be enhanced with actual menu item cooking times
  const baseTimePerItem = 8; // minutes
  const complexityMultiplier = 1.2;
  
  return Math.ceil(items.length * baseTimePerItem * complexityMultiplier);
}