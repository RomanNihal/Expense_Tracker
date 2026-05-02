import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/api';
import { Plus, Trash2, Calendar, Target, TrendingDown, DollarSign, PieChart, ArrowUpCircle, History } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incomeHistory, setIncomeHistory] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  
  // Forms
  const [incomeForm, setIncomeForm] = useState({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [fixedExp, setFixedExp] = useState({ name: '', amount: '' });
  const [dailyExp, setDailyExp] = useState({ name: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [goal, setGoal] = useState({ name: '', targetAmount: '', targetMonths: '' });

  const fetchData = async () => {
    try {
      const [dashRes, incomeRes, dailyRes] = await Promise.all([
        expenseService.getDashboard(),
        expenseService.getIncomeHistory(), 
        expenseService.getDailyExpenses({ month: new Date().toISOString().slice(0, 7) })
      ]);
      
      setData(dashRes.data.data);
      setIncomeHistory(incomeRes.data.data);
      setRecentExpenses(dailyRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    await expenseService.setIncome(incomeForm);
    setIncomeForm({ amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    fetchData();
  };

  const handleFixedSubmit = async (e) => {
    e.preventDefault();
    await expenseService.addFixedExpense(fixedExp);
    setFixedExp({ name: '', amount: '' });
    fetchData();
  };

  const handleDailySubmit = async (e) => {
    e.preventDefault();
    await expenseService.addDailyExpense({
      name: dailyExp.name,
      amount: dailyExp.amount,
      expenseDate: dailyExp.date
    });
    setDailyExp({ name: '', amount: '', date: new Date().toISOString().split('T')[0] });
    fetchData();
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    await expenseService.addGoal(goal);
    setGoal({ name: '', targetAmount: '', targetMonths: '' });
    fetchData();
  };

  const deleteFixed = async (id) => {
    await expenseService.deleteFixedExpense(id);
    fetchData();
  };

  const deleteDaily = async (id) => {
    await expenseService.deleteDailyExpense(id);
    fetchData();
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading metrics...</div>;

  // Prepare Chart Data (Last 7 days of spending)
  const chartData = recentExpenses.slice(0, 10).reverse().map(ex => ({
    name: ex.expenseDate.slice(5),
    amount: parseFloat(ex.amount)
  }));

  return (
    <div className="dashboard-grid animate-fade-in">
      {/* Metrics Row */}
      <div className="glass-card metric-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <DollarSign size={18} />
          <span>Available Daily</span>
        </div>
        <div className="metric-value">${data.maxDailyExpense.toFixed(2)}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {data.daysRemaining} days remaining
        </div>
      </div>

      <div className="glass-card metric-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <TrendingDown size={18} />
          <span>Left Today</span>
        </div>
        <div className="metric-value" style={{ 
          background: data.remainingToday < 0 ? 'var(--danger)' : 'linear-gradient(to right, #10b981, #34d399)',
          webkitTextFillColor: data.remainingToday < 0 ? 'var(--danger)' : 'transparent'
        }}>
          ${data.remainingToday.toFixed(2)}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Spent today: ${data.todayExpenses.toFixed(2)}
        </div>
      </div>

      <div className="glass-card metric-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Target size={18} />
          <span>Monthly Savings</span>
        </div>
        <div className="metric-value">${data.monthlySavingsAmount.toFixed(2)}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Goal: {data.savingsGoal?.name || 'None'}
        </div>
      </div>

      {/* Charts Section */}
      <div className="glass-card" style={{ gridColumn: 'span 2', minHeight: '300px' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart size={20} color="var(--primary)" />
          Spending Trend
        </h3>
        <div style={{ width: '100%', height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text)' }}
              />
              <Area type="monotone" dataKey="amount" stroke="var(--primary)" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forms Section */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} color="var(--primary)" />
          Add Daily Expense
        </h3>
        <form onSubmit={handleDailySubmit}>
          <div className="input-group">
            <label>Description</label>
            <input 
              type="text" 
              placeholder="e.g. Grocery" 
              value={dailyExp.name}
              onChange={(e) => setDailyExp({...dailyExp, name: e.target.value})}
              required 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
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
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Log Expense
          </button>
        </form>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpCircle size={20} color="var(--accent)" />
          Add Income
        </h3>
        <form onSubmit={handleIncomeSubmit}>
          <div className="input-group">
            <label>Source</label>
            <input 
              type="text" 
              placeholder="e.g. Salary, Freelance" 
              value={incomeForm.description}
              onChange={(e) => setIncomeForm({...incomeForm, description: e.target.value})}
              required 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="input-group">
              <label>Amount</label>
              <input 
                type="number" 
                placeholder="0.00" 
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({...incomeForm, amount: e.target.value})}
                required 
              />
            </div>
            <div className="input-group">
              <label>Date</label>
              <input 
                type="date" 
                value={incomeForm.date}
                onChange={(e) => setIncomeForm({...incomeForm, date: e.target.value})}
                required 
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--accent)' }}>
            Add Income
          </button>
        </form>
      </div>

      {/* History & Goals */}
      <div className="glass-card" style={{ gridRow: 'span 2' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} color="var(--primary)" />
          Recent Spending
        </h3>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {recentExpenses.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No expenses yet</p>
          ) : (
            recentExpenses.map(ex => (
              <div key={ex.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '0.75rem', 
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid var(--glass-border)'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{ex.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.expenseDate}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>-${parseFloat(ex.amount).toFixed(2)}</span>
                  <Trash2 size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => deleteDaily(ex.id)} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1.5rem' }}>Monthly Summary</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Income</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>+${data.monthlyIncome.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Fixed Costs</span>
            <span style={{ fontWeight: 700, color: 'var(--danger)' }}>-${data.totalFixedCosts.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Spent So Far</span>
            <span style={{ fontWeight: 700 }}>-${data.monthlyExpensesTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
