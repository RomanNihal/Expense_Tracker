import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/api';
import {
  Trash2, Search, ArrowUpCircle, TrendingDown, Edit2, Save, X,
  TrendingUp, PiggyBank, Filter
} from 'lucide-react';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [fixedIncomes, setFixedIncomes] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', amount: '' });

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
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async id => { if (window.confirm('Delete this transaction?')) { await expenseService.deleteTransaction(id); fetchData(); } };
  const handleFixedDelete = async (id, type) => {
    if (!window.confirm(`Delete this fixed ${type}?`)) return;
    type === 'income' ? await expenseService.deleteFixedIncome(id) : await expenseService.deleteFixedExpense(id);
    fetchData();
  };
  const startEditing = (item, type) => { setEditingId(item.id); setEditForm({ name: item.source || item.name, amount: item.amount, type }); };
  const saveEdit = async () => {
    try {
      editForm.type === 'income'
        ? await expenseService.updateFixedIncome(editingId, { source: editForm.name, amount: editForm.amount })
        : await expenseService.updateFixedExpense(editingId, { name: editForm.name, amount: editForm.amount });
      setEditingId(null); fetchData();
    } catch (err) { alert('Failed: ' + (err.response?.data?.error || err.message)); }
  };
  const startLedgerEdit = t => { setEditingLedgerId(t.id); setLedgerEditForm({ name: t.name, amount: t.amount, expenseDate: t.expenseDate, type: t.type }); };
  const saveLedgerEdit = async () => {
    try { await expenseService.updateTransaction(editingLedgerId, ledgerEditForm); setEditingLedgerId(null); fetchData(); }
    catch (err) { alert('Failed: ' + (err.response?.data?.error || err.message)); }
  };

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

  const formatMonth = ym => {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const filteredTransactions = transactions
    .filter(t => {
      const s = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const f = filterType === 'ALL' || t.type === filterType;
      const m = !selectedMonth || (t.expenseDate || '').startsWith(selectedMonth);
      return s && f && m;
    })
    .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <ArrowUpCircle size={40} color="var(--primary)" />
        <p className="text-muted text-sm">Loading ledger…</p>
      </div>
    </div>
  );

  return (
    <div className="container">
      <header className="mb-8 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <Filter size={16} color="var(--primary)" />
          <span className="text-xs" style={{ color: 'var(--primary)' }}>TRANSACTIONS</span>
        </div>
        <h1 className="text-h1">Your Wallet</h1>
      </header>

      {/* Monthly Breakdown */}
      {monthlyHistory.length > 0 && (
        <div className="mb-8 animate-fade-in stagger-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs">MONTHLY BREAKDOWN</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>tap to filter</span>
          </div>
          <div className="flex gap-3 overflow-x-auto" style={{ paddingBottom: '0.5rem' }}>
            {monthlyHistory.map(([month, totals]) => {
              const net = totals.income - totals.expenses - totals.savings;
              const isActive = selectedMonth === month;
              return (
                <div key={month} onClick={() => setSelectedMonth(isActive ? '' : month)} className="flex-shrink-0 cursor-pointer overflow-hidden" style={{
                  minWidth: '180px',
                  borderRadius: 'var(--radius-lg)',
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
                      <span className="flex items-center gap-1 text-muted"><TrendingUp size={12} color="var(--accent)" />Income</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>+${totals.income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between" style={{ fontSize: '0.75rem' }}>
                      <span className="flex items-center gap-1 text-muted"><TrendingDown size={12} color="var(--danger)" />Expense</span>
                      <span style={{ fontWeight: 700, color: 'var(--danger)' }}>-${totals.expenses.toLocaleString()}</span>
                    </div>
                    {totals.savings > 0 && (
                      <div className="flex justify-between" style={{ fontSize: '0.75rem' }}>
                        <span className="flex items-center gap-1 text-muted"><PiggyBank size={12} color="var(--primary)" />Savings</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>-${totals.savings.toLocaleString()}</span>
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
        {/* Ledger */}
        <div className="glass-card no-padding lg-col-span-8 animate-fade-in stagger-2">
          {/* Toolbar */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)', background: 'hsla(0,0%,100%,0.015)' }}>
            <div className="flex flex-wrap justify-between items-center gap-3">
              <h3 className="text-h3 m-0">Ledger</h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2" style={{ padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'hsla(0,0%,0%,0.2)' }}>
                  <Search size={14} color="var(--text-tertiary)" />
                  <input type="text" placeholder="Search…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '16px', width: '100px', outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <select className="input-field" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: '110px', padding: '0.375rem 0.625rem', fontSize: '0.8125rem', background: 'var(--bg-raised)' }}>
                  <option value="ALL">All</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="SAVINGS">Savings</option>
                </select>
                <input type="month" className="input-field" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: '140px', padding: '0.375rem 0.625rem', fontSize: '0.8125rem', background: 'var(--bg-raised)' }} />
                <button onClick={() => setSelectedMonth('')} className={`btn ${!selectedMonth ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>All</button>
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
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id}>
                    {editingLedgerId === t.id ? (
                      <>
                        <td><input type="date" className="input-field py-1" value={ledgerEditForm.expenseDate} onChange={e => setLedgerEditForm({...ledgerEditForm, expenseDate: e.target.value})} /></td>
                        <td><input className="input-field py-1" value={ledgerEditForm.name} onChange={e => setLedgerEditForm({...ledgerEditForm, name: e.target.value})} /></td>
                        <td><select className="input-field py-1" value={ledgerEditForm.type} onChange={e => setLedgerEditForm({...ledgerEditForm, type: e.target.value})}><option value="INCOME">INCOME</option><option value="EXPENSE">EXPENSE</option><option value="SAVINGS">SAVINGS</option></select></td>
                        <td style={{ textAlign: 'right' }}><input type="number" className="input-field py-1" style={{ width: '90px', textAlign: 'right' }} value={ledgerEditForm.amount} onChange={e => setLedgerEditForm({...ledgerEditForm, amount: e.target.value})} /></td>
                        <td><div className="flex gap-1 justify-center"><button onClick={saveLedgerEdit} className="btn-icon" style={{ color: 'var(--primary)' }}><Save size={16}/></button><button onClick={() => setEditingLedgerId(null)} className="btn-icon"><X size={16}/></button></div></td>
                      </>
                    ) : (
                      <>
                        <td className="text-muted" style={{ fontSize: '0.8125rem' }}>{t.expenseDate}</td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</div>
                          {t.isFixed && <div className="flex items-center gap-1 mt-1"><div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)' }} /><span style={{ fontSize: '0.6875rem', color: 'var(--primary)', fontWeight: 600 }}>Automated</span></div>}
                        </td>
                        <td><span className={`badge ${t.type === 'INCOME' ? 'badge-income' : t.type === 'EXPENSE' ? 'badge-expense' : 'badge-savings'}`}>{t.type}</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.9375rem', color: t.type === 'INCOME' ? 'var(--accent)' : 'var(--danger)' }}>
                          {t.type === 'INCOME' ? '+' : '-'}${(parseFloat(t.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td><div className="flex gap-1 justify-center"><button className="btn-icon" onClick={() => startLedgerEdit(t)}><Edit2 size={15}/></button><button className="btn-icon hover:text-danger" onClick={() => handleDelete(t.id)}><Trash2 size={15}/></button></div></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-card-list mobile-only">
            {filteredTransactions.map(t => (
              <div key={t.id} style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', background: 'hsla(0,0%,100%,0.02)', border: '1px solid var(--glass-border)' }}>
                {editingLedgerId === t.id ? (
                  <div className="grid gap-3">
                    <input type="date" className="input-field" value={ledgerEditForm.expenseDate} onChange={e => setLedgerEditForm({...ledgerEditForm, expenseDate: e.target.value})} />
                    <input className="input-field" value={ledgerEditForm.name} onChange={e => setLedgerEditForm({...ledgerEditForm, name: e.target.value})} />
                    <select className="input-field" value={ledgerEditForm.type} onChange={e => setLedgerEditForm({...ledgerEditForm, type: e.target.value})}><option value="INCOME">INCOME</option><option value="EXPENSE">EXPENSE</option><option value="SAVINGS">SAVINGS</option></select>
                    <input type="number" className="input-field" value={ledgerEditForm.amount} onChange={e => setLedgerEditForm({...ledgerEditForm, amount: e.target.value})} />
                    <div className="flex gap-2"><button onClick={saveLedgerEdit} className="btn btn-primary flex-1" style={{ padding: '0.5rem' }}>Save</button><button onClick={() => setEditingLedgerId(null)} className="btn btn-outline flex-1" style={{ padding: '0.5rem' }}>Cancel</button></div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px' }}>{t.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{t.expenseDate}</div>
                        {t.isFixed && <div style={{ fontSize: '0.6875rem', color: 'var(--primary)', marginTop: '2px', fontWeight: 600 }}>● Auto</div>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: t.type === 'INCOME' ? 'var(--accent)' : 'var(--danger)' }}>
                        {t.type === 'INCOME' ? '+' : '-'}${(parseFloat(t.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="flex justify-between items-center" style={{ paddingTop: '0.625rem', borderTop: '1px solid var(--glass-border)' }}>
                      <span className={`badge ${t.type === 'INCOME' ? 'badge-income' : t.type === 'EXPENSE' ? 'badge-expense' : 'badge-savings'}`}>{t.type}</span>
                      <div className="flex gap-1"><button className="btn-icon" onClick={() => startLedgerEdit(t)}><Edit2 size={14}/></button><button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(t.id)}><Trash2 size={14}/></button></div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center" style={{ padding: '3rem 1.5rem' }}>
              <Search size={40} color="var(--text-tertiary)" style={{ margin: '0 auto 0.75rem' }} />
              <p className="text-muted text-sm">No transactions match your criteria.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg-col-span-4 flex flex-col gap-6 animate-fade-in stagger-3">
          {/* Income */}
          <div className="glass-card" style={{ borderColor: 'hsla(160,84%,39%,0.15)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowUpCircle size={18} color="var(--accent)" />
              </div>
              <h3 className="text-h3 m-0" style={{ color: 'var(--accent)' }}>Monthly Income</h3>
            </div>
            <div className="flex flex-col gap-3">
              {fixedIncomes.map(inc => (
                <div key={inc.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', border: '1px solid hsla(160,84%,39%,0.12)' }}>
                  {editingId === inc.id ? (
                    <div className="grid gap-2">
                      <input className="input-field py-1" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      <input type="number" className="input-field py-1" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} />
                      <div className="flex gap-2"><button onClick={saveEdit} className="btn btn-primary flex-1" style={{ padding: '0.375rem', fontSize: '0.75rem' }}>Save</button><button onClick={() => setEditingId(null)} className="btn btn-outline flex-1" style={{ padding: '0.375rem', fontSize: '0.75rem' }}>Cancel</button></div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{inc.source}</div>
                        <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--accent)' }}>+${inc.amount}</div>
                      </div>
                      <div className="flex gap-1"><button className="btn-icon" onClick={() => startEditing(inc, 'income')}><Edit2 size={15}/></button><button className="btn-icon hover:text-danger" onClick={() => handleFixedDelete(inc.id, 'income')}><Trash2 size={15}/></button></div>
                    </div>
                  )}
                </div>
              ))}
              {fixedIncomes.length === 0 && <p className="text-center text-muted text-sm" style={{ padding: '1rem 0' }}>No fixed income set.</p>}
            </div>
          </div>

          {/* Expenses */}
          <div className="glass-card" style={{ borderColor: 'hsla(0,84%,60%,0.15)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--danger-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingDown size={18} color="var(--danger)" />
              </div>
              <h3 className="text-h3 m-0" style={{ color: 'var(--danger)' }}>Monthly Costs</h3>
            </div>
            <div className="flex flex-col gap-3">
              {fixedExpenses.map(exp => (
                <div key={exp.id} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--danger-subtle)', border: '1px solid hsla(0,84%,60%,0.12)' }}>
                  {editingId === exp.id ? (
                    <div className="grid gap-2">
                      <input className="input-field py-1" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      <input type="number" className="input-field py-1" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: e.target.value})} />
                      <div className="flex gap-2"><button onClick={saveEdit} className="btn btn-primary flex-1" style={{ padding: '0.375rem', fontSize: '0.75rem' }}>Save</button><button onClick={() => setEditingId(null)} className="btn btn-outline flex-1" style={{ padding: '0.375rem', fontSize: '0.75rem' }}>Cancel</button></div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{exp.name}</div>
                        <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--danger)' }}>-${exp.amount}</div>
                      </div>
                      <div className="flex gap-1"><button className="btn-icon" onClick={() => startEditing(exp, 'expense')}><Edit2 size={15}/></button><button className="btn-icon hover:text-danger" onClick={() => handleFixedDelete(exp.id, 'expense')}><Trash2 size={15}/></button></div>
                    </div>
                  )}
                </div>
              ))}
              {fixedExpenses.length === 0 && <p className="text-center text-muted text-sm" style={{ padding: '1rem 0' }}>No fixed costs set.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
