import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Wallet } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: 'var(--glass)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Wallet color="var(--primary)" size={32} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Spendo</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Welcome back,</div>
          <div style={{ fontWeight: 600 }}>{user?.firstName || 'User'}</div>
        </div>
        <button className="btn btn-outline" onClick={logout} style={{ padding: '0.5rem 1rem' }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
