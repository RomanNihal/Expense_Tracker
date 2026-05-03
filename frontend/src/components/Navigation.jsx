import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Wallet, History } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 3rem',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'white' }}>
          <div style={{ padding: '0.5rem', background: 'var(--primary)', borderRadius: '0.75rem' }}>
            <Wallet color="white" size={24} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>SPENDO</h1>
        </Link>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/" style={{ 
            color: location.pathname === '/' ? 'white' : 'var(--text-muted)', 
            background: location.pathname === '/' ? 'rgba(255,255,255,0.05)' : 'transparent',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none', 
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}>
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link to="/transactions" style={{ 
            color: location.pathname === '/transactions' ? 'white' : 'var(--text-muted)', 
            background: location.pathname === '/transactions' ? 'rgba(255,255,255,0.05)' : 'transparent',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            textDecoration: 'none', 
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}>
            <History size={18} />
            Wallet
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '1.5rem', borderRight: '1px solid var(--glass-border)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
            {user?.firstName?.charAt(0) || 'U'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Hello,</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.firstName || 'User'}</div>
          </div>
        </div>
        <button onClick={logout} style={{ 
          background: 'none', 
          border: 'none', 
          color: 'var(--danger)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          fontSize: '0.9rem',
          padding: '0.5rem'
        }}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </nav>

  );
};

export default Navigation;
