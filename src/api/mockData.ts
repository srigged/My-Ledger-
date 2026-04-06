export const MOCK_RECORDS = [
  { id: '1', amount: 1250.00, type: 'income', category: 'Salary', date: '2026-04-01', description: 'Monthly paycheck', createdBy: 'admin-1', createdAt: '2026-04-01T09:00:00Z' },
  { id: '2', amount: 45.50, type: 'expense', category: 'Food', date: '2026-04-02', description: 'Lunch at Joe\'s', createdBy: 'admin-1', createdAt: '2026-04-02T12:30:00Z' },
  { id: '3', amount: 120.00, type: 'expense', category: 'Utilities', date: '2026-04-03', description: 'Electric bill', createdBy: 'admin-1', createdAt: '2026-04-03T10:00:00Z' },
  { id: '4', amount: 500.00, type: 'income', category: 'Freelance', date: '2026-04-04', description: 'Logo design project', createdBy: 'analyst-1', createdAt: '2026-04-04T15:00:00Z' },
  { id: '5', amount: 30.00, type: 'expense', category: 'Transport', date: '2026-04-05', description: 'Uber to meeting', createdBy: 'analyst-1', createdAt: '2026-04-05T08:45:00Z' },
];

export const MOCK_USERS = [
  { uid: 'admin-1', email: 'admin@myledger.com', displayName: 'Admin User', role: 'admin', status: 'active', createdAt: '2026-01-01T00:00:00Z' },
  { uid: 'analyst-1', email: 'analyst@myledger.com', displayName: 'Analyst User', role: 'analyst', status: 'active', createdAt: '2026-01-02T00:00:00Z' },
  { uid: 'viewer-1', email: 'viewer@myledger.com', displayName: 'Viewer User', role: 'viewer', status: 'active', createdAt: '2026-01-03T00:00:00Z' },
];

export const MOCK_SUMMARY = {
  totalIncome: 1750.00,
  totalExpenses: 195.50,
  netBalance: 1554.50,
  transactionCount: 5,
  trends: [
    { month: 'Nov', income: 1200, expense: 800 },
    { month: 'Dec', income: 1500, expense: 900 },
    { month: 'Jan', income: 1100, expense: 700 },
    { month: 'Feb', income: 1600, expense: 1000 },
    { month: 'Mar', income: 1400, expense: 850 },
    { month: 'Apr', income: 1750, expense: 195.50 },
  ],
  categoryBreakdown: [
    { name: 'Food', value: 45.50 },
    { name: 'Utilities', value: 120.00 },
    { name: 'Transport', value: 30.00 },
  ]
};
