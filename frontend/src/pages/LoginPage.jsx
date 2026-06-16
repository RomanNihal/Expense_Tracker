import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: '-15%', left: '-5%', width: '45vw', height: '45vw', maxWidth: '500px', maxHeight: '500px', background: 'var(--primary)', filter: 'blur(140px)', opacity: 0.1, pointerEvents: 'none', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '35vw', height: '35vw', maxWidth: '400px', maxHeight: '400px', background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none', borderRadius: '50%' }} />

      <div className="animate-fade-in w-full max-w-md" style={{ position: 'relative', zIndex: 10 }}>
        {/* Logo + Heading */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div style={{
              width: 56, height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-primary)',
            }}>
              <Wallet size={26} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>Welcome back</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Sign in to your Spendo account</p>
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ padding: '0.625rem 0.875rem', marginBottom: '1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--danger-subtle)', color: 'var(--danger)', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'center', border: '1px solid hsla(0,84%,60%,0.15)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.75rem', padding: '0.75rem', fontSize: '0.9375rem' }}>
              Sign In <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted" style={{ marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 700 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
