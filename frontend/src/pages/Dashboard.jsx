import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/api';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Target, 
  TrendingDown, 
  ArrowUpCircle, 
  History, 
  Wallet, 
  Settings,
  ArrowRight,
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

  const deleteTransaction = async (id) => {
    await expenseService.deleteTransaction(id);
    fetchData();
  };

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-pulse" style={{ textAlign: 'center' }}>
        <Wallet size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-muted)' }}>Calculating your wealth...</p>
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
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back! Here's your financial overview.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        
        {/* Main Wallet Card */}
        <div className="glass-card" style={{ 
          gridColumn: 'span 8', 
          gridRow: 'span 2',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <Wallet size={20} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em' }}>TOTAL WALLET BALANCE</span>
                </div>
                <div style={{ fontSize: '2.75rem', fontWeight: 800, color: 'white' }}>
                  ${(data.totalBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ padding: '0.5rem 1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '2rem', color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 600 }}>
                  <ArrowUpCircle size={14} style={{ marginRight: '0.4rem' }} /> +${(data.monthlyIncome || 0).toFixed(2)} this month
                </div>
              </div>
            </div>

            <div style={{ height: '240px', width: '100%', marginTop: '2rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData || []}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem' }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Decorative background element */}
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '400px', height: '400px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none' }}></div>
        </div>

        {/* Daily Stats Card */}
        <div className="glass-card" style={{ gridColumn: 'span 4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
              <TrendingDown size={20} color="var(--danger)" />
            </div>
            <span style={{ fontWeight: 600 }}>Today's Spending</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
            ${(data.todayExpenses || 0).toFixed(2)}
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Daily Allowance</span>
              <span style={{ fontWeight: 600 }}>${(data.recommendedDaily || 0).toFixed(2)}</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
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
        <div className="glass-card" style={{ gridColumn: 'span 4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem' }}>
                <PiggyBank size={20} color="var(--primary)" />
              </div>
              <span style={{ fontWeight: 600 }}>Monthly Savings</span>
            </div>
            <Link to="/savings" style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
              Manage Vault
            </Link>
          </div>
          
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
            ${(data.monthlySavings || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Combined goal allocation
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {(data.activeGoals || []).slice(0, 3).map(goal => (
              <div key={goal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{goal.name}</span>
                <span style={{ fontWeight: 600 }}>${parseFloat(goal.monthlySavings).toFixed(0)}</span>
              </div>
            ))}
            {(!data.activeGoals || data.activeGoals.length === 0) && (
              <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No active savings goals.
              </div>
            )}
            {data.activeGoals?.length > 3 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', textAlign: 'center' }}>
                + {data.activeGoals.length - 3} more goals
              </div>
            )}
          </div>
        </div>


        {/* Log Transaction Form */}
        <div className="glass-card" style={{ gridColumn: 'span 4' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} color="var(--primary)" />
            Log Transaction
          </h3>
          <form onSubmit={handleDailySubmit}>
            <div className="input-group">
              <label>Description</label>
              <input 
                type="text" 
                placeholder="What was this for?" 
                value={dailyExp.name}
                onChange={(e) => setDailyExp({...dailyExp, name: e.target.value})}
                required 
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Amount</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={dailyExp.amount}
                  onChange={(e) => setDailyExp({...dailyExp, amount: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={dailyExp.date}
                  onChange={(e) => setDailyExp({...dailyExp, date: e.target.value})}
                  required 
                />
              </div>
            </div>
            <div className="input-group">
              <label>Type</label>
              <select 
                value={dailyExp.type}
                onChange={(e) => setDailyExp({...dailyExp, type: e.target.value})}
                required
                style={{ 
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '0.5rem',
                  color: 'var(--text)',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="EXPENSE" style={{ background: 'var(--bg)' }}>Expense</option>
                <option value="INCOME" style={{ background: 'var(--bg)' }}>Income</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              Add Entry
            </button>
          </form>
        </div>

        {/* Fixed Items Setup */}
        <div className="glass-card" style={{ gridColumn: 'span 4' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} color="var(--accent)" />
            Fixed Settings
          </h3>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <form onSubmit={handleFixedIncSubmit}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>ADD FIXED INCOME</div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem' }}>
                <input placeholder="Source" value={fixedInc.source} onChange={(e)=>setFixedInc({...fixedInc, source: e.target.value})} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '0.4rem', color: 'white', fontSize: '0.875rem' }} required />
                <input type="number" placeholder="Amt" value={fixedInc.amount} onChange={(e)=>setFixedInc({...fixedInc, amount: e.target.value})} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '0.4rem', color: 'white', fontSize: '0.875rem' }} required />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 0.75rem', height: '100%' }}><Plus size={16}/></button>
              </div>
            </form>

            <form onSubmit={handleFixedExpSubmit}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>ADD FIXED COST</div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem' }}>
                <input placeholder="Name" value={fixedExp.name} onChange={(e)=>setFixedExp({...fixedExp, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '0.4rem', color: 'white', fontSize: '0.875rem' }} required />
                <input type="number" placeholder="Amt" value={fixedExp.amount} onChange={(e)=>setFixedExp({...fixedExp, amount: e.target.value})} style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '0.4rem', color: 'white', fontSize: '0.875rem' }} required />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 0.75rem', height: '100%', background: 'var(--danger)' }}><Plus size={16}/></button>
              </div>
            </form>

            <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '0.5rem', border: '1px dashed var(--glass-border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Fixed items are automatically applied on the 1st of every month.
            </div>
          </div>
        </div>

        {/* Goals / Recent Combined Row */}
        <div className="glass-card" style={{ gridColumn: 'span 4' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} color="var(--primary)" />
            New Goal
          </h3>
          <form onSubmit={handleGoalSubmit}>
            <div className="input-group">
              <label>Goal Name</label>
              <input placeholder="e.g. Dream Vacation" value={goalForm.name} onChange={(e)=>setGoalForm({...goalForm, name: e.target.value})} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Target ($)</label>
                <input type="number" placeholder="2000" value={goalForm.targetAmount} onChange={(e)=>setGoalForm({...goalForm, targetAmount: e.target.value})} required />
              </div>
              <div className="input-group">
                <label>Time (Months)</label>
                <input type="number" placeholder="6" value={goalForm.targetMonths} onChange={(e)=>setGoalForm({...goalForm, targetMonths: e.target.value})} required />
              </div>
            </div>
            <button type="submit" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Set New Goal</button>
          </form>
        </div>

        <div className="glass-card" style={{ gridColumn: 'span 8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} color="var(--primary)" />
              Recent Activity
            </h3>
            <Link to="/transactions" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {data.recentTransactions.slice(0, 4).map(t => (
              <div key={t.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem', 
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '0.75rem',
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: t.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : t.type === 'EXPENSE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    color: t.type === 'INCOME' ? 'var(--accent)' : t.type === 'EXPENSE' ? 'var(--danger)' : 'var(--primary)'
                  }}>
                    {t.type === 'INCOME' ? <ArrowUpCircle size={20}/> : <TrendingDown size={20}/>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.expenseDate}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ 
                    fontSize: '1.1rem',
                    fontWeight: 700, 
                    color: t.type === 'INCOME' ? 'var(--accent)' : 'var(--danger)' 
                  }}>
                    {t.type === 'INCOME' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                  </span>
                  {!t.isFixed && (
                    <button 
                      onClick={() => deleteTransaction(t.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

