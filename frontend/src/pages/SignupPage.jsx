import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to signup');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.15, pointerEvents: 'none', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'var(--accent)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none', borderRadius: '50%' }}></div>

      <div className="glass-card animate-fade-in w-full max-w-md" style={{ position: 'relative', zIndex: 10 }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl" style={{ background: 'var(--primary-light)' }}>
              <UserPlus size={40} className="text-primary" />
            </div>
          </div>
          <h2 className="text-h2 mb-2">Create Account</h2>
          <p className="text-muted">Start your financial journey today</p>
        </div>

        {error && <div className="p-3 mb-6 rounded-lg text-center text-sm font-semibold" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label">First Name</label>
              <input 
                type="text" 
                className="input-field"
                name="firstName"
                value={formData.firstName} 
                onChange={handleChange} 
                placeholder="John"
                required 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Last Name</label>
              <input 
                type="text" 
                className="input-field"
                name="lastName"
                value={formData.lastName} 
                onChange={handleChange} 
                placeholder="Doe"
                required 
              />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className="input-field"
              name="email"
              value={formData.email} 
              onChange={handleChange} 
              placeholder="john@example.com"
              required 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field"
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-4 py-3 text-lg">
            Get Started
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
