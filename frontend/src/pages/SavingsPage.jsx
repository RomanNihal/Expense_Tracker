import React, { useState, useEffect } from 'react';
import { savingsService, expenseService } from '../services/api';
import {
  PiggyBank, CheckCircle2, Clock, Plus, ArrowUpCircle, ArrowDownCircle,
  History, Target, Trash2, Pencil, X, AlertTriangle, Save, Shield
} from 'lucide-react';

const isGoalOverdue = (goal) => {
  const startMonthStr = goal.startMonth || goal.createdAt?.slice(0, 7);
  if (!startMonthStr) return false;
  const [sy, sm] = startMonthStr.split('-').map(Number);
  const now = new Date();
  const monthsElapsed = (now.getFullYear() * 12 + now.getMonth() + 1) - (sy * 12 + sm);
  return monthsElapsed >= goal.targetMonths;
};

const SavingsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ amount: '', description: '', type: 'DEPOSIT' });
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [editLogId, setEditLogId] = useState(null);
  const [editLogForm, setEditLogForm] = useState({ amount: '', description: '', date: '' });
  const [extendGoalId, setExtendGoalId] = useState(null);
  const [extendForm, setExtendForm] = useState({ remainingAmount: '', newMonths: '' });
  const [editGoalId, setEditGoalId] = useState(null);
  const [editGoalForm, setEditGoalForm] = useState({ name: '', targetAmount: '', targetMonths: '' });

  const fetchData = async () => {
    try { const res = await savingsService.getSavingsData(); setData(res.data.data); setLoading(false); }
    catch (err) { console.error(err); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleCompleteGoal = async id => { if (window.confirm('Mark this goal as completed?')) { await savingsService.completeGoal(id); fetchData(); } };
  const handleOpenExtend = goal => { setExtendForm({ remainingAmount: '', newMonths: '' }); setExtendGoalId(goal.id); };
  const handleOpenEditGoal = goal => { setEditGoalForm({ name: goal.name, targetAmount: goal.targetAmount, targetMonths: goal.targetMonths }); setEditGoalId(goal.id); };
  const handleEditGoalSubmit = async e => { e.preventDefault(); await expenseService.updateGoal(editGoalId, editGoalForm); setEditGoalId(null); fetchData(); };
  const handleExtendSubmit = async e => {
    e.preventDefault();
    const remaining = parseFloat(extendForm.remainingAmount), months = parseInt(extendForm.newMonths);
    if (isNaN(remaining) || isNaN(months) || remaining < 0 || months < 1) return;
    await savingsService.extendGoal(extendGoalId, { remainingAmount: remaining, newMonths: months });
    setExtendGoalId(null); fetchData();
  };
  const handleDeleteGoal = async id => { if (window.confirm('Delete this goal?')) { await savingsService.deleteGoal(id); fetchData(); } };
  const handleLogSubmit = async e => { e.preventDefault(); await savingsService.addLog(logForm); setLogForm({ amount: '', description: '', type: 'DEPOSIT' }); setShowLogForm(false); fetchData(); };
  const handleEditLog = log => { setEditLogId(log.id); setEditLogForm({ amount: log.amount, description: log.description, date: log.date }); };
  const handleEditLogSubmit = async e => { e.preventDefault(); await savingsService.updateLog(editLogId, editLogForm); setEditLogId(null); fetchData(); };
  const handleDeleteLog = async id => { if (window.confirm('Delete this vault transaction?')) { await savingsService.deleteLog(id); fetchData(); } };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <PiggyBank size={40} color="var(--primary)" />
        <p className="text-muted text-sm">Loading vault…</p>
      </div>
    </div>
  );

  const activeGoals = data.goals.filter(g => g.isActive && !g.isCompleted);
  const completedGoals = data.goals.filter(g => g.isCompleted);
  const filteredLogs = selectedMonth ? data.logs.filter(l => (l.date || '').startsWith(selectedMonth)) : data.logs;
  const formatMonth = ym => { if (!ym) return ''; const [y, m] = ym.split('-'); return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('default', { month: 'short', year: 'numeric' }); };

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
    <div className="container">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} color="var(--primary)" />
              <span className="text-xs" style={{ color: 'var(--primary)' }}>SAVINGS</span>
            </div>
            <h1 className="text-h1">Savings Vault</h1>
          </div>
          <div style={{
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--primary-subtle) 0%, var(--accent-subtle) 100%)',
            border: '1px solid var(--glass-border)',
            textAlign: 'center',
          }}>
            <div className="text-xs" style={{ marginBottom: '4px' }}>TOTAL SAVINGS</div>
            <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--text-primary)' }}>
              ${parseFloat(data.totalSavings).toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      {/* Vault Monthly Breakdown */}
      {vaultMonthlyHistory.length > 0 && (
        <div className="mb-8 animate-fade-in stagger-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs">VAULT MONTHLY BREAKDOWN</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>tap to filter</span>
          </div>
          <div className="flex gap-3 overflow-x-auto" style={{ paddingBottom: '0.5rem' }}>
            {vaultMonthlyHistory.map(([month, totals]) => {
              const net = totals.deposits + totals.completions - totals.withdrawals;
              const isActive = selectedMonth === month;
              return (
                <div key={month} onClick={() => setSelectedMonth(isActive ? '' : month)} className="flex-shrink-0 cursor-pointer overflow-hidden" style={{
                  minWidth: '180px', borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${isActive ? 'var(--primary)' : 'var(--glass-border)'}`,
                  background: isActive ? 'var(--primary-subtle)' : 'var(--glass-bg)',
                  transition: 'all var(--duration-normal) var(--ease-out)',
                }}>
                  <div style={{ height: '3px', background: net >= 0 ? 'var(--accent)' : 'var(--danger)' }} />
                  <div style={{ padding: '0.75rem 0.875rem', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: isActive ? 'var(--primary)' : 'var(--text-primary)' }}>{formatMonth(month)}</div>
                  </div>
                  <div style={{ padding: '0.625rem 0.875rem', display: 'grid', gap: '0.25rem' }}>
                    <div className="flex justify-between" style={{ fontSize: '0.75rem' }}>
                      <span className="flex items-center gap-1 text-muted"><ArrowUpCircle size={12} color="var(--accent)" />In</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>+${totals.deposits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between" style={{ fontSize: '0.75rem' }}>
                      <span className="flex items-center gap-1 text-muted"><ArrowDownCircle size={12} color="var(--danger)" />Out</span>
                      <span style={{ fontWeight: 700, color: 'var(--danger)' }}>-${totals.withdrawals.toLocaleString()}</span>
                    </div>
                    {totals.completions > 0 && (
                      <div className="flex justify-between" style={{ fontSize: '0.75rem' }}>
                        <span className="flex items-center gap-1 text-muted"><CheckCircle2 size={12} color="var(--primary)" />Goals</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>+${totals.completions.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center" style={{ padding: '0.5rem 0.875rem', background: net >= 0 ? 'hsla(160,84%,39%,0.04)' : 'hsla(0,84%,60%,0.04)' }}>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Net</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800, color: net >= 0 ? 'var(--accent)' : 'var(--danger)' }}>{net >= 0 ? '+' : ''}${Math.abs(net).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="flex flex-col gap-6 lg-col-span-8">

          {/* Active Goals */}
          <section className="animate-fade-in stagger-2">
            <div className="flex items-center gap-3 mb-6">
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={18} color="var(--primary)" />
              </div>
              <h3 className="text-h3 m-0">Active Goals</h3>
            </div>
            <div className="grid md-grid-cols-2 gap-4">
              {activeGoals.map(goal => {
                const overdue = isGoalOverdue(goal);
                return (
                  <div key={goal.id} className="glass-card flex flex-col" style={{ borderColor: overdue ? 'hsla(0,84%,60%,0.35)' : undefined }}>
                    {overdue && (
                      <div className="flex items-center gap-2 mb-3" style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>
                        <AlertTriangle size={14} /> Period ended — extend or delete
                      </div>
                    )}
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{goal.name}</div>
                    <div className="text-sm text-muted mb-4">
                      Target: ${parseFloat(goal.targetAmount).toLocaleString()} · {goal.targetMonths} mo
                    </div>
                    <div className="flex justify-between text-sm mb-4 mt-auto">
                      <span className="text-muted">Monthly</span>
                      <span style={{ fontWeight: 700 }}>${parseFloat(goal.monthlySavings).toFixed(2)}/mo</span>
                    </div>
                    <div className="flex gap-2">
                      {!overdue && (
                        <button onClick={() => handleCompleteGoal(goal.id)} className="btn flex-1" style={{ background: 'var(--accent)', color: 'white', boxShadow: 'var(--shadow-accent)' }}>
                          <CheckCircle2 size={16} /> Done
                        </button>
                      )}
                      <button onClick={() => handleOpenExtend(goal)} className="btn btn-outline flex-1"><Clock size={16} /> Extend</button>
                      <button onClick={() => handleOpenEditGoal(goal)} className="btn-icon" style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}><Pencil size={15} /></button>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="btn-icon hover:text-danger" style={{ border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}><Trash2 size={15} /></button>
                    </div>
                  </div>
                );
              })}
              {activeGoals.length === 0 && (
                <div className="glass-card text-center text-muted" style={{ padding: '2.5rem', gridColumn: '1 / -1' }}>
                  No active goals. Create one from the dashboard!
                </div>
              )}
            </div>
          </section>

          {/* Vault Transactions */}
          <section className="animate-fade-in stagger-3">
            <div className="glass-card no-padding">
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)', background: 'hsla(0,0%,100%,0.015)' }}>
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <History size={16} color="var(--primary)" />
                    </div>
                    <h3 className="text-h3 m-0">Vault Log</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="month" className="input-field" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: '140px', padding: '0.375rem 0.625rem', fontSize: '0.8125rem', background: 'var(--bg-raised)' }} />
                    <button onClick={() => setSelectedMonth('')} className={`btn ${!selectedMonth ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>All</button>
                  </div>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="table-scroll desktop-only">
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Description</th><th style={{ textAlign: 'right' }}>Amount</th><th style={{ width: '80px' }}></th></tr></thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id}>
                        {editLogId === log.id ? (
                          <td colSpan={4}>
                            <form onSubmit={handleEditLogSubmit} className="flex gap-2 items-center">
                              <input type="date" className="input-field py-1" value={editLogForm.date} onChange={e => setEditLogForm({...editLogForm, date: e.target.value})} required />
                              <input type="number" className="input-field py-1" style={{ width: '100px' }} value={editLogForm.amount} onChange={e => setEditLogForm({...editLogForm, amount: e.target.value})} required />
                              <input type="text" className="input-field py-1 flex-1" value={editLogForm.description} onChange={e => setEditLogForm({...editLogForm, description: e.target.value})} required />
                              <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.75rem' }}>Save</button>
                              <button type="button" onClick={() => setEditLogId(null)} className="btn-icon"><X size={16}/></button>
                            </form>
                          </td>
                        ) : (
                          <>
                            <td className="text-muted" style={{ fontSize: '0.8125rem' }}>{log.date}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                {log.type === 'DEPOSIT' && <ArrowUpCircle size={16} color="var(--accent)" />}
                                {log.type === 'WITHDRAWAL' && <ArrowDownCircle size={16} color="var(--danger)" />}
                                {log.type === 'GOAL_COMPLETION' && <CheckCircle2 size={16} color="var(--primary)" />}
                                <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{log.description}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.9375rem', color: (log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION') ? 'var(--accent)' : 'var(--danger)' }}>
                              {(log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION') ? '+' : '-'}${parseFloat(log.amount).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="flex gap-1 justify-end">
                                <button className="btn-icon" onClick={() => handleEditLog(log)}><Pencil size={14}/></button>
                                <button className="btn-icon hover:text-danger" onClick={() => handleDeleteLog(log.id)}><Trash2 size={14}/></button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && <tr><td colSpan={4} className="text-center text-muted" style={{ padding: '2.5rem' }}>{selectedMonth ? `No entries for ${formatMonth(selectedMonth)}.` : 'No vault transactions yet.'}</td></tr>}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="mobile-card-list mobile-only">
                {filteredLogs.map(log => (
                  <div key={log.id} style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'hsla(0,0%,100%,0.02)', border: '1px solid var(--glass-border)' }}>
                    {editLogId === log.id ? (
                      <div className="grid gap-3">
                        <input type="date" className="input-field" value={editLogForm.date} onChange={e => setEditLogForm({...editLogForm, date: e.target.value})} required />
                        <input type="text" className="input-field" value={editLogForm.description} onChange={e => setEditLogForm({...editLogForm, description: e.target.value})} required />
                        <input type="number" className="input-field" value={editLogForm.amount} onChange={e => setEditLogForm({...editLogForm, amount: e.target.value})} required />
                        <div className="flex gap-2"><button onClick={handleEditLogSubmit} className="btn btn-primary flex-1" style={{ padding: '0.5rem' }}>Save</button><button onClick={() => setEditLogId(null)} className="btn btn-outline flex-1" style={{ padding: '0.5rem' }}>Cancel</button></div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1" style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                              {log.type === 'DEPOSIT' && <ArrowUpCircle size={14} color="var(--accent)" />}
                              {log.type === 'WITHDRAWAL' && <ArrowDownCircle size={14} color="var(--danger)" />}
                              {log.type === 'GOAL_COMPLETION' && <CheckCircle2 size={14} color="var(--primary)" />}
                              {log.description}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{log.date}</div>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: (log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION') ? 'var(--accent)' : 'var(--danger)' }}>
                            {(log.type === 'DEPOSIT' || log.type === 'GOAL_COMPLETION') ? '+' : '-'}${parseFloat(log.amount).toFixed(2)}
                          </div>
                        </div>
                        <div className="flex justify-end" style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                          <div className="flex gap-1"><button className="btn-icon" onClick={() => handleEditLog(log)}><Pencil size={14}/></button><button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteLog(log.id)}><Trash2 size={14}/></button></div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {filteredLogs.length === 0 && <div className="text-center text-muted" style={{ padding: '2rem' }}>{selectedMonth ? `No entries for ${formatMonth(selectedMonth)}.` : 'No vault transactions yet.'}</div>}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg-col-span-4 flex flex-col gap-6 animate-fade-in stagger-3">
          {/* Vault Action Panel */}
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--bg-surface)' }}>
            <div className="flex items-center gap-3" style={{
              padding: '1.25rem',
              borderBottom: '1px solid var(--glass-border)',
              background: 'linear-gradient(135deg, var(--accent-subtle) 0%, var(--primary-subtle) 100%)',
            }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--accent), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PiggyBank size={20} color="white" />
              </div>
              <div>
                <div className="text-xs" style={{ marginBottom: '2px' }}>VAULT BALANCE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>${parseFloat(data.totalSavings).toLocaleString()}</div>
              </div>
            </div>
            <div style={{ padding: '1rem', display: 'grid', gap: '0.5rem' }}>
              <button onClick={() => { setLogForm({...logForm, type: 'DEPOSIT'}); setShowLogForm(true); }} className="btn w-full" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid hsla(160,84%,39%,0.15)', justifyContent: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem' }}>
                <Plus size={16} /> Add to Vault
              </button>
              <button onClick={() => { setLogForm({...logForm, type: 'WITHDRAWAL'}); setShowLogForm(true); }} className="btn w-full" style={{ background: 'var(--danger-subtle)', color: 'var(--danger)', border: '1px solid hsla(0,84%,60%,0.15)', justifyContent: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem' }}>
                <ArrowDownCircle size={16} /> Withdraw
              </button>
            </div>
          </div>

          {/* Log Form */}
          {showLogForm && (
            <div className="glass-card animate-fade-in" style={{ borderColor: 'hsla(239,84%,67%,0.25)', background: 'var(--primary-subtle)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                {logForm.type === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
              </h4>
              <form onSubmit={handleLogSubmit} className="grid gap-3">
                <div className="input-group"><label className="input-label">Amount</label><input type="number" className="input-field" value={logForm.amount} onChange={e => setLogForm({...logForm, amount: e.target.value})} required /></div>
                <div className="input-group"><label className="input-label">Description</label><input type="text" className="input-field" placeholder="Why?" value={logForm.description} onChange={e => setLogForm({...logForm, description: e.target.value})} required /></div>
                <div className="flex gap-2 mt-1"><button type="submit" className="btn btn-primary flex-1">Confirm</button><button type="button" onClick={() => setShowLogForm(false)} className="btn btn-outline flex-1">Cancel</button></div>
              </form>
            </div>
          )}

          {/* Hall of Fame */}
          {completedGoals.length > 0 && (
            <div className="glass-card" style={{ background: 'var(--warning-subtle)', borderColor: 'hsla(38,92%,50%,0.15)' }}>
              <div className="flex items-center gap-2 mb-4">
                <span style={{ fontSize: '1.125rem' }}>🏆</span>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--warning)' }}>Hall of Fame</h3>
              </div>
              <div className="flex flex-col gap-2">
                {completedGoals.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between" style={{ padding: '0.5rem 0.625rem', borderRadius: 'var(--radius-sm)', background: 'hsla(0,0%,0%,0.15)', fontSize: '0.8125rem' }}>
                    <div className="flex items-center gap-2"><CheckCircle2 size={15} color="var(--accent)" /><span style={{ fontWeight: 600 }}>{goal.name}</span></div>
                    <button onClick={() => handleOpenEditGoal(goal)} className="btn-icon" style={{ padding: '2px' }}><Pencil size={13} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Edit Goal Modal */}
      {editGoalId && (
        <div style={{ position: 'fixed', inset: 0, background: 'hsla(222,47%,6%,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card w-full max-w-md animate-fade-in" style={{ borderColor: 'var(--primary)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Edit Goal</h3>
              <button onClick={() => setEditGoalId(null)} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleEditGoalSubmit} className="grid gap-4">
              <div className="input-group"><label className="input-label">Goal Name</label><input type="text" className="input-field" value={editGoalForm.name} onChange={e => setEditGoalForm({...editGoalForm, name: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="input-group"><label className="input-label">Target ($)</label><input type="number" min="1" step="0.01" className="input-field" value={editGoalForm.targetAmount} onChange={e => setEditGoalForm({...editGoalForm, targetAmount: e.target.value})} required /></div>
                <div className="input-group"><label className="input-label">Months</label><input type="number" min="1" className="input-field" value={editGoalForm.targetMonths} onChange={e => setEditGoalForm({...editGoalForm, targetMonths: e.target.value})} required /></div>
              </div>
              {editGoalForm.targetAmount && editGoalForm.targetMonths && (
                <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', fontSize: '0.8125rem', color: 'var(--primary)' }}>
                  New monthly: <strong style={{ color: 'var(--text-primary)' }}>${(parseFloat(editGoalForm.targetAmount) / parseInt(editGoalForm.targetMonths)).toFixed(2)}/mo</strong>
                </div>
              )}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Renaming updates wallet & vault entries too.</p>
              <div className="flex gap-3"><button type="submit" className="btn btn-primary flex-1"><Save size={16} /> Save</button><button type="button" onClick={() => setEditGoalId(null)} className="btn btn-outline flex-1">Cancel</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Extend Goal Modal */}
      {extendGoalId && extendGoalData && (
        <div style={{ position: 'fixed', inset: 0, background: 'hsla(222,47%,6%,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card w-full max-w-md animate-fade-in" style={{ borderColor: 'var(--primary)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Extend Goal</h3>
              <button onClick={() => setExtendGoalId(null)} className="btn-icon"><X size={18} /></button>
            </div>
            <p className="text-sm text-muted mb-6">
              Original target: <strong style={{ color: 'var(--text-primary)' }}>${parseFloat(extendGoalData.targetAmount).toLocaleString()}</strong>.<br/>
              Saved amount goes to vault. Enter remaining and timeline.
            </p>
            <form onSubmit={handleExtendSubmit} className="grid gap-4">
              <div className="input-group"><label className="input-label">Remaining ($)</label><input type="number" min="0" max={extendGoalData.targetAmount} step="0.01" className="input-field" placeholder={`Max: $${parseFloat(extendGoalData.targetAmount).toLocaleString()}`} value={extendForm.remainingAmount} onChange={e => setExtendForm({...extendForm, remainingAmount: e.target.value})} required /></div>
              <div className="input-group"><label className="input-label">Months Needed</label><input type="number" min="1" className="input-field" placeholder="e.g. 2" value={extendForm.newMonths} onChange={e => setExtendForm({...extendForm, newMonths: e.target.value})} required /></div>
              {extendForm.remainingAmount && extendForm.newMonths && (
                <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <div>Saved → vault: <strong style={{ color: 'var(--accent)' }}>${(parseFloat(extendGoalData.targetAmount) - parseFloat(extendForm.remainingAmount || 0)).toFixed(2)}</strong></div>
                  <div>New monthly: <strong style={{ color: 'var(--text-primary)' }}>${(parseFloat(extendForm.remainingAmount) / parseInt(extendForm.newMonths)).toFixed(2)}/mo</strong></div>
                </div>
              )}
              <div className="flex gap-3"><button type="submit" className="btn btn-primary flex-1">Confirm</button><button type="button" onClick={() => setExtendGoalId(null)} className="btn btn-outline flex-1">Cancel</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsPage;
