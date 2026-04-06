import React, { useState, useEffect, useMemo } from 'react';
import { api, FinancialRecord } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Trash2,
  X,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../components/Modal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORY_COLORS: { [key: string]: string } = {
  'Food': '#F43F5E',
  'Salary': '#10B981',
  'Rent': '#6366F1',
  'Utilities': '#F59E0B',
  'Entertainment': '#A855F7',
  'Transport': '#2DD4BF',
  'Shopping': '#FB923C'
};

export const Records: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  
  // Filters
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const data = await api.getRecords();
    setRecords(data);
    setLoading(false);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesCategory = !filterCategory || r.category === filterCategory;
      const matchesSearch = !searchQuery || r.description.toLowerCase().includes(searchQuery.toLowerCase()) || r.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [records, filterType, filterCategory, searchQuery]);

  const categories = useMemo(() => {
    return Array.from(new Set(records.map(r => r.category)));
  }, [records]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount || isNaN(Number(formData.amount))) newErrors.amount = 'Valid amount required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const recordData = {
      ...formData,
      amount: Number(formData.amount),
      createdBy: user?.uid || 'unknown',
    };

    if (editingRecord) {
      await api.updateRecord(editingRecord.id, recordData);
    } else {
      await api.createRecord(recordData);
    }

    setShowDrawer(false);
    setEditingRecord(null);
    setFormData({ amount: '', type: 'expense', category: '', date: new Date().toISOString().split('T')[0], description: '' });
    fetchRecords();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecordToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (recordToDelete) {
      await api.deleteRecord(recordToDelete);
      fetchRecords();
      setRecordToDelete(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]" role="status" aria-label="Loading records">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" aria-hidden="true" />
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] animate-pulse">FETCHING ARCHIVE DATA...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 relative">
      <header className="flex justify-between items-end border-b border-border pb-8">
        <div>
          <h2 className="text-3xl font-bold text-text tracking-tight uppercase" id="page-title">Financial Records</h2>
          <p className="text-xs font-bold text-muted uppercase tracking-widest mt-2" aria-live="polite">ARCHIVE / <span className="tabular-nums">{filteredRecords.length}</span> ENTRIES FOUND</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowDrawer(true)}
            className="bg-accent text-white font-bold text-xs px-8 py-4 rounded-2xl shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all uppercase flex items-center gap-2 outline-none focus:ring-2 focus:ring-accent/20"
            aria-label="Create new financial record"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            NEW RECORD
          </button>
        )}
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface p-6 rounded-2xl card-shadow" role="search" aria-label="Filter records">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
          <input 
            type="text" 
            placeholder="SEARCH..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-xs font-bold focus:border-accent outline-none uppercase tracking-widest focus:ring-2 focus:ring-accent/10"
            aria-label="Search records by description or category"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
          <select 
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
            className="w-full pl-10 pr-4 py-3 bg-bg border border-border rounded-xl text-xs font-bold focus:border-accent outline-none uppercase tracking-widest appearance-none focus:ring-2 focus:ring-accent/10"
            aria-label="Filter by transaction type"
          >
            <option value="all">ALL TYPES</option>
            <option value="income">INCOME</option>
            <option value="expense">EXPENSE</option>
          </select>
        </div>
        <select 
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-bg border border-border rounded-xl text-xs font-bold focus:border-accent outline-none uppercase tracking-widest focus:ring-2 focus:ring-accent/10"
          aria-label="Filter by category"
        >
          <option value="">ALL CATEGORIES</option>
          {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
        </select>
        <div className="flex items-center justify-end gap-4" role="navigation" aria-label="Pagination">
          <button className="p-3 bg-bg border border-border rounded-xl hover:border-accent transition-colors outline-none focus:ring-2 focus:ring-accent/10" aria-label="Previous page">
            <ArrowLeft className="w-4 h-4 text-muted" aria-hidden="true" />
          </button>
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">PAGE 01 / 01</span>
          <button className="p-3 bg-bg border border-border rounded-xl hover:border-accent transition-colors outline-none focus:ring-2 focus:ring-accent/10" aria-label="Next page">
            <ArrowRight className="w-4 h-4 text-muted" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl card-shadow overflow-hidden">
        <table className="w-full text-left font-mono text-xs border-collapse" aria-labelledby="page-title">
          <caption className="sr-only">List of financial records with date, category, type, and amount</caption>
          <thead>
            <tr className="border-b border-border text-muted uppercase tracking-widest bg-bg/20">
              <th className="px-6 py-4 font-bold w-12" aria-hidden="true"></th>
              <th className="px-6 py-4 font-bold" scope="col">DATE</th>
              <th className="px-6 py-4 font-bold" scope="col">CATEGORY</th>
              <th className="px-6 py-4 font-bold" scope="col">TYPE</th>
              <th className="px-6 py-4 font-bold text-right" scope="col">AMOUNT</th>
              {user?.role === 'admin' && <th className="px-6 py-4 font-bold text-right" scope="col">ACTIONS</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRecords.map((record) => (
              <React.Fragment key={record.id}>
                <tr 
                  onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedRow(expandedRow === record.id ? null : record.id);
                    }
                  }}
                  className="hover:bg-bg/10 transition-colors cursor-pointer group outline-none focus:bg-bg/20"
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedRow === record.id}
                  aria-label={`Record from ${record.date}, category ${record.category}, amount ${record.amount}. Click to expand details.`}
                >
                  <td className="px-6 py-4 text-center">
                    {expandedRow === record.id ? <ChevronUp className="w-4 h-4 text-accent" aria-hidden="true" /> : <ChevronDown className="w-4 h-4 text-muted" aria-hidden="true" />}
                  </td>
                  <td className="px-6 py-4 text-muted tabular-nums font-bold">{record.date}</td>
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
                    {record.type === 'expense' ? '-' : '+'}${record.amount.toFixed(2)}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRecord(record);
                            setFormData({
                              amount: record.amount.toString(),
                              type: record.type,
                              category: record.category,
                              date: record.date,
                              description: record.description
                            });
                            setShowDrawer(true);
                          }}
                          className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all outline-none focus:ring-2 focus:ring-accent/20"
                          aria-label={`Edit record from ${record.date}`}
                        >
                          <Edit2 className="w-3 h-3" aria-hidden="true" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(record.id, e)}
                          className="p-2 bg-expense/10 text-expense rounded-lg hover:bg-expense hover:text-white transition-all outline-none focus:ring-2 focus:ring-expense/20"
                          aria-label={`Delete record from ${record.date}`}
                        >
                          <Trash2 className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
                {expandedRow === record.id && (
                  <tr className="bg-bg/30 border-l-4 border-accent">
                    <td colSpan={user?.role === 'admin' ? 6 : 5} className="px-12 py-8">
                      <div className="grid grid-cols-2 gap-12" role="region" aria-label="Record details">
                        <div>
                          <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">DESCRIPTION</h4>
                          <p className="text-sm text-text leading-relaxed font-sans">{record.description || 'NO DESCRIPTION PROVIDED'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">CREATED BY</h4>
                            <p className="text-[11px] text-text font-bold uppercase bg-bg px-3 py-1 rounded-lg inline-block">{record.createdBy}</p>
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">TIMESTAMP</h4>
                            <p className="text-[11px] text-text font-bold uppercase tabular-nums bg-bg px-3 py-1 rounded-lg inline-block">{new Date(record.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-in Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-text/20 backdrop-blur-md z-[60]"
              aria-hidden="true"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface z-[70] p-12 shadow-2xl flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="drawer-title"
            >
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="text-2xl font-bold text-text uppercase tracking-tight" id="drawer-title">
                    {editingRecord ? 'Edit Entry' : 'New Entry'}
                  </h3>
                  <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">FISCAL DOCUMENTATION</p>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)} 
                  className="p-2 hover:bg-bg rounded-xl transition-all text-muted hover:text-expense outline-none focus:ring-2 focus:ring-expense/20"
                  aria-label="Close drawer"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 flex-1 overflow-y-auto pr-2">
                <div className="space-y-3">
                  <label htmlFor="amount" className="text-[10px] font-bold text-muted uppercase tracking-widest">AMOUNT</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold" aria-hidden="true">$</span>
                    <input 
                      id="amount"
                      type="number" 
                      step="0.01"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className={cn(
                        "w-full bg-bg border border-border p-4 rounded-2xl text-lg font-bold tabular-nums focus:border-accent outline-none transition-all focus:ring-2 focus:ring-accent/10",
                        errors.amount && "border-expense bg-expense/5"
                      )}
                      placeholder="0.00"
                      aria-invalid={!!errors.amount}
                      aria-describedby={errors.amount ? "amount-error" : undefined}
                      required
                    />
                  </div>
                  {errors.amount && <p className="text-[10px] font-bold text-expense uppercase tracking-widest" id="amount-error" role="alert">{errors.amount}</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">TYPE</label>
                  <div className="flex gap-4" role="radiogroup" aria-label="Transaction Type">
                    {['income', 'expense'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, type: type as any})}
                        className={cn(
                          "flex-1 py-4 rounded-2xl border-2 text-[10px] font-bold uppercase tracking-widest transition-all outline-none focus:ring-2 focus:ring-accent/20",
                          formData.type === type 
                            ? (type === 'income' ? "bg-success border-success text-white shadow-lg shadow-success/30" : "bg-expense border-expense text-white shadow-lg shadow-expense/30")
                            : "border-border text-muted hover:border-accent"
                        )}
                        role="radio"
                        aria-checked={formData.type === type}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="category" className="text-[10px] font-bold text-muted uppercase tracking-widest">CATEGORY</label>
                  <input 
                    id="category"
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className={cn(
                      "w-full bg-bg border border-border p-4 rounded-2xl text-sm font-bold focus:border-accent outline-none uppercase transition-all focus:ring-2 focus:ring-accent/10",
                      errors.category && "border-expense bg-expense/5"
                    )}
                    placeholder="E.G. SALARY, FOOD, RENT"
                    aria-invalid={!!errors.category}
                    aria-describedby={errors.category ? "category-error" : undefined}
                    required
                  />
                  {errors.category && <p className="text-[10px] font-bold text-expense uppercase tracking-widest" id="category-error" role="alert">{errors.category}</p>}
                </div>

                <div className="space-y-3">
                  <label htmlFor="date" className="text-[10px] font-bold text-muted uppercase tracking-widest">DATE</label>
                  <input 
                    id="date"
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className={cn(
                      "w-full bg-bg border border-border p-4 rounded-2xl text-sm font-bold focus:border-accent outline-none transition-all focus:ring-2 focus:ring-accent/10",
                      errors.date && "border-expense bg-expense/5"
                    )}
                    aria-invalid={!!errors.date}
                    aria-describedby={errors.date ? "date-error" : undefined}
                    required
                  />
                  {errors.date && <p className="text-[10px] font-bold text-expense uppercase tracking-widest" id="date-error" role="alert">{errors.date}</p>}
                </div>

                <div className="space-y-3">
                  <label htmlFor="description" className="text-[10px] font-bold text-muted uppercase tracking-widest">NOTES</label>
                  <textarea 
                    id="description"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-bg border border-border p-4 rounded-2xl text-sm font-bold focus:border-accent outline-none h-32 resize-none transition-all focus:ring-2 focus:ring-accent/10"
                    placeholder="ADDITIONAL DETAILS..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-accent text-white font-bold text-xs py-5 rounded-2xl shadow-xl shadow-accent/30 hover:bg-accent/90 transition-all uppercase mt-4 outline-none focus:ring-2 focus:ring-accent/20"
                >
                  {editingRecord ? 'UPDATE ENTRY' : 'COMMIT ENTRY'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Record"
        message="Are you sure you want to permanently remove this financial record? This action cannot be undone."
        confirmText="DELETE ENTRY"
        cancelText="KEEP ENTRY"
        type="danger"
      />
    </div>
  );
};
