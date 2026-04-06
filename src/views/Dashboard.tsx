import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { api, DashboardSummary, FinancialRecord } from '../api';
import { cn, formatCurrency } from '../lib/utils';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Brush,
  ReferenceArea
} from 'recharts';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Activity,
  PieChart as PieChartIcon,
  RotateCcw
} from 'lucide-react';

const KPI_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 }
  })
};

const CATEGORY_COLORS: { [key: string]: string } = {
  'Food': '#F43F5E',
  'Salary': '#10B981',
  'Rent': '#6366F1',
  'Utilities': '#F59E0B',
  'Entertainment': '#A855F7',
  'Transport': '#2DD4BF',
  'Shopping': '#FB923C'
};

export const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentRecords, setRecentRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Zoom State
  const [refAreaLeft, setRefAreaLeft] = useState<string>('');
  const [refAreaRight, setRefAreaRight] = useState<string>('');
  const [left, setLeft] = useState<string | number>('dataMin');
  const [right, setRight] = useState<string | number>('dataMax');

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#F1F5F9';
  const tickColor = isDark ? '#94A3B8' : '#64748B';
  const tooltipBg = isDark ? '#1E293B' : '#FFFFFF';
  const tooltipText = isDark ? '#F8FAFC' : '#0F172A';

  useEffect(() => {
    const fetchData = async () => {
      const [sum, recs] = await Promise.all([api.getSummary(), api.getRecords()]);
      setSummary(sum);
      setRecentRecords(recs.slice(0, 10));
      setLoading(false);
    };
    fetchData();
  }, []);

  const zoom = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }

    // Ensure left is always before right
    let [l, r] = [refAreaLeft, refAreaRight];
    if (summary && summary.trends.findIndex(t => t.month === l) > summary.trends.findIndex(t => t.month === r)) {
      [l, r] = [r, l];
    }

    setLeft(l);
    setRight(r);
    setRefAreaLeft('');
    setRefAreaRight('');
  };

  const zoomOut = () => {
    setLeft('dataMin');
    setRight('dataMax');
    setRefAreaLeft('');
    setRefAreaRight('');
  };

  if (loading || !summary) return (
    <div className="flex items-center justify-center h-[60vh]" role="status" aria-label="Loading dashboard data">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" aria-hidden="true" />
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] animate-pulse">AGGREGATING FISCAL DATA...</p>
      </div>
    </div>
  );

  const kpis = [
    { label: 'TOTAL INCOME', value: summary.totalIncome, trend: '+12.5%', isUp: true, icon: ArrowUpCircle, color: 'text-success', bg: 'bg-success/10' },
    { label: 'TOTAL EXPENSES', value: summary.totalExpenses, trend: '-4.2%', isUp: false, icon: ArrowDownCircle, color: 'text-expense', bg: 'bg-expense/10' },
    { label: 'NET BALANCE', value: summary.netBalance, trend: '+8.1%', isUp: true, icon: Wallet, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'TRANSACTIONS', value: summary.transactionCount, trend: '+15%', isUp: true, isCount: true, icon: Activity, color: 'text-cat-purple', bg: 'bg-cat-purple/10' },
  ];

  return (
    <div className="p-8 space-y-12 staggered-fade-in relative">
      {/* KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10" role="region" aria-label="Key Performance Indicators">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={KPI_VARIANTS}
            className="bg-surface rounded-2xl card-shadow p-6 group hover:translate-y-[-4px] transition-all duration-300"
            role="status"
            aria-label={`${kpi.label}: ${kpi.isCount ? '' : '$'}${kpi.value.toLocaleString()}, Trend: ${kpi.trend}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`} aria-hidden="true">
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <span className={`text-[10px] font-bold tabular-nums px-2 py-1 rounded-full ${kpi.isUp ? 'bg-success/10 text-success' : 'bg-expense/10 text-expense'}`}>
                <span className="sr-only">{kpi.isUp ? 'Increased by' : 'Decreased by'}</span>
                {kpi.isUp ? '▲' : '▼'} {kpi.trend}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{kpi.label}</span>
              <div className={cn(
                "tabular-nums text-text tracking-tight",
                "text-[22px]",
                kpi.isCount ? "font-normal" : "font-bold"
              )}>
                {kpi.isCount ? kpi.value.toLocaleString() : formatCurrency(kpi.value)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-surface rounded-2xl card-shadow p-8"
        >
          <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" aria-hidden="true" />
              <h3 className="text-xs font-bold text-muted uppercase tracking-[0.2em]" id="trend-chart-title">TREND ANALYSIS / 6 MONTHS</h3>
            </div>
            {left !== 'dataMin' && (
              <button 
                onClick={zoomOut}
                className="flex items-center gap-2 px-3 py-1 bg-bg hover:bg-border rounded-lg text-[9px] font-bold text-muted uppercase tracking-widest transition-all outline-none focus:ring-2 focus:ring-accent/20"
              >
                <RotateCcw className="w-3 h-3" />
                RESET ZOOM
              </button>
            )}
          </div>
          <div className="h-[300px]" role="img" aria-labelledby="trend-chart-title">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={summary.trends} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                onMouseDown={(e) => e && setRefAreaLeft(String(e.activeLabel || ''))}
                onMouseMove={(e) => refAreaLeft && e && setRefAreaRight(String(e.activeLabel || ''))}
                onMouseUp={zoom}
              >
                <desc>Interactive line chart showing income and expense trends. Click and drag to zoom, or use the slider below to pan.</desc>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: tickColor, fontFamily: 'DM Mono' }} 
                  domain={[left, right]}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: tickColor, fontFamily: 'DM Mono' }} 
                  tickFormatter={(value) => formatCurrency(value, 'USD', 'en-US').split('.')[0]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: tooltipBg, 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                    fontFamily: 'DM Mono', 
                    fontSize: '11px',
                    padding: '12px',
                    color: tooltipText
                  }}
                  itemStyle={{ padding: '2px 0', color: tooltipText }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                  cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: isDark ? '#1E293B' : '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#10B981' }} 
                  name="Income" 
                  animationDuration={1500}
                />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#F43F5E" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#F43F5E', strokeWidth: 2, stroke: isDark ? '#1E293B' : '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#F43F5E' }} 
                  name="Expense" 
                  animationDuration={1500}
                />
                <Brush 
                  dataKey="month" 
                  height={30} 
                  stroke="#6366F1" 
                  fill={isDark ? '#334155' : '#F8FAFC'}
                  travellerWidth={10}
                  gap={1}
                />
                {refAreaLeft && refAreaRight ? (
                  <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#6366F1" fillOpacity={0.1} />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-surface rounded-2xl card-shadow p-8"
        >
          <div className="flex items-center gap-2 mb-8 border-b border-border pb-4">
            <PieChartIcon className="w-4 h-4 text-cat-amber" aria-hidden="true" />
            <h3 className="text-xs font-bold text-muted uppercase tracking-[0.2em]" id="category-chart-title">CATEGORY BREAKDOWN</h3>
          </div>
          <div className="h-[300px]" role="img" aria-labelledby="category-chart-title">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.categoryBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <desc>Bar chart showing spending breakdown by category</desc>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: tooltipText, fontFamily: 'DM Sans', fontWeight: 500 }} 
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: tooltipBg, border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontFamily: 'DM Mono', fontSize: '11px', color: tooltipText }}
                  itemStyle={{ color: tooltipText }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Bar dataKey="value" barSize={12} radius={[0, 6, 6, 0]} name="Amount">
                  {summary.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-surface rounded-2xl card-shadow overflow-hidden"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-bg/30">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cat-indigo" aria-hidden="true" />
            <h3 className="text-xs font-bold text-muted uppercase tracking-[0.2em]" id="recent-activity-title">RECENT ACTIVITY</h3>
          </div>
          <Link 
            to="/records" 
            className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline focus:underline outline-none focus:ring-2 focus:ring-accent/20 px-2 py-1 rounded-lg"
          >
            VIEW ALL RECORDS →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse" aria-labelledby="recent-activity-title">
            <caption className="sr-only">Table of most recent financial transactions</caption>
            <thead>
              <tr className="border-b border-border text-muted uppercase tracking-widest bg-bg/10">
                <th className="px-6 py-4 font-bold" scope="col">DATE</th>
                <th className="px-6 py-4 font-bold" scope="col">DESCRIPTION</th>
                <th className="px-6 py-4 font-bold" scope="col">CATEGORY</th>
                <th className="px-6 py-4 font-bold" scope="col">TYPE</th>
                <th className="px-6 py-4 font-bold text-right" scope="col">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentRecords.map((record) => (
                <tr key={record.id} className="hover:bg-bg/20 transition-colors group">
                  <td className="px-6 py-4 text-muted tabular-nums">{record.date}</td>
                  <td className="px-6 py-4 text-text font-medium group-hover:text-accent transition-colors">{record.description}</td>
                  <td className="px-6 py-4">
                    <span 
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: CATEGORY_COLORS[record.category] || '#2563EB' }}
                    >
                      {record.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${record.type === 'income' ? 'bg-success' : 'bg-expense'}`} aria-hidden="true" />
                      <span className="uppercase font-bold tracking-tighter">{record.type}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold tabular-nums text-lg ${record.type === 'expense' ? 'text-expense' : 'text-success'}`}>
                    {record.type === 'expense' ? '-' : '+'}{formatCurrency(record.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
