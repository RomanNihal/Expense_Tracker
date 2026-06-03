import React, { useState, useEffect } from 'react';
import { savingsService } from '../services/api';
import {
  PiggyBank,
  CheckCircle2,
  Clock,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  History,
  Target,
  Trash2,
  Pencil,
  X,
  AlertTriangle
} from 'lucide-react';

// Returns true when a goal's target period has elapsed without completion
const isGoalOverdue = (goal) => {
  const startMonthStr = goal.startMonth || goal.createdAt?.slice(0, 7);
  if (!startMonthStr) return false;
  const [sy, sm] = startMonthStr.split('-').map(Number);
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const monthsElapsed = (cy * 12 + cm) - (sy * 12 + sm);
  return monthsElapsed >= goal.targetMonths;
};

const SavingsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vault log form (deposit / withdrawal)
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ amount: '', description: '', type: 'DEPOSIT' });

  // Edit vault log
  const [editLogId, setEditLogId] = useState(null);
  const [editLogForm, setEditLogForm] = useState({ amount: '', description: '' });

  // Extend goal modal
  const [extendGoalId, setExtendGoalId] = useState(null);
  const [extendForm, setExtendForm] = useState({ remainingAmount: '', newMonths: '' });

  const fetchData = async () => {
    try {
      const res = await savingsService.getSavingsData();
      setData(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- Goal actions ---
  const handleCompleteGoal = async (id) => {
    if (window.confirm('Mark this goal as completed? The full target amount will be added to your savings vault.')) {
      await savingsService.completeGoal(id);
      fetchData();
    }
  };

  const handleOpenExtend = (goal) => {
    setExtendForm({ remainingAmount: '', newMonths: '' });
    setExtendGoalId(goal.id);
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    const remaining = parseFloat(extendForm.remainingAmount);
    const months = parseInt(extendForm.newMonths);
    if (isNaN(remaining) || isNaN(months) || remaining < 0 || months < 1) return;
    await savingsService.extendGoal(extendGoalId, { remainingAmount: remaining, newMonths: months });
    setExtendGoalId(null);
    fetchData();
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Delete this goal? Future monthly allocations will stop.')) {
      await savingsService.deleteGoal(id);
      fetchData();
    }
  };

  // --- Vault log actions ---
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    await savingsService.addLog(logForm);
    setLogForm({ amount: '', description: '', type: 'DEPOSIT' });
    setShowLogForm(false);
    fetchData();
  };

  const handleEditLog = (log) => {
    setEditLogId(log.id);
    setEditLogForm({ amount: log.amount, description: log.description });
  };

  const handleEditLogSubmit = async (e) => {
    e.preventDefault();
    await savingsService.updateLog(editLogId, editLogForm);
    setEditLogId(null);
    fetchData();
  };

  const handleDeleteLog = async (id) => {
    if (window.confirm('Delete this vault transaction?')) {
      await savingsService.deleteLog(id);
      fetchData();
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading savings...</div>;

  const activeGoals = data.goals.filter(g => g.isActive && !g.isCompleted);
  const completedGoals = data.goals.filter(g => g.isCompleted);

  // Goal whose extend modal is open
  const extendGoalData = extendGoalId ? data.goals.find(g => g.id === extendGoalId) : null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Savings Vault</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your goals and long-term wealth.</p>
        </div>
        <div className="glass-card" style={{ padding: '1rem 2rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(16,185,129,0.2) 100%)' }}>
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
              {activeGoals.map(goal => {
                const overdue = isGoalOverdue(goal);
                return (
                  <div key={goal.id} className="glass-card" style={{ position: 'relative', border: overdue ? '1px solid rgba(239,68,68,0.4)' : undefined }}>
                    {overdue && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        <AlertTriangle size={14} />
                        Goal period ended — extend or delete
                      </div>
                    )}
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.25rem' }}>{goal.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                      Target: ${parseFloat(goal.targetAmount).toLocaleString()} • {goal.targetMonths} month{goal.targetMonths !== 1 ? 's' : ''}
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Monthly Allocation</span>
                        <span style={{ fontWeight: 600 }}>${parseFloat(goal.monthlySavings).toFixed(2)}/mo</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {!overdue && (
                        <button
                          onClick={() => handleCompleteGoal(goal.id)}
                          className="btn btn-primary"
                          style={{ flex: 1, justifyContent: 'center', background: 'var(--accent)' }}
                        >
                          <CheckCircle2 size={18} /> Done
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenExtend(goal)}
                        className="btn btn-outline"
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        <Clock size={18} /> Extend
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="btn btn-outline"
                        style={{ width: '45px', padding: '0', justifyContent: 'center', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
                        title="Delete Goal"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {activeGoals.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  No active goals. Set one on the dashboard!
                </div>
              )}
            </div>
          </section>

          {/* Vault Transactions */}
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
                    <th style={{ padding: '1rem', width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.logs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      {editLogId === log.id ? (
                        <td colSpan={4} style={{ padding: '0.75rem 1rem' }}>
                          <form onSubmit={handleEditLogSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              type="number"
                              value={editLogForm.amount}
                              onChange={e => setEditLogForm({ ...editLogForm, amount: e.target.value })}
                              style={{ width: '110px', padding: '0.4rem 0.6rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white' }}
                              required
                            />
                            <input
                              type="text"
                              value={editLogForm.description}
                              onChange={e => setEditLogForm({ ...editLogForm, description: e.target.value })}
                              style={{ flex: 1, padding: '0.4rem 0.6rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white' }}
                              required
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.9rem' }}>Save</button>
                            <button type="button" onClick={() => setEditLogId(null)} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem' }}>
                              <X size={14} />
                            </button>
                          </form>
                        </td>
                      ) : (
                        <>
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
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleEditLog(log)}
                                title="Edit"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteLog(log.id)}
                                title="Delete"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {data.logs.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No vault transactions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar */}
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
                    onChange={e => setLogForm({ ...logForm, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="Why this move?"
                    value={logForm.description}
                    onChange={e => setLogForm({ ...logForm, description: e.target.value })}
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

      {/* Extend Goal Modal */}
      {extendGoalId && extendGoalData && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '420px', border: '1px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Extend Goal: {extendGoalData.name}</h3>
              <button onClick={() => setExtendGoalId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Original target: <strong style={{ color: 'white' }}>${parseFloat(extendGoalData.targetAmount).toLocaleString()}</strong>.
              The amount you've already saved will be moved to your vault. Enter how much is still remaining and how many months you need.
            </p>
            <form onSubmit={handleExtendSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Remaining Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  max={extendGoalData.targetAmount}
                  step="0.01"
                  placeholder={`Max: $${parseFloat(extendGoalData.targetAmount).toLocaleString()}`}
                  value={extendForm.remainingAmount}
                  onChange={e => setExtendForm({ ...extendForm, remainingAmount: e.target.value })}
                  required
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Months Needed</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 2"
                  value={extendForm.newMonths}
                  onChange={e => setExtendForm({ ...extendForm, newMonths: e.target.value })}
                  required
                />
              </div>
              {extendForm.remainingAmount && extendForm.newMonths && (
                <div style={{ background: 'rgba(99,102,241,0.1)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem' }}>
                  <div>Saved so far → vault: <strong style={{ color: 'var(--accent)' }}>${(parseFloat(extendGoalData.targetAmount) - parseFloat(extendForm.remainingAmount || 0)).toFixed(2)}</strong></div>
                  <div>New monthly: <strong style={{ color: 'white' }}>${(parseFloat(extendForm.remainingAmount) / parseInt(extendForm.newMonths)).toFixed(2)}/mo</strong></div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Confirm Extension</button>
                <button type="button" onClick={() => setExtendGoalId(null)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsPage;
