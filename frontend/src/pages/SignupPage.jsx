import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign up');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '45vw', height: '45vw', maxWidth: '500px', maxHeight: '500px', background: 'var(--primary)', filter: 'blur(140px)', opacity: 0.1, pointerEvents: 'none', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '35vw', height: '35vw', maxWidth: '400px', maxHeight: '400px', background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.08, pointerEvents: 'none', borderRadius: '50%' }} />

      <div className="animate-fade-in w-full max-w-md" style={{ position: 'relative', zIndex: 10 }}>
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
          <h1 style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>Create account</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Start tracking your finances with Spendo</p>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{ padding: '0.625rem 0.875rem', marginBottom: '1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--danger-subtle)', color: 'var(--danger)', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'center', border: '1px solid hsla(0,84%,60%,0.15)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">First name</label>
                <input type="text" className="input-field" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required />
              </div>
              <div className="input-group">
                <label className="input-label">Last name</label>
                <input type="text" className="input-field" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" className="input-field" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input type="password" className="input-field" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.75rem', padding: '0.75rem', fontSize: '0.9375rem' }}>
              Get Started <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted" style={{ marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
