import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Table as TableIcon, 
  Users as UsersIcon, 
  TrendingUp, 
  LogOut,
  User as UserIcon,
  Wallet
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'DASHBOARD', path: '/', icon: LayoutDashboard, roles: ['admin', 'analyst', 'viewer'], color: 'text-accent' },
    { label: 'RECORDS', path: '/records', icon: TableIcon, roles: ['admin', 'analyst', 'viewer'], color: 'text-cat-rose' },
    { label: 'INSIGHTS', path: '/insights', icon: TrendingUp, roles: ['admin', 'analyst'], color: 'text-cat-amber' },
    { label: 'USERS', path: '/users', icon: UsersIcon, roles: ['admin'], color: 'text-cat-indigo' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-surface border-r border-border flex flex-col z-50 shadow-xl" aria-label="Sidebar Navigation">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/30" aria-hidden="true">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-text tracking-tight uppercase">My Ledger</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4" aria-label="Main Navigation">
        {navItems.map((item) => {
          if (user && !item.roles.includes(user.role)) return null;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-widest transition-all rounded-xl",
                isActive 
                  ? "text-accent bg-accent/5 shadow-sm" 
                  : "text-muted hover:text-text hover:bg-bg"
              )}
              aria-label={item.label}
            >
              <item.icon className={cn("w-5 h-5", item.color)} aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border bg-bg/30">
        <div className="flex items-center gap-3 mb-6 p-3 bg-surface rounded-2xl shadow-sm" role="region" aria-label="User Profile">
          <div className="w-10 h-10 bg-cat-indigo/10 rounded-xl flex items-center justify-center border border-cat-indigo/20" aria-hidden="true">
            <UserIcon className="w-5 h-5 text-cat-indigo" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-text truncate uppercase">{user?.displayName}</p>
            <span className="text-[9px] font-bold text-success uppercase tracking-tighter bg-success/10 px-2 py-0.5 rounded-full">
              {user?.role}
            </span>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold text-muted hover:text-expense hover:bg-expense/5 rounded-xl transition-all uppercase tracking-widest focus:ring-2 focus:ring-expense/20 outline-none"
          aria-label="Logout from application"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          LOGOUT
        </button>
      </div>
    </aside>
  );
};
