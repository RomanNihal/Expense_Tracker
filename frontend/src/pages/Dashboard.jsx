import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  ArrowUpCircle,
  Wallet,
  Settings,
  PiggyBank,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* Custom Recharts Tooltip */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'hsla(222, 39%, 9%, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-md)',
      padding: '0.625rem 0.875rem',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Amount</div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fixedInc, setFixedInc] = useState({ source: '', amount: '' });
  const [fixedExp, setFixedExp] = useState({ name: '', amount: '' });
  const [dailyExp, setDailyExp] = useState({ name: '', amount: '', date: new Date().toISOString().split('T')[0], type: 'EXPENSE' });
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', targetMonths: '', monthlySavings: '' });

  const fetchData = async () => {
    try {
      const dashRes = await expenseService.getDashboard();
      setData(dashRes.data.data);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

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
    await expenseService.addTransaction({ name: dailyExp.name, amount: dailyExp.amount, expenseDate: dailyExp.date, type: dailyExp.type });
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div className="animate-pulse" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet size={24} color="var(--primary)" />
        </div>
        <p className="text-muted text-sm">Loading your finances…</p>
      </div>
    </div>
  );

  const chartData = [...data.recentTransactions].reverse().map(t => ({
    date: (t.expenseDate || '').slice(5) || '—',
    amount: parseFloat(t.amount) || 0,
  }));

  const spendPercent = Math.min(100, ((data.todayExpenses || 0) / (data.recommendedDaily || 1)) * 100);
  const overBudget = data.todayExpenses > data.recommendedDaily;

  return (
    <div className="container">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={18} color="var(--primary)" />
          <span className="text-xs" style={{ color: 'var(--primary)' }}>FINANCIAL OVERVIEW</span>
        </div>
        <h1 className="text-h1">Dashboard</h1>
      </header>

      <div className="grid grid-cols-12 gap-6">

        {/* ─── Hero Wallet Card ─── */}
        <div className="lg-col-span-8 lg-row-span-2 animate-fade-in" style={{
          background: 'linear-gradient(160deg, hsla(222,33%,14%,0.9) 0%, hsla(222,47%,8%,0.95) 100%)',
          backdropFilter: 'blur(24px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(1.5rem, 3vw, 2.5rem)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg), inset 0 1px 0 hsla(0,0%,100%,0.04)',
        }}>
          {/* Ambient glow */}
          <div style={{ position: 'absolute', top: '-30%', right: '-15%', width: '400px', height: '400px', background: 'var(--primary)', filter: 'blur(140px)', opacity: 0.12, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '300px', height: '300px', background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.06, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex justify-between items-start mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wallet size={16} color="var(--text-secondary)" />
                  <span className="text-xs">WALLET BALANCE</span>
                </div>
                <div style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--text-primary)' }}>
                  ${(data.totalBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="badge badge-income" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                <TrendingUp size={14} />
                +${(data.monthlyIncome || 0).toFixed(0)} this month
              </div>
            </div>

            <div style={{ height: 'clamp(180px, 25vw, 260px)', marginTop: '1.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="hsla(0,0%,100%,0.04)" vertical={false} />
                  <XAxis dataKey="date" stroke="hsla(0,0%,100%,0.2)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#chartGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: 'var(--primary)', stroke: 'var(--bg-base)', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ─── Today's Spending ─── */}
        <div className="glass-card lg-col-span-4 animate-fade-in stagger-1">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={20} color="var(--danger)" />
            </div>
            <div>
              <div className="text-xs" style={{ marginBottom: '1px' }}>TODAY'S SPENDING</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {overBudget ? 'Over budget' : 'On track'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            ${(data.todayExpenses || 0).toFixed(2)}
          </div>

          <div style={{ background: 'hsla(0,0%,100%,0.03)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '0.875rem' }}>
            <div className="flex justify-between items-center mb-3" style={{ fontSize: '0.8125rem' }}>
              <span className="text-muted">Daily Allowance</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>${(data.recommendedDaily || 0).toFixed(2)}</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'hsla(0,0%,100%,0.06)', overflow: 'hidden' }}>
              <div style={{
                width: `${spendPercent}%`,
                height: '100%',
                borderRadius: '3px',
                background: overBudget
                  ? 'linear-gradient(90deg, var(--danger), hsl(15, 90%, 60%))'
                  : 'linear-gradient(90deg, var(--accent), hsl(170, 80%, 50%))',
                transition: 'width 0.6s var(--ease-out)',
                boxShadow: overBudget
                  ? '0 0 12px hsla(0, 84%, 60%, 0.4)'
                  : '0 0 12px hsla(160, 84%, 39%, 0.3)',
              }} />
            </div>
          </div>
        </div>

        {/* ─── Savings Summary ─── */}
        <div className="glass-card lg-col-span-4 flex flex-col animate-fade-in stagger-2">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PiggyBank size={20} color="var(--primary)" />
              </div>
              <div>
                <div className="text-xs" style={{ marginBottom: '1px' }}>MONTHLY SAVINGS</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>Goal allocations</div>
              </div>
            </div>
            <Link to="/savings" style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
              View <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            ${(data.monthlySavings || 0).toFixed(2)}
          </div>
          <div className="text-sm text-muted mb-6">combined allocation</div>

          <div className="flex flex-col gap-2 mt-auto">
            {(data.activeGoals || []).slice(0, 3).map((goal, i) => (
              <div key={goal.id} className="flex justify-between items-center" style={{ padding: '0.5rem 0.625rem', borderRadius: 'var(--radius-sm)', background: 'hsla(0,0%,100%,0.025)' }}>
                <span className="text-sm text-muted">{goal.name}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>${parseFloat(goal.monthlySavings).toFixed(0)}</span>
              </div>
            ))}
            {(!data.activeGoals || data.activeGoals.length === 0) && (
              <div className="text-sm text-muted text-center" style={{ padding: '1.5rem 0' }}>No active goals yet</div>
            )}
            {data.activeGoals?.length > 3 && (
              <div className="text-center" style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                + {data.activeGoals.length - 3} more
              </div>
            )}
          </div>
        </div>

        {/* ─── Log Transaction ─── */}
        <div className="glass-card lg-col-span-4 animate-fade-in stagger-3">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} color="var(--primary)" />
            </div>
            <h3 className="text-h3 m-0">Log Transaction</h3>
          </div>
          <form onSubmit={handleDailySubmit}>
            <div className="input-group">
              <label className="input-label">Description</label>
              <input type="text" className="input-field" placeholder="What was this for?" value={dailyExp.name} onChange={e => setDailyExp({...dailyExp, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">Amount</label>
                <input type="number" className="input-field" placeholder="0.00" value={dailyExp.amount} onChange={e => setDailyExp({...dailyExp, amount: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input type="date" className="input-field" value={dailyExp.date} onChange={e => setDailyExp({...dailyExp, date: e.target.value})} required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Type</label>
              <select className="input-field" value={dailyExp.type} onChange={e => setDailyExp({...dailyExp, type: e.target.value})} required>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem' }}>Add Entry</button>
          </form>
        </div>

        {/* ─── Fixed Settings ─── */}
        <div className="glass-card lg-col-span-4 animate-fade-in stagger-4">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={20} color="var(--accent)" />
            </div>
            <h3 className="text-h3 m-0">Recurring</h3>
          </div>

          <form onSubmit={handleFixedIncSubmit} className="mb-4">
            <div className="text-xs mb-2">FIXED INCOME</div>
            <div className="flex gap-2">
              <input className="input-field flex-1" placeholder="Source" value={fixedInc.source} onChange={e => setFixedInc({...fixedInc, source: e.target.value})} required style={{ padding: '0.5rem 0.75rem' }} />
              <input type="number" className="input-field" placeholder="$" value={fixedInc.amount} onChange={e => setFixedInc({...fixedInc, amount: e.target.value})} required style={{ width: '70px', padding: '0.5rem' }} />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 0.75rem' }}><Plus size={16}/></button>
            </div>
          </form>

          <form onSubmit={handleFixedExpSubmit} className="mb-4">
            <div className="text-xs mb-2">FIXED COST</div>
            <div className="flex gap-2">
              <input className="input-field flex-1" placeholder="Name" value={fixedExp.name} onChange={e => setFixedExp({...fixedExp, name: e.target.value})} required style={{ padding: '0.5rem 0.75rem' }} />
              <input type="number" className="input-field" placeholder="$" value={fixedExp.amount} onChange={e => setFixedExp({...fixedExp, amount: e.target.value})} required style={{ width: '70px', padding: '0.5rem' }} />
              <button type="submit" className="btn btn-danger" style={{ padding: '0 0.75rem' }}><Plus size={16}/></button>
            </div>
          </form>

          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', border: '1px dashed hsla(239, 84%, 67%, 0.25)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
            Applied automatically on the 1st of each month
          </div>
        </div>

        {/* ─── New Goal ─── */}
        <div className="glass-card lg-col-span-4 animate-fade-in stagger-4">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--warning-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} color="var(--warning)" />
            </div>
            <h3 className="text-h3 m-0">New Goal</h3>
          </div>
          <form onSubmit={handleGoalSubmit}>
            <div className="input-group">
              <label className="input-label">Goal Name</label>
              <input className="input-field" placeholder="e.g. Dream Vacation" value={goalForm.name} onChange={e => setGoalForm({...goalForm, name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="input-group">
                <label className="input-label">Target ($)</label>
                <input className="input-field" type="number" placeholder="2000" value={goalForm.targetAmount} onChange={e => setGoalForm({...goalForm, targetAmount: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Months</label>
                <input className="input-field" type="number" placeholder="6" value={goalForm.targetMonths} onChange={e => setGoalForm({...goalForm, targetMonths: e.target.value})} required />
              </div>
            </div>
            <button type="submit" className="btn btn-outline w-full" style={{ marginTop: '0.5rem' }}>Create Goal</button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
