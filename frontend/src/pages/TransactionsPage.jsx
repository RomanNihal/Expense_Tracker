import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/api';
import {
  Trash2,
  Search,
  ArrowUpCircle,
  TrendingDown,
  Settings,
  Edit2,
  Save,
  X,
  TrendingUp,
  PiggyBank
} from 'lucide-react';


const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [fixedIncomes, setFixedIncomes] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  // Editing state for fixed items (Sidebar)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', amount: '' });

  // Editing state for Ledger History
  const [editingLedgerId, setEditingLedgerId] = useState(null);
  const [ledgerEditForm, setLedgerEditForm] = useState({ name: '', amount: '', expenseDate: '', type: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, fixedIncRes, fixedExpRes] = await Promise.all([
        expenseService.getTransactions(),
        expenseService.getFixedIncomes(),
        expenseService.getFixedExpenses()
      ]);
      setTransactions(transRes.data.data);
      setFixedIncomes(fixedIncRes.data.data);
      setFixedExpenses(fixedExpRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction from history?')) {
      await expenseService.deleteTransaction(id);
      fetchData();
    }
  };

  const handleFixedDelete = async (id, type) => {
    if (window.confirm(`Delete this fixed ${type}?`)) {
      if (type === 'income') {
        await expenseService.deleteFixedIncome(id);
      } else {
        await expenseService.deleteFixedExpense(id);
      }
      fetchData();
    }
  };

  const startEditing = (item, type) => {
    setEditingId(item.id);
    setEditForm({
      name: item.source || item.name,
      amount: item.amount,
      type // 'income' or 'expense'
    });
  };

  const saveEdit = async () => {
    try {
      if (editForm.type === 'income') {
        await expenseService.updateFixedIncome(editingId, { source: editForm.name, amount: editForm.amount });
      } else {
        await expenseService.updateFixedExpense(editingId, { name: editForm.name, amount: editForm.amount });
      }
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert('Failed to update fixed item: ' + (err.response?.data?.error || err.message));
    }
  };

  const startLedgerEdit = (t) => {
    setEditingLedgerId(t.id);
    setLedgerEditForm({
      name: t.name,
      amount: t.amount,
      expenseDate: t.expenseDate,
      type: t.type
    });
  };

  const saveLedgerEdit = async () => {
    try {
      await expenseService.updateTransaction(editingLedgerId, ledgerEditForm);
      setEditingLedgerId(null);
      fetchData();
    } catch (err) {
      alert('Failed to update transaction: ' + (err.response?.data?.error || err.message));
    }
  };



  // Build per-month totals from all transactions (unfiltered)
  const monthlyHistory = (() => {
    const map = {};
    transactions.forEach(t => {
      const month = (t.expenseDate || '').slice(0, 7);
      if (!month) return;
      if (!map[month]) map[month] = { income: 0, expenses: 0, savings: 0 };
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'INCOME') map[month].income += amt;
      else if (t.type === 'EXPENSE') map[month].expenses += amt;
      else if (t.type === 'SAVINGS') map[month].savings += amt;
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  })();

  const formatMonth = (ym) => {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'ALL' || t.type === filterType;
      const matchesMonth = !selectedMonth || (t.expenseDate || '').startsWith(selectedMonth);
      return matchesSearch && matchesFilter && matchesMonth;
    })

    .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading ledger...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }} className="animate-fade-in page-outer">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Your Wallet</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Transaction history and recurring settings</p>
      </header>

      {/* Monthly Overview */}
      {monthlyHistory.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monthly Breakdown</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.6 }}>— click a card to filter</span>
          </div>
          <div style={{ display: 'flex', gap: '0.875rem', overflowX: 'auto', paddingBottom: '0.75rem' }}>
            {monthlyHistory.map(([month, totals]) => {
              const net = totals.income - totals.expenses - totals.savings;
              const isActive = selectedMonth === month;
              const netColor = net >= 0 ? '#10b981' : '#ef4444';
              return (
                <div
                  key={month}
                  onClick={() => setSelectedMonth(isActive ? '' : month)}
                  style={{
                    minWidth: '185px',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                    border: `1px solid ${isActive ? 'var(--primary)' : 'rgba(255,255,255,0.07)'}`,
                    background: isActive ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                    boxShadow: isActive ? '0 0 0 1px var(--primary)' : 'none'
                  }}
                >
                  {/* Top accent bar */}
                  <div style={{ height: '3px', background: net >= 0 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#ef4444,#f87171)' }} />

                  {/* Month header */}
                  <div style={{ padding: '0.875rem 1.1rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isActive ? 'var(--primary)' : 'white', letterSpacing: '-0.01em' }}>
                      {formatMonth(month)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ padding: '0.75rem 1.1rem', display: 'grid', gap: '0.45rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <TrendingUp size={11} color="#10b981" />
                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>Income</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>+${totals.income.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <TrendingDown size={11} color="#ef4444" />
                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>Expenses</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444' }}>-${totals.expenses.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <PiggyBank size={11} color="#818cf8" />
                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>Savings</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#818cf8' }}>-${totals.savings.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Net footer */}
                  <div style={{ padding: '0.6rem 1.1rem', background: net >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Net</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: netColor }}>
                      {net >= 0 ? '+' : ''}${Math.abs(net).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="two-col-layout">
        {/* Main List */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Ledger History</h3>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem' }}>
                  <Search size={14} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '0.875rem', width: '130px' }}
                  />
                </div>
                {/* Type filter */}
                <select
                  className="custom-select"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                >
                  <option value="ALL" style={{ background: 'var(--bg)' }}>All Types</option>
                  <option value="INCOME" style={{ background: 'var(--bg)' }}>Income</option>
                  <option value="EXPENSE" style={{ background: 'var(--bg)' }}>Expenses</option>
                  <option value="SAVINGS" style={{ background: 'var(--bg)' }}>Savings</option>
                </select>
                {/* Month filter */}
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.07)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', color: 'white', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}
                />
                {/* Always-visible All toggle */}
                <button
                  onClick={() => setSelectedMonth('')}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: !selectedMonth ? 700 : 500,
                    border: `1px solid ${!selectedMonth ? 'var(--primary)' : 'var(--glass-border)'}`,
                    background: !selectedMonth ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)',
                    color: !selectedMonth ? 'var(--primary)' : 'var(--text-muted)',
                    transition: 'all 0.15s'
                  }}
                >
                  All
                </button>
              </div>
            </div>
          </div>
          
          <div className="table-scroll" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '1.25rem 2rem' }}>Date</th>
                  <th style={{ padding: '1.25rem 2rem' }}>Description</th>
                  <th style={{ padding: '1.25rem 2rem' }}>Type</th>
                  <th style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '1.25rem 2rem', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t, idx) => (
                  <tr key={t.id} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    transition: 'background 0.2s'
                  }} className="hover-row">
                    {editingLedgerId === t.id ? (
                      <>
                        <td style={{ padding: '1rem' }}>
                          <input type="date" style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--primary)', borderRadius: '0.5rem', color: 'white', fontSize: '0.9rem', width: '140px', outline: 'none' }} value={ledgerEditForm.expenseDate} onChange={(e) => setLedgerEditForm({...ledgerEditForm, expenseDate: e.target.value})} />
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <input style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--primary)', borderRadius: '0.5rem', color: 'white', fontSize: '0.9rem', width: '100%', outline: 'none' }} value={ledgerEditForm.name} onChange={(e) => setLedgerEditForm({...ledgerEditForm, name: e.target.value})} />
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--primary)', borderRadius: '0.5rem', color: 'white', fontSize: '0.9rem', outline: 'none' }} value={ledgerEditForm.type} onChange={(e) => setLedgerEditForm({...ledgerEditForm, type: e.target.value})}>
                            <option value="INCOME" style={{ background: 'var(--bg)' }}>INCOME</option>
                            <option value="EXPENSE" style={{ background: 'var(--bg)' }}>EXPENSE</option>
                            <option value="SAVINGS" style={{ background: 'var(--bg)' }}>SAVINGS</option>
                          </select>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <input type="number" style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--primary)', borderRadius: '0.5rem', color: 'white', fontSize: '0.9rem', width: '100px', textAlign: 'right', outline: 'none' }} value={ledgerEditForm.amount} onChange={(e) => setLedgerEditForm({...ledgerEditForm, amount: e.target.value})} />
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button onClick={saveLedgerEdit} style={{ background: 'var(--primary)', border: 'none', cursor: 'pointer', color: 'white', padding: '0.5rem', borderRadius: '0.4rem', display: 'flex' }}><Save size={20}/></button>
                            <button onClick={() => setEditingLedgerId(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'white', padding: '0.5rem', borderRadius: '0.4rem', display: 'flex' }}><X size={20}/></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '1.25rem 2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t.expenseDate}</td>
                        <td style={{ padding: '1.25rem 2rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{t.name}</div>
                          {t.isFixed && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>Automated</span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1.25rem 2rem' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '4px 10px', 
                            borderRadius: '2rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            background: t.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : t.type === 'EXPENSE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: t.type === 'INCOME' ? '#10b981' : t.type === 'EXPENSE' ? '#ef4444' : '#3b82f6',
                            border: `1px solid ${t.type === 'INCOME' ? 'rgba(16, 185, 129, 0.2)' : t.type === 'EXPENSE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                          }}>
                            {t.type}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '1.25rem 2rem', 
                          textAlign: 'right', 
                          fontSize: '1.15rem',
                          fontWeight: 800,
                          color: t.type === 'INCOME' ? 'var(--accent)' : 'var(--danger)'
                        }}>
                          {t.type === 'INCOME' ? '+' : '-'}${(parseFloat(t.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '1.25rem 2rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <Edit2 
                              size={18} 
                              style={{ cursor: 'pointer', color: 'var(--text-muted)' }} 
                              onClick={() => startLedgerEdit(t)} 
                            />
                            <button 
                              onClick={() => handleDelete(t.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                              onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}

              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div style={{ padding: '6rem', textAlign: 'center' }}>
                <Search size={48} color="var(--glass-border)" style={{ marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No transactions found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Fixed Settings */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ border: '1px solid rgba(16, 185, 129, 0.2)', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent)' }}>
              <ArrowUpCircle size={24} />
              Monthly Income
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {fixedIncomes.map(inc => (
                <div key={inc.id} style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.03)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  {editingId === inc.id ? (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <input style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--primary)', borderRadius: '0.5rem', color: 'white', outline: 'none' }} value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                      <input type="number" style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--primary)', borderRadius: '0.5rem', color: 'white', outline: 'none' }} value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={saveEdit} className="btn btn-primary" style={{ flex: 1, padding: '0.6rem', justifyContent: 'center' }}><Save size={18}/> Save</button>
                        <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ flex: 1, padding: '0.6rem', justifyContent: 'center', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}><X size={18}/> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{inc.source}</div>
                        <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.25rem' }}>+${inc.amount}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Edit2 size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => startEditing(inc, 'income')} />
                        <Trash2 size={18} color="var(--danger)" style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => handleFixedDelete(inc.id, 'income')} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {fixedIncomes.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem' }}>No fixed income set.</p>}
            </div>
          </div>

          <div className="glass-card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)' }}>
              <TrendingDown size={24} />
              Monthly Costs
            </h3>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {fixedExpenses.map(exp => (
                <div key={exp.id} style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.03)', borderRadius: '1rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  {editingId === exp.id ? (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <input style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--primary)', borderRadius: '0.5rem', color: 'white', outline: 'none' }} value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                      <input type="number" style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--primary)', borderRadius: '0.5rem', color: 'white', outline: 'none' }} value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={saveEdit} className="btn btn-primary" style={{ flex: 1, padding: '0.6rem', justifyContent: 'center' }}><Save size={18}/> Save</button>
                        <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ flex: 1, padding: '0.6rem', justifyContent: 'center', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}><X size={18}/> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{exp.name}</div>
                        <div style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '1.25rem' }}>-${exp.amount}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Edit2 size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => startEditing(exp, 'expense')} />
                        <Trash2 size={18} color="var(--danger)" style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => handleFixedDelete(exp.id, 'expense')} />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {fixedExpenses.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem' }}>No fixed costs set.</p>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TransactionsPage;

