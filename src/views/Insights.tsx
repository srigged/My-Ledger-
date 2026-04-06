import React, { useState, useEffect, useMemo } from 'react';
import { api, DashboardSummary, FinancialRecord } from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const CATEGORY_COLORS: { [key: string]: string } = {
  'Food': '#F43F5E',
  'Salary': '#10B981',
  'Rent': '#6366F1',
  'Utilities': '#F59E0B',
  'Entertainment': '#A855F7',
  'Transport': '#2DD4BF',
  'Shopping': '#FB923C'
};

export const Insights: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF';
  const tooltipText = isDark ? '#F8FAFC' : '#0F172A';

  useEffect(() => {
    const fetchData = async () => {
      const [sum, recs] = await Promise.all([api.getSummary(), api.getRecords()]);
      setSummary(sum);
      setRecords(recs);
      setLoading(false);
    };
    fetchData();
  }, []);

  const largestTransactions = useMemo(() => {
    return [...records].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [records]);

  if (loading || !summary) return (
    <div className="flex items-center justify-center h-[60vh]" role="status" aria-label="Analyzing financial data">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" aria-hidden="true" />
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] animate-pulse">PERFORMING ANALYTICAL MODELING...</p>
      </div>
    </div>
  );

  if (user?.role === 'viewer') {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center bg-surface rounded-2xl card-shadow m-8">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-4 uppercase tracking-widest">Restricted View</h2>
          <p className="text-muted text-sm leading-relaxed mb-8">
            Deep analytical insights are reserved for Analyst and Admin roles. 
            Upgrade your account to access advanced financial modeling and trend forecasting.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-accent text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all outline-none focus:ring-2 focus:ring-accent/20"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 staggered-fade-in">
      <header className="border-b border-border pb-8">
        <h2 className="text-3xl font-bold text-text tracking-tight uppercase">Financial Insights</h2>
        <p className="text-xs font-bold text-muted uppercase tracking-widest mt-2">DEEP AGGREGATION / FISCAL PERIOD 2026</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend Table */}
        <div className="bg-surface rounded-2xl card-shadow p-8">
          <div className="flex items-center gap-2 mb-8 border-b border-border pb-4">
            <Activity className="w-4 h-4 text-accent" aria-hidden="true" />
            <h3 className="text-xs font-bold text-muted uppercase tracking-[0.2em]" id="performance-matrix-title">MONTHLY PERFORMANCE MATRIX</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px] border-collapse" aria-labelledby="performance-matrix-title">
              <caption className="sr-only">Monthly financial performance showing income, expenses, and net balance</caption>
              <thead>
                <tr className="border-b border-border text-muted uppercase tracking-widest bg-bg/10">
                  <th className="px-4 py-4 font-bold text-center" scope="col">MONTH</th>
                  <th className="px-4 py-4 font-bold text-right" scope="col">INCOME</th>
                  <th className="px-4 py-4 font-bold text-right" scope="col">EXPENSES</th>
                  <th className="px-4 py-4 font-bold text-right" scope="col">NET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {summary.trends.map((t) => (
                  <tr key={t.month} className="hover:bg-bg/20 transition-colors">
                    <td className="px-4 py-4 text-text font-bold uppercase text-center">{t.month}</td>
                    <td className="px-4 py-4 text-right text-success font-bold tabular-nums">${t.income.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right text-expense font-bold tabular-nums">${t.expense.toLocaleString()}</td>
                    <td className={`px-4 py-4 text-right font-bold tabular-nums text-sm ${t.income - t.expense >= 0 ? 'text-accent' : 'text-expense'}`}>
                      ${(t.income - t.expense).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-surface rounded-2xl card-shadow p-8">
          <div className="flex items-center gap-2 mb-8 border-b border-border pb-4">
            <DollarSign className="w-4 h-4 text-cat-rose" aria-hidden="true" />
            <h3 className="text-xs font-bold text-muted uppercase tracking-[0.2em]" id="allocation-chart-title">ALLOCATION DISTRIBUTION</h3>
          </div>
          <div className="h-[300px]" role="img" aria-labelledby="allocation-chart-title">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <desc>Donut chart showing the distribution of expenses across different categories</desc>
                <Pie
                  data={summary.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  nameKey="name"
                >
                  {summary.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#2563EB'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                    fontFamily: 'DM Mono', 
                    fontSize: '11px',
                    color: tooltipText
                  }}
                  itemStyle={{ color: tooltipText }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8" role="list" aria-label="Category legend">
            {summary.categoryBreakdown.map((c) => (
              <div key={c.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg transition-colors" role="listitem">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.name] || '#2563EB' }} aria-hidden="true" />
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{c.name}</span>
                <span className="text-[10px] font-bold tabular-nums text-text ml-auto">${c.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Largest Transactions */}
      <div className="bg-surface rounded-2xl card-shadow p-8">
        <div className="flex items-center gap-2 mb-8 border-b border-border pb-4">
          <TrendingUp className="w-4 h-4 text-cat-emerald" aria-hidden="true" />
          <h3 className="text-xs font-bold text-muted uppercase tracking-[0.2em]" id="largest-transactions-title">SIGNIFICANT CAPITAL MOVEMENTS / TOP 5</h3>
        </div>
        <div className="space-y-4" role="list" aria-labelledby="largest-transactions-title">
          {largestTransactions.map((t, i) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-6 rounded-2xl border border-border hover:border-accent hover:bg-bg/10 transition-all group outline-none focus:ring-2 focus:ring-accent/20"
              role="listitem"
              tabIndex={0}
              aria-label={`Transaction ${i + 1}: ${t.description}, ${t.category}, ${t.type === 'expense' ? '-' : '+'}$${t.amount.toLocaleString()}`}
            >
              <div className="flex items-center gap-8">
                <span className="text-3xl font-bold text-border group-hover:text-accent transition-colors tabular-nums" aria-hidden="true">0{i + 1}</span>
                <div>
                  <p className="text-sm text-text uppercase font-bold tracking-widest mb-1">{t.description}</p>
                  <div className="flex items-center gap-3">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#2563EB' }}
                    >
                      {t.category}
                    </span>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter tabular-nums">{t.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-bold tabular-nums ${t.type === 'expense' ? 'text-expense' : 'text-success'}`}>
                  {t.type === 'expense' ? '-' : '+'}${t.amount.toLocaleString()}
                </p>
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{t.type}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
