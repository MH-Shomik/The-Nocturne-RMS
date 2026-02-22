// Authentication service for staff login and role management
import { 
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, ApiResponse } from '../types';

const USERS_COLLECTION = 'users';

export const authService = {
  // Sign in staff member
  async signIn(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user role and details from Firestore
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found. Contact administrator.');
      }
      
      const userData = userDoc.data() as Omit<User, 'id'>;
      const user: User = {
        id: firebaseUser.uid,
        ...userData
      };
      
      return { 
        success: true, 
        data: user, 
        message: 'Signed in successfully' 
      };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { 
        success: false, 
        data: {} as User, 
        error: error.message || 'Failed to sign in' 
      };
    }
  },

  // Sign out
  async signOut(): Promise<ApiResponse<void>> {
    try {
      await signOut(auth);
      return { 
        success: true, 
        data: undefined, 
        message: 'Signed out successfully' 
      };
    } catch (error: any) {
      console.error('Error signing out:', error);
      return { 
        success: false, 
        data: undefined, 
        error: 'Failed to sign out' 
      };
    }
  },

  // Create staff account (Admin only)
  async createStaffAccount(
    email: string, 
    password: string, 
    userData: {
      name: string;
      role: User['role'];
    }
  ): Promise<ApiResponse<User>> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const newUser: User = {
        id: firebaseUser.uid,
        email,
        ...userData,
        createdAt: new Date()
      };
      
      // Save user profile to Firestore
      await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt
      });
      
      return { 
        success: true, 
        data: newUser, 
        message: 'Staff account created successfully' 
      };
    } catch (error: any) {
      console.error('Error creating staff account:', error);
      return { 
        success: false, 
        data: {} as User, 
        error: error.message || 'Failed to create staff account' 
      };
    }
  },

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;
      
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
      if (!userDoc.exists()) return null;
      
      const userData = userDoc.data() as Omit<User, 'id'>;
      return {
        id: firebaseUser.uid,
        ...userData
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Authentication state listener
  onAuthStateChange(
    callback: (user: User | null) => void
  ): (() => void) {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'id'>;
            const user: User = {
              id: firebaseUser.uid,
              ...userData
            };
            callback(user);
          } else {
            console.error('User profile not found');
            callback(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },

  // Check if user has required role
  hasRole(user: User | null, requiredRole: User['role'] | User['role'][]): boolean {
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  },

  // Check if user is admin
  isAdmin(user: User | null): boolean {
    return this.hasRole(user, 'admin');
  },

  // Check if user is kitchen staff
  isKitchenStaff(user: User | null): boolean {
    return this.hasRole(user, ['admin', 'kitchen']);
  }
};