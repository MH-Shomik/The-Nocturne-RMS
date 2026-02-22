// Global application state using Zustand
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  User, 
  CartItem, 
  Table, 
  DietaryFilter, 
  MenuItem, 
  Order,
  DietaryTag 
} from '../types';

// Main application store
interface AppStore {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Shopping cart (for customer orders)
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  
  // Selected table for reservations/orders
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;
  
  // Dietary filters for menu
  dietaryFilters: DietaryFilter[];
  initializeDietaryFilters: () => void;
  toggleDietaryFilter: (tag: DietaryTag) => void;
  clearDietaryFilters: () => void;
  getActiveDietaryTags: () => DietaryTag[];
}

// Initial dietary filters based on design requirements
const initialDietaryFilters: DietaryFilter[] = [
  { tag: 'vegan', active: false, label: 'Vegan', color: 'fresh-green' },
  { tag: 'vegetarian', active: false, label: 'Vegetarian', color: 'fresh-green' },
  { tag: 'gluten-free', active: false, label: 'Gluten Free', color: 'accent-gold' },
  { tag: 'dairy-free', active: false, label: 'Dairy Free', color: 'accent-gold' },
  { tag: 'nut-free', active: false, label: 'Nut Free', color: 'accent-orange' },
  { tag: 'halal', active: false, label: 'Halal', color: 'accent-gold' },
  { tag: 'kosher', active: false, label: 'Kosher', color: 'accent-gold' },
  { tag: 'keto', active: false, label: 'Keto', color: 'accent-orange' },
  { tag: 'low-sodium', active: false, label: 'Low Sodium', color: 'warm-beige' },
];

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // User state
        user: null,
        setUser: (user) => set({ user }),
        
        // Loading and error states
        isLoading: false,
        error: null,
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
        
        // Shopping cart
        cart: [],
        addToCart: (item, quantity = 1) => {
          const { cart } = get();
          const existingItem = cart.find(cartItem => cartItem.menuItem.id === item.id);
          
          if (existingItem) {
            set({
              cart: cart.map(cartItem =>
                cartItem.menuItem.id === item.id
                  ? { ...cartItem, quantity: cartItem.quantity + quantity }
                  : cartItem
              )
            });
          } else {
            set({
              cart: [...cart, { menuItem: item, quantity }]
            });
          }
        },
        
        removeFromCart: (menuItemId) => {
          const { cart } = get();
          set({
            cart: cart.filter(item => item.menuItem.id !== menuItemId)
          });
        },
        
        updateCartQuantity: (menuItemId, quantity) => {
          const { cart } = get();
          if (quantity <= 0) {
            get().removeFromCart(menuItemId);
            return;
          }
          
          set({
            cart: cart.map(item =>
              item.menuItem.id === menuItemId
                ? { ...item, quantity }
                : item
            )
          });
        },
        
        clearCart: () => set({ cart: [] }),
        
        getCartTotal: () => {
          const { cart } = get();
          return cart.reduce((total, item) => 
            total + (item.menuItem.price * item.quantity), 0
          );
        },
        
        getCartItemCount: () => {
          const { cart } = get();
          return cart.reduce((count, item) => count + item.quantity, 0);
        },
        
        // Table selection
        selectedTable: null,
        setSelectedTable: (selectedTable) => set({ selectedTable }),
        
        // Dietary filters
        dietaryFilters: initialDietaryFilters,
        initializeDietaryFilters: () => set({ dietaryFilters: initialDietaryFilters }),
        
        toggleDietaryFilter: (tag) => {
          const { dietaryFilters } = get();
          set({
            dietaryFilters: dietaryFilters.map(filter =>
              filter.tag === tag
                ? { ...filter, active: !filter.active }
                : filter
            )
          });
        },
        
        clearDietaryFilters: () => {
          const { dietaryFilters } = get();
          set({
            dietaryFilters: dietaryFilters.map(filter => ({ ...filter, active: false }))
          });
        },
        
        getActiveDietaryTags: () => {
          const { dietaryFilters } = get();
          return dietaryFilters
            .filter(filter => filter.active)
            .map(filter => filter.tag);
        }
      }),
      {
        name: 'worldplate-storage', // localStorage key
        partialize: (state) => ({ 
          cart: state.cart,
          dietaryFilters: state.dietaryFilters,
          selectedTable: state.selectedTable 
        }), // Only persist these values
      }
    ),
    { name: 'WorldPlate App Store' }
  )
);

// Kitchen Display Store (separate for real-time KDS)
interface KitchenStore {
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  statusFilters: Order['status'][];
  toggleStatusFilter: (status: Order['status']) => void;
  getFilteredOrders: () => Order[];
}

export const useKitchenStore = create<KitchenStore>()(
  devtools(
    (set, get) => ({
      orders: [],
      setOrders: (orders) => set({ orders }),
      
      updateOrderStatus: (orderId, status) => {
        const { orders } = get();
        set({
          orders: orders.map(order =>
            order.id === orderId ? { ...order, status } : order
          )
        });
      },
      
      selectedOrder: null,
      setSelectedOrder: (selectedOrder) => set({ selectedOrder }),
      
      statusFilters: ['incoming', 'cooking', 'ready'], // Show all by default
      toggleStatusFilter: (status) => {
        const { statusFilters } = get();
        const isActive = statusFilters.includes(status);
        
        if (isActive) {
          set({
            statusFilters: statusFilters.filter(s => s !== status)
          });
        } else {
          set({
            statusFilters: [...statusFilters, status]
          });
        }
      },
      
      getFilteredOrders: () => {
        const { orders, statusFilters } = get();
        return orders.filter(order => statusFilters.includes(order.status));
      }
    }),
    { name: 'Kitchen Display Store' }
  )
);

// Table management store (for 3D visualization)
interface TableStore {
  tables: Table[];
  setTables: (tables: Table[]) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  hoveredTable: string | null;
  setHoveredTable: (tableId: string | null) => void;
  selectedTableId: string | null;
  setSelectedTableId: (tableId: string | null) => void;
  getAvailableTables: () => Table[];
  getTableById: (tableId: string) => Table | undefined;
}

export const useTableStore = create<TableStore>()(
  devtools(
    (set, get) => ({
      tables: [],
      setTables: (tables) => set({ tables }),
      
      updateTableStatus: (tableId, status) => {
        const { tables } = get();
        set({
          tables: tables.map(table =>
            table.id === tableId 
              ? { ...table, status, lastUpdated: new Date() } 
              : table
          )
        });
      },
      
      hoveredTable: null,
      setHoveredTable: (hoveredTable) => set({ hoveredTable }),
      
      selectedTableId: null,
      setSelectedTableId: (selectedTableId) => set({ selectedTableId }),
      
      getAvailableTables: () => {
        const { tables } = get();
        return tables.filter(table => table.status === 'available');
      },
      
      getTableById: (tableId) => {
        const { tables } = get();
        return tables.find(table => table.id === tableId);
      }
    }),
    { name: 'Table Management Store' }
  )
);