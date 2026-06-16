import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Wallet, History, PiggyBank } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/',            label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/transactions', label: 'Wallet',    Icon: History },
  { to: '/savings',     label: 'Savings',   Icon: PiggyBank },
];

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* ── Top bar ── */}
      <nav 
        className="flex justify-between items-center p-4 desktop-only"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--glass-border)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Logo + desktop links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="p-2" style={{ background: 'var(--primary)', borderRadius: '0.75rem' }}>
              <Wallet color="white" size={22} />
            </div>
            <span className="text-h3" style={{ letterSpacing: '-0.02em', margin: 0 }}>SPENDO</span>
          </Link>

          {/* Desktop nav links */}
          <div className="flex gap-2">
            {navLinks.map(({ to, label, Icon }) => {
              const active = location.pathname === to;
              return (
                <Link 
                  key={to} 
                  to={to} 
                  className="flex items-center gap-2 text-sm"
                  style={{
                    color: active ? 'white' : 'var(--text-muted)',
                    background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3" style={{ paddingRight: '1.5rem', borderRight: '1px solid var(--glass-border)' }}>
            <div 
              className="flex items-center justify-center text-sm"
              style={{ 
                width: '34px', height: '34px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', 
                fontWeight: 700, flexShrink: 0 
              }}
            >
              {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-xs text-muted" style={{ fontWeight: 500 }}>Hello,</div>
              <div className="text-sm text-white" style={{ fontWeight: 600 }}>{user?.firstName || 'User'}</div>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-danger" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="bottom-nav">
        {navLinks.map(({ to, label, Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} className={`nav-item-mobile ${active ? 'active' : ''}`}>
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
        <button onClick={logout} className="nav-item-mobile text-danger" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogOut size={22} />
          Logout
        </button>
      </nav>
    </>
  );
};

export default Navigation;
