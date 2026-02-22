// Core type definitions for WorldPlate RMS

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'kitchen' | 'host';
  name: string;
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  ingredients: string[];
  dietaryTags: DietaryTag[];
  category: 'appetizer' | 'main' | 'dessert' | 'beverage';
  available: boolean;
  allergens: string[];
}

export type DietaryTag = 
  | 'vegan' 
  | 'vegetarian' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'nut-free' 
  | 'halal' 
  | 'kosher'
  | 'low-sodium'
  | 'keto';

export type Allergen = 
  | 'nuts' 
  | 'dairy' 
  | 'gluten' 
  | 'eggs' 
  | 'soy' 
  | 'shellfish' 
  | 'fish'
  | 'sesame';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'reserved' | 'occupied' | 'cleaning';
  position: {
    x: number;
    y: number;
    z: number;
  };
  shape?: 'round' | 'square' | 'rectangle';
  reservationDetails?: {
    customerName: string;
    partySize: number;
    reservationTime?: Date;
  };
  lastUpdated: Date;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'incoming' | 'cooking' | 'ready' | 'served' | 'cancelled';
  hasAllergy: boolean;
  allergyNotes?: string;
  specialInstructions?: string;
  timestamp: Date;
  updatedAt?: Date;
  completedAt?: Date;
  servedAt?: Date;
  cancelledAt?: Date;
  estimatedTime?: number;
  assignedChef?: string;
  cancellationReason?: string;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  customizations?: string[];
  allergyInfo?: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail?: string;
  phoneNumber?: string;
  tableId: string;
  partySize: number;
  reservationTime: Date;
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled';
  specialRequests?: string;
  dietaryRestrictions?: DietaryTag[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customizations?: string[];
}

export interface DietaryFilter {
  tag: DietaryTag;
  active: boolean;
  label: string;
  color: string;
}

// Component prop types
export interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onViewDetails: (item: MenuItem) => void;
  isAllergenSafe: boolean;
}

export interface TableMeshProps {
  table: Table;
  onClick: (table: Table) => void;
  isSelected: boolean;
}

export interface OrderTicketProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order['status']) => void;
  onDragStart?: (order: Order) => void;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Store types
export interface AppState {
  user: User | null;
  cart: CartItem[];
  selectedTable: Table | null;
  dietaryFilters: DietaryFilter[];
  isLoading: boolean;
  error: string | null;
}

export interface MenuState {
  items: MenuItem[];
  filteredItems: MenuItem[];
  selectedCategory: MenuItem['category'] | 'all';
  searchQuery: string;
}

export interface ReservationState {
  tables: Table[];
  selectedDate: Date;
  selectedTime: string;
  partySize: number;
}

export interface KitchenState {
  orders: Order[];
  activeFilters: Order['status'][];
  selectedOrder: Order | null;
}