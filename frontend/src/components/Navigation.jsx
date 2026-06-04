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
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 2rem',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Logo + desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'white' }}>
            <div style={{ padding: '0.5rem', background: 'var(--primary)', borderRadius: '0.75rem' }}>
              <Wallet color="white" size={22} />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>SPENDO</span>
          </Link>

          {/* Desktop nav links — hidden on mobile via CSS */}
          <div className="nav-links" style={{ display: 'flex', gap: '0.5rem' }}>
            {navLinks.map(({ to, label, Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to} style={{
                  color: active ? 'white' : 'var(--text-muted)',
                  background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
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
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User info + logout — hidden on mobile via CSS */}
        <div className="nav-user-block" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', paddingRight: '1.5rem', borderRight: '1px solid var(--glass-border)' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
              {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Hello,</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.firstName || 'User'}</div>
            </div>
          </div>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem' }}>
            <LogOut size={17} />
            Logout
          </button>
        </div>

        {/* Mobile: just show logout icon */}
        <button
          onClick={logout}
          style={{ display: 'none' }}
          className="mobile-logout"
          title="Logout"
        >
          <LogOut size={20} color="var(--danger)" />
        </button>
      </nav>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="bottom-nav">
        {navLinks.map(({ to, label, Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} className={active ? 'active' : ''}>
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
        <button
          onClick={logout}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.65rem', fontWeight: 600, padding: '0.5rem 1rem', flex: 1 }}
        >
          <LogOut size={22} />
          Logout
        </button>
      </nav>
    </>
  );
};

export default Navigation;
