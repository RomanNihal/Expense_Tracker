import React, { useState, useEffect } from 'react';
import { savingsService, expenseService } from '../services/api';
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
  AlertTriangle,
  Save
} from 'lucide-react';

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

  // Vault log form
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ amount: '', description: '', type: 'DEPOSIT' });

  // Month filter for vault transactions
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  // Edit vault log
  const [editLogId, setEditLogId] = useState(null);
  const [editLogForm, setEditLogForm] = useState({ amount: '', description: '', date: '' });

  // Extend goal modal
  const [extendGoalId, setExtendGoalId] = useState(null);
  const [extendForm, setExtendForm] = useState({ remainingAmount: '', newMonths: '' });

  // Edit goal modal
  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalForm, setEditGoalForm] = useState({ name: '', targetAmount: '', targetMonths: '' });

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

  const handleOpenEditGoal = (goal) => {
    setEditGoalForm({ name: goal.name, targetAmount: goal.targetAmount, targetMonths: goal.targetMonths });
    setEditGoalId(goal.id);
  };

  const handleEditGoalSubmit = async (e) => {
    e.preventDefault();
    await expenseService.updateGoal(editGoalId, editGoalForm);
    setEditGoalId(null);
    fetchData();
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

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    await savingsService.addLog(logForm);
    setLogForm({ amount: '', description: '', type: 'DEPOSIT' });
    setShowLogForm(false);
    fetchData();
  };

  const handleEditLog = (log) => {
    setEditLogId(log.id);
    setEditLogForm({ amount: log.amount, description: log.description, date: log.date });
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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse flex flex-col items-center">
        <PiggyBank size={48} className="text-primary mb-4" />
        <p className="text-muted">Loading vault...</p>
      </div>
    </div>
  );

  const activeGoals = data.goals.filter(g => g.isActive && !g.isCompleted);
  const completedGoals = data.goals.filter(g => g.isCompleted);
  const filteredLogs = selectedMonth
    ? data.logs.filter(l => (l.date || '').startsWith(selectedMonth))
    : data.logs;

  const formatMonth = (ym) => {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const vaultMonthlyHistory = (() => {
    const map = {};
    data.logs.forEach(log => {
      const month = (log.date || '').slice(0, 7);
      if (!month) return;
      if (!map[month]) map[month] = { deposits: 0, withdrawals: 0, completions: 0 };
      const amt = parseFloat(log.amount) || 0;
      if (log.type === 'DEPOSIT') map[month].deposits += amt;
      else if (log.type === 'WITHDRAWAL') map[month].withdrawals += amt;
      else if (log.type === 'GOAL_COMPLETION') map[month].completions += amt;
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  })();

  const extendGoalData = extendGoalId ? data.goals.find(g => g.id === extendGoalId) : null;

  return (
    <div className="container animate-fade-in">
      <header className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h1 className="text-h1 mb-2">Savings Vault</h1>
          <p className="text-muted text-lg">Manage your goals and long-term wealth.</p>
        </div>
        <div className="glass-card flex items-center justify-center flex-col p-6" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(16,185,129,0.2) 100%)' }}>
          <div className="text-xs text-muted mb-1" style={{ letterSpacing: '0.1em' }}>TOTAL SAVINGS</div>
          <div className="text-white" style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>
            ${parseFloat(data.totalSavings).toLocaleString()}
          </div>
        </div>
      </header>

      {/* Vault Monthly Breakdown */}
      {vaultMonthlyHistory.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted">VAULT MONTHLY BREAKDOWN</span>
            <span className="text-xs text-muted opacity-60">— click a card to filter</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            {vaultMonthlyHistory.map(([month, totals]) => {
              const net = totals.deposits + totals.completions - totals.withdrawals;
              const isActive = selectedMonth === month;
              const topBorderColor = net >= 0 ? 'var(--accent)' : 'var(--danger)';
              const netColor = net >= 0 ? 'var(--accent)' : 'var(--danger)';
              
              return (
                <div
                  key={month}
                  onClick={() => setSelectedMonth(isActive ? '' : month)}
                  className={`flex-shrink-0 cursor-pointer transition-all duration-200 overflow-hidden rounded-xl ${isActive ? 'ring-2 ring-primary bg-primary-light' : 'bg-surface hover:bg-surface-hover border border-glass-border'}`}
                  style={{ minWidth: '200px' }}
                >
                  <div style={{ height: '3px', background: topBorderColor }} />
                  <div className="p-4 border-b border-glass-border">
                    <div className="font-bold" style={{ color: isActive ? 'var(--primary)' : 'white' }}>
                      {formatMonth(month)}
                    </div>
                  </div>
                  <div className="p-4 grid gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-muted">
                        <ArrowUpCircle size={14} className="text-accent" /> Deposits
                      </div>
                      <span className="font-semibold text-accent">+${totals.deposits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-muted">
                        <ArrowDownCircle size={14} className="text-danger" /> Withdrawals
                      </div>
                      <span className="font-semibold text-danger">-${totals.withdrawals.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-muted">
                        <CheckCircle2 size={14} className="text-primary" /> Goals
                      </div>
                      <span className="font-semibold text-primary">+${totals.completions.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-3 flex justify-between items-center" style={{ background: net >= 0 ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)' }}>
                    <span className="text-xs text-muted">NET</span>
                    <span className="font-bold text-lg" style={{ color: netColor }}>
                      {net >= 0 ? '+' : ''}${Math.abs(net).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        <div className="flex flex-col gap-8 lg-col-span-8">

          {/* Active Goals */}
          <section>
            <h3 className="flex items-center gap-2 mb-6 text-h3 text-primary">
              <Target size={24} /> Active Goals
            </h3>
            <div className="grid md-grid-cols-2 gap-6">
              {activeGoals.map(goal => {
                const overdue = isGoalOverdue(goal);
                return (
                  <div key={goal.id} className="glass-card flex flex-col" style={{ border: overdue ? '1px solid rgba(239,68,68,0.4)' : undefined }}>
                    {overdue && (
                      <div className="flex items-center gap-2 text-danger text-sm mb-3">
                        <AlertTriangle size={16} /> Goal period ended — extend or delete
                      </div>
                    )}
                    <div className="text-xl font-bold mb-1">{goal.name}</div>
                    <div className="text-muted text-sm mb-6">
                      Target: ${parseFloat(goal.targetAmount).toLocaleString()} • {goal.targetMonths} month{goal.targetMonths !== 1 ? 's' : ''}
                    </div>
                    
                    <div className="flex justify-between text-sm mb-6 mt-auto">
                      <span className="text-muted">Monthly Allocation</span>
                      <span className="font-semibold">${parseFloat(goal.monthlySavings).toFixed(2)}/mo</span>
                    </div>
                    
                    <div className="flex gap-3">
                      {!overdue && (
                        <button onClick={() => handleCompleteGoal(goal.id)} className="btn text-white flex-1" style={{ background: 'var(--accent)' }}>
                          <CheckCircle2 size={18} /> Done
                        </button>
                      )}
                      <button onClick={() => handleOpenExtend(goal)} className="btn btn-outline flex-1">
                        <Clock size={18} /> Extend
                      </button>
                      <button onClick={() => handleOpenEditGoal(goal)} className="btn btn-outline p-2 px-3 text-muted" title="Edit Goal">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="btn btn-outline p-2 px-3 text-muted hover:text-danger" title="Delete Goal">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {activeGoals.length === 0 && (
                <div className="glass-card text-center text-muted p-12 lg-col-span-8">
                  No active goals. Set one on the dashboard!
                </div>
              )}
            </div>
          </section>

          {/* Vault Transactions */}
          <section>
            <div className="glass-card no-padding">
              <div className="p-6 border-b border-glass-border" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <h3 className="flex items-center gap-2 m-0 text-h3 text-primary">
                    <History size={24} /> Vault Transactions
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="month"
                      className="input-field py-2"
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      style={{ width: '160px', background: 'var(--surface-color)' }}
                    />
                    <button
                      onClick={() => setSelectedMonth('')}
                      className={`btn ${!selectedMonth ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      All
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Desktop Table */}
              <div className="table-scroll desktop-only">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id}>
                        {editLogId === log.id ? (
                          <td colSpan={4}>
                            <form onSubmit={handleEditLogSubmit} className="flex gap-2 items-center">
                              <input type="date" className="input-field py-1" value={editLogForm.date} onChange={e => setEditLogForm({ ...editLogForm, date: e.target.value })} required />
                              <input type="number" className="input-field py-1" style={{ width: '120px' }} value={editLogForm.amount} onChange={e => setEditLogForm({ ...editLogForm, amount: e.target.value })} required />
                              <input type="text" className="input-field py-1 flex-1" value={editLogForm.description} onChange={e => setEditLogForm({ ...editLogForm, description: e.target.value })} required />
                              <button type="submit" className="btn btn-primary py-1 px-4">Save</button>
                              <button type="button" onClick={() => setEditLogId(null)} className="btn btn-outline py-1 px-3"><X size={16}/></button>
                            </form>
                          </td>
                        ) : (
                          <>
                            <td className="text-muted">{log.date}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                {log.type === 'DEPOSIT' && <ArrowUpCircle size={18} className="text-accent" />}
                                {log.type === 'WITHDRAWAL' && <ArrowDownCircle size={18} className="text-danger" />}
                                {log.type === 'GOAL_COMPLETION' && <CheckCircle2 size={18} className="text-primary" />}
                                <span className="font-medium text-md">{log.description}</span>
                              </div>
                            </td>
                            <td className={`text-right font-bold text-lg ${log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION' ? 'text-accent' : 'text-danger'}`}>
                              {log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION' ? '+' : '-'}${parseFloat(log.amount).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="flex gap-2 justify-end">
                                <button className="btn-icon" onClick={() => handleEditLog(log)}><Pencil size={16}/></button>
                                <button className="btn-icon hover:text-danger" onClick={() => handleDeleteLog(log.id)}><Trash2 size={16}/></button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-muted">
                          {selectedMonth ? `No transactions for ${selectedMonth}.` : 'No vault transactions yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Card List */}
              <div className="mobile-card-list mobile-only">
                {filteredLogs.map(log => (
                  <div key={log.id} className="p-4 rounded-xl border border-glass-border" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {editLogId === log.id ? (
                      <div className="grid gap-3">
                        <input type="date" className="input-field" value={editLogForm.date} onChange={e => setEditLogForm({ ...editLogForm, date: e.target.value })} required />
                        <input type="text" className="input-field" value={editLogForm.description} onChange={e => setEditLogForm({ ...editLogForm, description: e.target.value })} required />
                        <input type="number" className="input-field" value={editLogForm.amount} onChange={e => setEditLogForm({ ...editLogForm, amount: e.target.value })} required />
                        <div className="flex gap-2 mt-2">
                          <button onClick={handleEditLogSubmit} className="btn btn-primary flex-1 py-2">Save</button>
                          <button onClick={() => setEditLogId(null)} className="btn btn-outline flex-1 py-2">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2 font-medium text-md mb-1">
                              {log.type === 'DEPOSIT' && <ArrowUpCircle size={16} className="text-accent" />}
                              {log.type === 'WITHDRAWAL' && <ArrowDownCircle size={16} className="text-danger" />}
                              {log.type === 'GOAL_COMPLETION' && <CheckCircle2 size={16} className="text-primary" />}
                              {log.description}
                            </div>
                            <div className="text-xs text-muted">{log.date}</div>
                          </div>
                          <div className={`font-bold text-lg ${log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION' ? 'text-accent' : 'text-danger'}`}>
                            {log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION' ? '+' : '-'}${parseFloat(log.amount).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex justify-end pt-3 border-t border-glass-border">
                          <div className="flex gap-2">
                            <button className="btn-icon p-1" onClick={() => handleEditLog(log)}><Pencil size={16} /></button>
                            <button className="btn-icon p-1 text-danger" onClick={() => handleDeleteLog(log.id)}><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="p-8 text-center text-muted">
                    {selectedMonth ? `No transactions for ${selectedMonth}.` : 'No vault transactions yet.'}
                  </div>
                )}
              </div>

            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg-col-span-4 flex flex-col gap-6">
          <div className="rounded-2xl overflow-hidden border border-glass-border" style={{ background: 'var(--surface-color)' }}>
            <div className="p-6 flex items-center gap-4 border-b border-glass-border" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(99,102,241,0.1) 100%)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#6366f1)' }}>
                <PiggyBank size={24} className="text-white" />
              </div>
              <div>
                <div className="text-xs text-muted mb-1" style={{ letterSpacing: '0.1em' }}>VAULT BALANCE</div>
                <div className="text-white font-bold" style={{ fontSize: '1.75rem', lineHeight: 1 }}>
                  ${parseFloat(data.totalSavings).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="p-6 grid gap-3">
              <button onClick={() => { setLogForm({ ...logForm, type: 'DEPOSIT' }); setShowLogForm(true); }} className="btn w-full flex items-center gap-3 py-3" style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="bg-accent bg-opacity-20 p-1 rounded-md"><Plus size={18} /></div> Add to Vault
              </button>
              <button onClick={() => { setLogForm({ ...logForm, type: 'WITHDRAWAL' }); setShowLogForm(true); }} className="btn w-full flex items-center gap-3 py-3" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="bg-danger bg-opacity-20 p-1 rounded-md"><ArrowDownCircle size={18} /></div> Spend from Vault
              </button>
            </div>
          </div>

          {showLogForm && (
            <div className="glass-card animate-fade-in" style={{ border: '1px solid var(--primary-light)', background: 'rgba(99,102,241,0.05)' }}>
              <h4 className="text-lg mb-4">
                {logForm.type === 'DEPOSIT' ? 'Deposit to Vault' : 'Withdraw from Vault'}
              </h4>
              <form onSubmit={handleLogSubmit} className="grid gap-4">
                <div className="input-group">
                  <label className="input-label">Amount</label>
                  <input type="number" className="input-field" value={logForm.amount} onChange={e => setLogForm({ ...logForm, amount: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Description</label>
                  <input type="text" className="input-field" placeholder="Why this move?" value={logForm.description} onChange={e => setLogForm({ ...logForm, description: e.target.value })} required />
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="submit" className="btn btn-primary flex-1">Confirm</button>
                  <button type="button" onClick={() => setShowLogForm(false)} className="btn btn-outline flex-1">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {completedGoals.length > 0 && (
            <div className="glass-card" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🏆</span>
                <h3 className="text-lg font-bold" style={{ color: '#fbbf24' }}>Hall of Fame</h3>
              </div>
              <div className="grid gap-3">
                {completedGoals.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between text-sm p-3 rounded-lg bg-black bg-opacity-20">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-accent" />
                      <span className="font-medium text-white">{goal.name}</span>
                    </div>
                    <button onClick={() => handleOpenEditGoal(goal)} className="btn-icon p-1"><Pencil size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Edit Goal Modal */}
      {editGoalId && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card w-full max-w-md animate-fade-in" style={{ border: '1px solid var(--primary)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Edit Goal</h3>
              <button onClick={() => setEditGoalId(null)} className="btn-icon"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditGoalSubmit} className="grid gap-4">
              <div className="input-group">
                <label className="input-label">Goal Name</label>
                <input type="text" className="input-field" value={editGoalForm.name} onChange={e => setEditGoalForm({ ...editGoalForm, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">Target Amount ($)</label>
                  <input type="number" min="1" step="0.01" className="input-field" value={editGoalForm.targetAmount} onChange={e => setEditGoalForm({ ...editGoalForm, targetAmount: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Months</label>
                  <input type="number" min="1" className="input-field" value={editGoalForm.targetMonths} onChange={e => setEditGoalForm({ ...editGoalForm, targetMonths: e.target.value })} required />
                </div>
              </div>
              {editGoalForm.targetAmount && editGoalForm.targetMonths && (
                <div className="p-3 rounded-lg text-sm bg-primary bg-opacity-10 text-primary">
                  New monthly: <strong className="text-white">${(parseFloat(editGoalForm.targetAmount) / parseInt(editGoalForm.targetMonths)).toFixed(2)}/mo</strong>
                </div>
              )}
              <p className="text-xs text-muted">Renaming will also update the wallet transactions and vault logs to match.</p>
              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn btn-primary flex-1"><Save size={18} /> Save Changes</button>
                <button type="button" onClick={() => setEditGoalId(null)} className="btn btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extend Goal Modal */}
      {extendGoalId && extendGoalData && (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card w-full max-w-md animate-fade-in" style={{ border: '1px solid var(--primary)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Extend Goal</h3>
              <button onClick={() => setExtendGoalId(null)} className="btn-icon"><X size={20} /></button>
            </div>
            <p className="text-sm text-muted mb-6">
              Original target: <strong className="text-white">${parseFloat(extendGoalData.targetAmount).toLocaleString()}</strong>.<br/>
              The amount you've already saved will be moved to your vault. Enter how much is still remaining and how many months you need.
            </p>
            <form onSubmit={handleExtendSubmit} className="grid gap-4">
              <div className="input-group">
                <label className="input-label">Remaining Amount ($)</label>
                <input type="number" min="0" max={extendGoalData.targetAmount} step="0.01" className="input-field" placeholder={`Max: $${parseFloat(extendGoalData.targetAmount).toLocaleString()}`} value={extendForm.remainingAmount} onChange={e => setExtendForm({ ...extendForm, remainingAmount: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Months Needed</label>
                <input type="number" min="1" className="input-field" placeholder="e.g. 2" value={extendForm.newMonths} onChange={e => setExtendForm({ ...extendForm, newMonths: e.target.value })} required />
              </div>
              {extendForm.remainingAmount && extendForm.newMonths && (
                <div className="p-3 rounded-lg text-sm bg-primary bg-opacity-10 text-primary">
                  <div className="mb-1">Saved so far → vault: <strong className="text-accent">${(parseFloat(extendGoalData.targetAmount) - parseFloat(extendForm.remainingAmount || 0)).toFixed(2)}</strong></div>
                  <div>New monthly: <strong className="text-white">${(parseFloat(extendForm.remainingAmount) / parseInt(extendForm.newMonths)).toFixed(2)}/mo</strong></div>
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn btn-primary flex-1">Confirm</button>
                <button type="button" onClick={() => setExtendGoalId(null)} className="btn btn-outline flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsPage;
