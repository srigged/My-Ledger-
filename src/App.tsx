import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { Records } from './views/Records';
import { Users } from './views/Users';
import { Insights } from './views/Insights';
import { motion, AnimatePresence } from 'motion/react';

import { Sun, Moon } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'DASHBOARD OVERVIEW';
    if (path === '/records') return 'FINANCIAL ARCHIVE';
    if (path === '/users') return 'ACCESS CONTROL';
    if (path === '/insights') return 'ANALYTICAL INSIGHTS';
    return 'MY LEDGER';
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-10 bg-surface/80 backdrop-blur-md sticky top-0 z-40 shadow-sm" role="banner">
      <div className="flex items-center gap-4">
        <div className="w-1 h-4 bg-accent rounded-full" aria-hidden="true" />
        <h2 className="text-[11px] font-bold text-muted uppercase tracking-[0.3em]" id="header-title">{getTitle()}</h2>
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-bg rounded-xl transition-all text-muted hover:text-accent outline-none focus:ring-2 focus:ring-accent/20 border border-transparent hover:border-border"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest">DARK MODE</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest">LIGHT MODE</span>
            </>
          )}
        </button>
        <div 
          className="text-[11px] font-bold text-muted uppercase tracking-widest bg-bg px-4 py-1.5 rounded-full border border-border tabular-nums"
          aria-label={`Current date and time: ${time.toLocaleString()}`}
        >
          {time.toLocaleDateString()} <span className="mx-2 text-border" aria-hidden="true">|</span> {time.toLocaleTimeString()}
        </div>
      </div>
    </header>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-bg text-text font-sans">
      <Sidebar />
      <main className="flex-1 ml-[240px] relative" id="main-content" role="main">
        <Header />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            aria-labelledby="header-title"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-accent focus:text-white focus:rounded-xl focus:font-bold focus:text-xs focus:uppercase focus:tracking-widest focus:shadow-2xl"
          >
            Skip to main content
          </a>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/records" element={
                <ProtectedRoute>
                  <Records />
                </ProtectedRoute>
              } />
              
              <Route path="/insights" element={
                <ProtectedRoute allowedRoles={['admin', 'analyst']}>
                  <Insights />
                </ProtectedRoute>
              } />
              
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Users />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
