import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, History, PiggyBank, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/',             label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/transactions', label: 'Wallet',    Icon: History },
  { to: '/savings',      label: 'Savings',   Icon: PiggyBank },
];

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Desktop Top Bar */}
      <nav className="top-nav">
        <div className="flex items-center gap-8">
          <Link to="/" className="nav-logo">
            <span className="nav-logo-icon">
              <Wallet size={18} color="white" />
            </span>
            SPENDO
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link${location.pathname === to ? ' active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="nav-user">
          <div className="flex items-center gap-3">
            <div className="nav-avatar">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="text-xs" style={{ fontSize: '0.625rem', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: '1px' }}>Welcome back</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.firstName || 'User'}</div>
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 0.375rem' }} />
          <button onClick={logout} className="nav-logout">
            <LogOut size={15} />
            <span className="desktop-only">Log out</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="bottom-nav">
        {navLinks.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className={`nav-item-mobile${location.pathname === to ? ' active' : ''}`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
        <button onClick={logout} className="nav-item-mobile" style={{ color: 'var(--danger)' }}>
          <LogOut size={20} />
          Exit
        </button>
      </nav>
    </>
  );
};

export default Navigation;
