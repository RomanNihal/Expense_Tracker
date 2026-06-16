import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Plus,
  Target,
  TrendingDown,
  ArrowUpCircle,
  Wallet,
  Settings,
  PiggyBank
} from 'lucide-react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [incomeForm, setIncomeForm] = useState({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [fixedInc, setFixedInc] = useState({ source: '', amount: '' });
  const [fixedExp, setFixedExp] = useState({ name: '', amount: '' });
  const [dailyExp, setDailyExp] = useState({ name: '', amount: '', date: new Date().toISOString().split('T')[0], type: 'EXPENSE' });
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', targetMonths: '', monthlySavings: '' });

  const fetchData = async () => {
    try {
      const dashRes = await expenseService.getDashboard();
      setData(dashRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFixedIncSubmit = async (e) => {
    e.preventDefault();
    await expenseService.addFixedIncome(fixedInc);
    setFixedInc({ source: '', amount: '' });
    fetchData();
  };

  const handleFixedExpSubmit = async (e) => {
    e.preventDefault();
    await expenseService.addFixedExpense(fixedExp);
    setFixedExp({ name: '', amount: '' });
    fetchData();
  };

  const handleDailySubmit = async (e) => {
    e.preventDefault();
    await expenseService.addTransaction({
      name: dailyExp.name,
      amount: dailyExp.amount,
      expenseDate: dailyExp.date,
      type: dailyExp.type
    });
    setDailyExp({ name: '', amount: '', date: new Date().toISOString().split('T')[0], type: 'EXPENSE' });
    fetchData();
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    const monthlySavings = goalForm.monthlySavings || (parseFloat(goalForm.targetAmount) / parseInt(goalForm.targetMonths));
    await expenseService.addGoal({ ...goalForm, monthlySavings });
    setGoalForm({ name: '', targetAmount: '', targetMonths: '', monthlySavings: '' });
    fetchData();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse flex flex-col items-center">
        <Wallet size={48} className="text-primary mb-4" />
        <p className="text-muted">Calculating your wealth...</p>
      </div>
    </div>
  );

  // Prepare Chart Data
  const chartData = [...data.recentTransactions].reverse().map(t => ({
    date: (t.expenseDate || '').slice(5) || 'N/A',
    amount: parseFloat(t.amount) || 0,
    type: t.type
  }));

  return (
    <div className="container animate-fade-in">
      <header className="mb-8">
        <h1 className="text-h1 mb-2">Dashboard</h1>
        <p className="text-muted text-lg">Welcome back! Here's your financial overview.</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Main Wallet Card */}
        <div className="glass-card lg-col-span-8 lg-row-span-2" style={{ 
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          position: 'relative',
          overflow: 'hidden',
          padding: '2.5rem'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 text-muted mb-2 text-sm font-semibold tracking-wider">
                  <Wallet size={20} />
                  <span>TOTAL WALLET BALANCE</span>
                </div>
                <div className="text-white" style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  ${(data.totalBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right">
                <div className="badge badge-income flex items-center" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                  <ArrowUpCircle size={16} className="mr-2" /> +${(data.monthlyIncome || 0).toFixed(2)} this month
                </div>
              </div>
            </div>

            <div style={{ height: '280px', width: '100%', marginTop: '2rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData || []}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--glass-border)', borderRadius: '0.75rem', boxShadow: 'var(--shadow-lg)' }}
                    itemStyle={{ color: 'white', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Decorative background element */}
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '400px', height: '400px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.15, pointerEvents: 'none' }}></div>
        </div>

        {/* Daily Stats Card */}
        <div className="glass-card lg-col-span-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg" style={{ background: 'var(--danger-light)' }}>
              <TrendingDown size={22} className="text-danger" />
            </div>
            <span className="text-lg">Today's Spending</span>
          </div>
          <div className="text-white mb-4" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            ${(data.todayExpenses || 0).toFixed(2)}
          </div>
          <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Daily Allowance</span>
              <span className="font-semibold text-white">${(data.recommendedDaily || 0).toFixed(2)}</span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: '8px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ 
                width: `${Math.min(100, ((data.todayExpenses || 0) / (data.recommendedDaily || 1)) * 100)}%`, 
                height: '100%', 
                background: data.todayExpenses > data.recommendedDaily ? 'var(--danger)' : 'var(--accent)',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
          </div>
        </div>

        {/* Savings Goal Card */}
        <div className="glass-card lg-col-span-4 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'var(--primary-light)' }}>
                <PiggyBank size={22} className="text-primary" />
              </div>
              <span className="text-lg">Monthly Savings</span>
            </div>
            <Link to="/savings" className="text-xs text-primary hover:text-white transition-colors">
              Manage Vault
            </Link>
          </div>
          
          <div className="text-white mb-1" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            ${(data.monthlySavings || 0).toFixed(2)}
          </div>
          <div className="text-sm text-muted mb-6">
            Combined goal allocation
          </div>

          <div className="grid gap-3 mt-auto">
            {(data.activeGoals || []).slice(0, 3).map(goal => (
              <div key={goal.id} className="flex justify-between items-center text-sm p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-muted">{goal.name}</span>
                <span className="text-white" style={{ fontWeight: 600 }}>${parseFloat(goal.monthlySavings).toFixed(0)}</span>
              </div>
            ))}
            {(!data.activeGoals || data.activeGoals.length === 0) && (
              <div className="text-center py-4 text-muted text-sm">
                No active savings goals.
              </div>
            )}
            {data.activeGoals?.length > 3 && (
              <div className="text-xs text-primary text-center mt-2">
                + {data.activeGoals.length - 3} more goals
              </div>
            )}
          </div>
        </div>


        {/* Log Transaction Form */}
        <div className="glass-card lg-col-span-4">
          <h3 className="flex items-center gap-2 mb-6 text-h3 text-primary">
            <Plus size={24} />
            Log Transaction
          </h3>
          <form onSubmit={handleDailySubmit}>
            <div className="input-group">
              <label className="input-label">Description</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="What was this for?" 
                value={dailyExp.name}
                onChange={(e) => setDailyExp({...dailyExp, name: e.target.value})}
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">Amount</label>
                <input 
                  type="number" 
                  className="input-field"
                  placeholder="0.00" 
                  value={dailyExp.amount}
                  onChange={(e) => setDailyExp({...dailyExp, amount: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input 
                  type="date" 
                  className="input-field"
                  value={dailyExp.date}
                  onChange={(e) => setDailyExp({...dailyExp, date: e.target.value})}
                  required 
                />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Type</label>
              <select 
                className="input-field"
                value={dailyExp.type}
                onChange={(e) => setDailyExp({...dailyExp, type: e.target.value})}
                required
              >
                <option value="EXPENSE" style={{ background: 'var(--surface-color)' }}>Expense</option>
                <option value="INCOME" style={{ background: 'var(--surface-color)' }}>Income</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-4">
              Add Entry
            </button>
          </form>
        </div>

        {/* Fixed Items Setup */}
        <div className="glass-card lg-col-span-4">
          <h3 className="flex items-center gap-2 mb-6 text-h3 text-accent">
            <Settings size={24} />
            Fixed Settings
          </h3>
          <div className="grid gap-6">
            <form onSubmit={handleFixedIncSubmit}>
              <div className="text-xs mb-2 text-muted">ADD FIXED INCOME</div>
              <div className="flex gap-2">
                <input className="input-field flex-1" placeholder="Source" value={fixedInc.source} onChange={(e)=>setFixedInc({...fixedInc, source: e.target.value})} required style={{ padding: '0.6rem' }} />
                <input type="number" className="input-field" placeholder="Amt" value={fixedInc.amount} onChange={(e)=>setFixedInc({...fixedInc, amount: e.target.value})} required style={{ width: '80px', padding: '0.6rem' }} />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}><Plus size={18}/></button>
              </div>
            </form>

            <form onSubmit={handleFixedExpSubmit}>
              <div className="text-xs mb-2 text-muted">ADD FIXED COST</div>
              <div className="flex gap-2">
                <input className="input-field flex-1" placeholder="Name" value={fixedExp.name} onChange={(e)=>setFixedExp({...fixedExp, name: e.target.value})} required style={{ padding: '0.6rem' }} />
                <input type="number" className="input-field" placeholder="Amt" value={fixedExp.amount} onChange={(e)=>setFixedExp({...fixedExp, amount: e.target.value})} required style={{ width: '80px', padding: '0.6rem' }} />
                <button type="submit" className="btn btn-danger" style={{ padding: '0 1rem' }}><Plus size={18}/></button>
              </div>
            </form>

            <div className="mt-2 p-4 rounded-xl text-sm text-muted text-center" style={{ background: 'var(--primary-light)', border: '1px dashed var(--primary)' }}>
              Fixed items are automatically applied on the 1st of every month.
            </div>
          </div>
        </div>

        {/* Goals / Recent Combined Row */}
        <div className="glass-card lg-col-span-4">
          <h3 className="flex items-center gap-2 mb-6 text-h3 text-primary">
            <Target size={24} />
            New Goal
          </h3>
          <form onSubmit={handleGoalSubmit}>
            <div className="input-group">
              <label className="input-label">Goal Name</label>
              <input className="input-field" placeholder="e.g. Dream Vacation" value={goalForm.name} onChange={(e)=>setGoalForm({...goalForm, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">Target ($)</label>
                <input className="input-field" type="number" placeholder="2000" value={goalForm.targetAmount} onChange={(e)=>setGoalForm({...goalForm, targetAmount: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Time (Months)</label>
                <input className="input-field" type="number" placeholder="6" value={goalForm.targetMonths} onChange={(e)=>setGoalForm({...goalForm, targetMonths: e.target.value})} required />
              </div>
            </div>
            <button type="submit" className="btn btn-outline w-full mt-4">Set New Goal</button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
