import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/utils';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'viewer' | 'analyst' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  trends: { month: string; income: number; expense: number }[];
  categoryBreakdown: { name: string; value: number }[];
}

// API Layer
export const api = {
  getRecords: async (): Promise<FinancialRecord[]> => {
    try {
      const q = query(collection(db, 'records'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FinancialRecord[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'records');
      return [];
    }
  },
  
  getUsers: async (): Promise<UserProfile[]> => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return [];
    }
  },
  
  getSummary: async (): Promise<DashboardSummary> => {
    const records = await api.getRecords();
    
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap: Record<string, number> = {};
    const monthMap: Record<string, { income: number; expense: number }> = {};

    records.forEach(r => {
      if (r.type === 'income') {
        totalIncome += r.amount;
      } else {
        totalExpenses += r.amount;
        categoryMap[r.category] = (categoryMap[r.category] || 0) + r.amount;
      }

      const date = new Date(r.date);
      const month = date.toLocaleString('default', { month: 'short' });
      if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };
      if (r.type === 'income') monthMap[month].income += r.amount;
      else monthMap[month].expense += r.amount;
    });

    const trends = Object.entries(monthMap).map(([month, data]) => ({
      month,
      ...data
    })).slice(-6);

    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: records.length,
      trends,
      categoryBreakdown
    };
  },
  
  createRecord: async (record: Partial<FinancialRecord>): Promise<FinancialRecord> => {
    try {
      const docRef = await addDoc(collection(db, 'records'), {
        ...record,
        createdAt: new Date().toISOString()
      });
      const newDoc = await getDoc(docRef);
      return { id: docRef.id, ...newDoc.data() } as FinancialRecord;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'records');
      throw error;
    }
  },
  
  updateRecord: async (id: string, record: Partial<FinancialRecord>): Promise<FinancialRecord> => {
    try {
      const docRef = doc(db, 'records', id);
      await updateDoc(docRef, record);
      const updatedDoc = await getDoc(docRef);
      return { id, ...updatedDoc.data() } as FinancialRecord;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `records/${id}`);
      throw error;
    }
  },
  
  deleteRecord: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'records', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `records/${id}`);
      throw error;
    }
  },
  
  updateUser: async (uid: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, data);
      const updatedDoc = await getDoc(docRef);
      return { uid, ...updatedDoc.data() } as UserProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      throw error;
    }
  },

  createUser: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const docRef = doc(collection(db, 'users'));
      const newUser = {
        ...data,
        uid: docRef.id,
        status: 'active',
        createdAt: new Date().toISOString()
      } as UserProfile;
      await setDoc(docRef, newUser);
      return newUser;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
      throw error;
    }
  },

  deleteUser: async (uid: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
      throw error;
    }
  }
};
