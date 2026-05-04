import React, { useState, useEffect } from 'react';
import { savingsService } from '../services/api';
import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle,
  History,
  Target
} from 'lucide-react';

const SavingsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ amount: '', description: '', type: 'DEPOSIT' });

  const fetchData = async () => {
    try {
      const res = await savingsService.getSavingsData();
      setData(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompleteGoal = async (id) => {
    if (window.confirm('Are you sure you want to mark this goal as completed? The target amount will be added to your total savings.')) {
      await savingsService.completeGoal(id);
      fetchData();
    }
  };

  const handleExtendGoal = async (id, currentMonths) => {
    const newMonths = window.prompt('How many months total for this goal?', parseInt(currentMonths) + 1);
    if (newMonths) {
      await savingsService.extendGoal(id, parseInt(newMonths));
      fetchData();
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    await savingsService.addLog(logForm);
    setLogForm({ amount: '', description: '', type: 'DEPOSIT' });
    setShowLogForm(false);
    fetchData();
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading savings...</div>;

  const activeGoals = data.goals.filter(g => !g.isCompleted);
  const completedGoals = data.goals.filter(g => g.isCompleted);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Savings Vault</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your goals and long-term wealth.</p>
        </div>
        <div className="glass-card" style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Savings</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>
            ${parseFloat(data.totalSavings).toLocaleString()}
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Active Goals */}
          <section>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={24} color="var(--primary)" />
              Active Goals
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {activeGoals.map(goal => (
                <div key={goal.id} className="glass-card" style={{ position: 'relative' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.25rem' }}>{goal.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Target: ${goal.targetAmount} • {goal.targetMonths} months
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Monthly Allocation</span>
                      <span style={{ fontWeight: 600 }}>${goal.monthlySavings}/mo</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      onClick={() => handleCompleteGoal(goal.id)}
                      className="btn btn-primary" 
                      style={{ flex: 1, justifyContent: 'center', background: 'var(--accent)' }}
                    >
                      <CheckCircle2 size={18} /> Done
                    </button>
                    <button 
                      onClick={() => handleExtendGoal(goal.id, goal.targetMonths)}
                      className="btn btn-outline" 
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Clock size={18} /> Extend
                    </button>
                  </div>
                </div>
              ))}
              {activeGoals.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  No active goals. Set one on the dashboard!
                </div>
              )}
            </div>
          </section>

          {/* Savings History */}
          <section>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={24} color="var(--primary)" />
              Vault Transactions
            </h3>
            <div className="glass-card" style={{ padding: '0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Description</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{log.date}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {log.type === 'DEPOSIT' && <ArrowUpCircle size={16} color="var(--accent)" />}
                          {log.type === 'WITHDRAWAL' && <ArrowDownCircle size={16} color="var(--danger)" />}
                          {log.type === 'GOAL_COMPLETION' && <CheckCircle2 size={16} color="var(--primary)" />}
                          {log.description}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'right', 
                        fontWeight: 700,
                        color: (log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION') ? 'var(--accent)' : 'var(--danger)'
                      }}>
                        {(log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION') ? '+' : '-'}${parseFloat(log.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Quick Vault Action</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <button 
                onClick={() => { setLogForm({ ...logForm, type: 'DEPOSIT' }); setShowLogForm(true); }}
                className="btn btn-primary" 
                style={{ width: '100%', background: 'var(--accent)', justifyContent: 'center' }}
              >
                <Plus size={20} /> Add Savings
              </button>
              <button 
                onClick={() => { setLogForm({ ...logForm, type: 'WITHDRAWAL' }); setShowLogForm(true); }}
                className="btn btn-outline" 
                style={{ width: '100%', borderColor: 'var(--danger)', color: 'var(--danger)', justifyContent: 'center' }}
              >
                <ArrowDownCircle size={20} /> Spend from Vault
              </button>
            </div>
          </div>

          {showLogForm && (
            <div className="glass-card animate-fade-in" style={{ border: '1px solid var(--primary)' }}>
              <h4 style={{ marginBottom: '1rem' }}>
                {logForm.type === 'DEPOSIT' ? 'Deposit to Vault' : 'Withdraw from Vault'}
              </h4>
              <form onSubmit={handleLogSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Amount</label>
                  <input 
                    type="number" 
                    value={logForm.amount} 
                    onChange={(e) => setLogForm({...logForm, amount: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Description</label>
                  <input 
                    type="text" 
                    placeholder="Why this move?"
                    value={logForm.description} 
                    onChange={(e) => setLogForm({...logForm, description: e.target.value})} 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Confirm</button>
                  <button type="button" onClick={() => setShowLogForm(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="glass-card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-muted)' }}>Hall of Fame</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {completedGoals.map(goal => (
                  <div key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <CheckCircle2 size={16} color="var(--accent)" />
                    <span>{goal.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};

export default SavingsPage;
