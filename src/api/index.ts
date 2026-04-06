import { MOCK_RECORDS, MOCK_USERS, MOCK_SUMMARY } from './mockData';

const USE_MOCK = true; // For now, we'll use mock data as the backend is just a skeleton.

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
    if (USE_MOCK) return MOCK_RECORDS as FinancialRecord[];
    const res = await fetch('/api/records');
    return res.json();
  },
  
  getUsers: async (): Promise<UserProfile[]> => {
    if (USE_MOCK) return MOCK_USERS as UserProfile[];
    const res = await fetch('/api/users');
    return res.json();
  },
  
  getSummary: async (): Promise<DashboardSummary> => {
    if (USE_MOCK) return MOCK_SUMMARY;
    const res = await fetch('/api/summary');
    return res.json();
  },
  
  createRecord: async (record: Partial<FinancialRecord>): Promise<FinancialRecord> => {
    if (USE_MOCK) {
      const newRecord = { ...record, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() } as FinancialRecord;
      MOCK_RECORDS.unshift(newRecord as any);
      return newRecord;
    }
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return res.json();
  },
  
  updateRecord: async (id: string, record: Partial<FinancialRecord>): Promise<FinancialRecord> => {
    if (USE_MOCK) {
      const index = MOCK_RECORDS.findIndex(r => r.id === id);
      MOCK_RECORDS[index] = { ...MOCK_RECORDS[index], ...record } as any;
      return MOCK_RECORDS[index] as any;
    }
    const res = await fetch(`/api/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return res.json();
  },
  
  deleteRecord: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      const index = MOCK_RECORDS.findIndex(r => r.id === id);
      MOCK_RECORDS.splice(index, 1);
      return;
    }
    await fetch(`/api/records/${id}`, { method: 'DELETE' });
  },
  
  updateUser: async (uid: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    if (USE_MOCK) {
      const index = MOCK_USERS.findIndex(u => u.uid === uid);
      MOCK_USERS[index] = { ...MOCK_USERS[index], ...data } as any;
      return MOCK_USERS[index] as any;
    }
    const res = await fetch(`/api/users/${uid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }
};
