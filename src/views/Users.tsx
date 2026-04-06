import React, { useState, useEffect } from 'react';
import { api, UserProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  MoreVertical, 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ROLE_COLORS: { [key: string]: string } = {
  'admin': '#6366F1',
  'analyst': '#F59E0B',
  'viewer': '#2DD4BF'
};

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await api.getUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleStatusToggle = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    // Optimistic UI update
    setUsers(users.map(u => u.uid === uid ? { ...u, status: newStatus as any } : u));
    await api.updateUser(uid, { status: newStatus as any });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]" role="status" aria-label="Loading user profiles">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" aria-hidden="true" />
        <p className="text-[10px] font-bold text-muted uppercase tracking-[0.3em] animate-pulse">SYNCHRONIZING ACCESS LISTS...</p>
      </div>
    </div>
  );

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center bg-surface rounded-2xl card-shadow m-8">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-expense/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-expense" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-4 uppercase tracking-widest">Access Denied</h2>
          <p className="text-muted text-sm leading-relaxed mb-8">
            User management is restricted to administrative personnel. 
            Your current role ({currentUser?.role.toUpperCase()}) does not grant permission to modify user access lists.
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
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-end border-b border-border pb-8">
        <div>
          <h2 className="text-3xl font-bold text-text tracking-tight uppercase" id="page-title">User Management</h2>
          <p className="text-xs font-bold text-muted uppercase tracking-widest mt-2" aria-live="polite">ACCESS CONTROL / <span className="tabular-nums">{users.length}</span> ACTIVE PROFILES</p>
        </div>
        <button 
          onClick={() => setShowDrawer(true)}
          className="bg-accent text-white font-bold text-xs px-8 py-4 rounded-2xl shadow-lg shadow-accent/30 hover:bg-accent/90 transition-all uppercase flex items-center gap-2 outline-none focus:ring-2 focus:ring-accent/20"
          aria-label="Invite new user"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          INVITE USER
        </button>
      </header>

      <div className="bg-surface rounded-2xl card-shadow overflow-hidden">
        <table className="w-full text-left font-mono text-xs border-collapse" aria-labelledby="page-title">
          <caption className="sr-only">List of users with name, email, role, and status</caption>
          <thead>
            <tr className="border-b border-border text-muted uppercase tracking-widest bg-bg/20">
              <th className="px-6 py-4 font-bold" scope="col">NAME</th>
              <th className="px-6 py-4 font-bold" scope="col">EMAIL</th>
              <th className="px-6 py-4 font-bold" scope="col">ROLE</th>
              <th className="px-6 py-4 font-bold" scope="col">STATUS</th>
              <th className="px-6 py-4 font-bold text-right" scope="col">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.uid} className="hover:bg-bg/10 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: ROLE_COLORS[u.role] }}
                      aria-hidden="true"
                    >
                      {u.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-text font-bold uppercase tracking-tight">{u.displayName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted lowercase tracking-normal font-bold">{u.email}</td>
                <td className="px-6 py-4">
                  <span 
                    className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white"
                    style={{ backgroundColor: ROLE_COLORS[u.role] }}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleStatusToggle(u.uid, u.status)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-1.5 rounded-full border-2 transition-all font-bold outline-none focus:ring-2 focus:ring-accent/10",
                      u.status === 'active' 
                        ? "border-success/20 bg-success/5 text-success" 
                        : "border-muted/20 bg-muted/5 text-muted"
                    )}
                    aria-label={`Toggle status for ${u.displayName}. Current status: ${u.status}`}
                  >
                    <div className={cn("w-2 h-2 rounded-full", u.status === 'active' ? "bg-success animate-pulse" : "bg-muted")} aria-hidden="true" />
                    <span className="text-[10px] uppercase tracking-widest">{u.status}</span>
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingUser(u); setShowDrawer(true); }}
                      className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all outline-none focus:ring-2 focus:ring-accent/20"
                      aria-label={`Edit user ${u.displayName}`}
                    >
                      <Edit2 className="w-3 h-3" aria-hidden="true" />
                    </button>
                    <button 
                      className="p-2 bg-expense/10 text-expense rounded-lg hover:bg-expense hover:text-white transition-all outline-none focus:ring-2 focus:ring-expense/20"
                      aria-label={`Delete user ${u.displayName}`}
                    >
                      <Trash2 className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite/Edit Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowDrawer(false); setEditingUser(null); }}
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
                    {editingUser ? 'Edit Profile' : 'Invite Personnel'}
                  </h3>
                  <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">ACCESS CONTROL PROTOCOL</p>
                </div>
                <button 
                  onClick={() => { setShowDrawer(false); setEditingUser(null); }} 
                  className="p-2 hover:bg-bg rounded-xl transition-all text-muted hover:text-expense outline-none focus:ring-2 focus:ring-expense/20"
                  aria-label="Close drawer"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <form className="space-y-8 flex-1 overflow-y-auto pr-2">
                <div className="space-y-3">
                  <label htmlFor="displayName" className="text-[10px] font-bold text-muted uppercase tracking-widest">DISPLAY NAME</label>
                  <input 
                    id="displayName"
                    type="text" 
                    defaultValue={editingUser?.displayName}
                    className="w-full bg-bg border border-border p-4 rounded-2xl text-sm font-bold focus:border-accent outline-none uppercase transition-all focus:ring-2 focus:ring-accent/10"
                    placeholder="FULL NAME"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label htmlFor="email" className="text-[10px] font-bold text-muted uppercase tracking-widest">EMAIL ADDRESS</label>
                  <input 
                    id="email"
                    type="email" 
                    defaultValue={editingUser?.email}
                    className="w-full bg-bg border border-border p-4 rounded-2xl text-sm font-bold focus:border-accent outline-none transition-all focus:ring-2 focus:ring-accent/10"
                    placeholder="EMAIL@MYLEDGER.COM"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest">ACCESS LEVEL</label>
                  <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Select Access Level">
                    {['admin', 'analyst', 'viewer'].map(role => (
                      <button
                        key={role}
                        type="button"
                        className={cn(
                          "w-full py-5 rounded-2xl border-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-between px-6 outline-none focus:ring-2 focus:ring-accent/20",
                          (editingUser?.role || 'viewer') === role 
                            ? "bg-accent border-accent text-white shadow-lg shadow-accent/30" 
                            : "border-border text-muted hover:border-accent"
                        )}
                        role="radio"
                        aria-checked={(editingUser?.role || 'viewer') === role}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ROLE_COLORS[role] }} aria-hidden="true" />
                          {role}
                        </div>
                        {(editingUser?.role || 'viewer') === role && <ShieldCheck className="w-5 h-5" aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => { setShowDrawer(false); setEditingUser(null); }}
                  className="w-full bg-accent text-white font-bold text-xs py-5 rounded-2xl shadow-xl shadow-accent/30 hover:bg-accent/90 transition-all uppercase mt-4 outline-none focus:ring-2 focus:ring-accent/20"
                >
                  {editingUser ? 'UPDATE PERMISSIONS' : 'SEND INVITATION'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
