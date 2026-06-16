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

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse flex flex-col items-center">
        <ArrowUpCircle size={48} className="text-primary mb-4" />
        <p className="text-muted">Loading ledger...</p>
      </div>
    </div>
  );

  return (
    <div className="container animate-fade-in">
      <header className="mb-8">
        <h1 className="text-h1 mb-2">Your Wallet</h1>
        <p className="text-muted text-lg">Transaction history and recurring settings</p>
      </header>

      {/* Monthly Overview */}
      {monthlyHistory.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted">MONTHLY BREAKDOWN</span>
            <span className="text-xs text-muted opacity-60">— click a card to filter</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            {monthlyHistory.map(([month, totals]) => {
              const net = totals.income - totals.expenses - totals.savings;
              const isActive = selectedMonth === month;
              const netColor = net >= 0 ? 'var(--accent)' : 'var(--danger)';
              const topBorderColor = net >= 0 ? 'var(--accent)' : 'var(--danger)';
              
              return (
                <div
                  key={month}
                  onClick={() => setSelectedMonth(isActive ? '' : month)}
                  className={`flex-shrink-0 cursor-pointer transition-all duration-200 overflow-hidden rounded-xl ${isActive ? 'ring-2 ring-primary bg-primary-light' : 'bg-surface hover:bg-surface-hover border border-glass-border'}`}
                  style={{ minWidth: '200px', background: isActive ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)', border: isActive ? '1px solid var(--primary)' : '1px solid var(--glass-border)' }}
                >
                  <div style={{ height: '3px', background: topBorderColor }} />
                  
                  <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="font-bold" style={{ color: isActive ? 'var(--primary)' : 'white' }}>
                      {formatMonth(month)}
                    </div>
                  </div>

                  <div className="p-4 grid gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-muted">
                        <TrendingUp size={14} className="text-accent" /> Income
                      </div>
                      <span className="font-semibold text-accent">+${totals.income.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-muted">
                        <TrendingDown size={14} className="text-danger" /> Expenses
                      </div>
                      <span className="font-semibold text-danger">-${totals.expenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-muted">
                        <PiggyBank size={14} className="text-primary" /> Savings
                      </div>
                      <span className="font-semibold text-primary">-${totals.savings.toLocaleString()}</span>
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

      <div className="grid grid-cols-12 gap-6">
        {/* Main List */}
        <div className="glass-card no-padding lg-col-span-8">
          <div className="p-6 border-b" style={{ borderColor: 'var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h3 className="text-h3 m-0">Ledger History</h3>
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-glass-border bg-black bg-opacity-20">
                  <Search size={16} className="text-muted" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-white text-sm outline-none"
                    style={{ width: '120px', fontSize: '16px' }}
                  />
                </div>
                {/* Type filter */}
                <select
                  className="input-field py-2"
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  style={{ width: '130px', padding: '0.5rem', background: 'var(--bg-color)' }}
                >
                  <option value="ALL">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expenses</option>
                  <option value="SAVINGS">Savings</option>
                </select>
                {/* Month filter */}
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  className="input-field py-2"
                  style={{ width: '150px', padding: '0.5rem', background: 'var(--bg-color)' }}
                />
                {/* Always-visible All toggle */}
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
          
          {/* Desktop Table View */}
          <div className="table-scroll desktop-only">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t, idx) => (
                  <tr key={t.id}>
                    {editingLedgerId === t.id ? (
                      <>
                        <td><input type="date" className="input-field py-1" value={ledgerEditForm.expenseDate} onChange={(e) => setLedgerEditForm({...ledgerEditForm, expenseDate: e.target.value})} /></td>
                        <td><input className="input-field py-1" value={ledgerEditForm.name} onChange={(e) => setLedgerEditForm({...ledgerEditForm, name: e.target.value})} /></td>
                        <td>
                          <select className="input-field py-1" value={ledgerEditForm.type} onChange={(e) => setLedgerEditForm({...ledgerEditForm, type: e.target.value})}>
                            <option value="INCOME">INCOME</option>
                            <option value="EXPENSE">EXPENSE</option>
                            <option value="SAVINGS">SAVINGS</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'right' }}><input type="number" className="input-field py-1 text-right" style={{ width: '100px' }} value={ledgerEditForm.amount} onChange={(e) => setLedgerEditForm({...ledgerEditForm, amount: e.target.value})} /></td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="flex gap-2 justify-center">
                            <button onClick={saveLedgerEdit} className="btn-icon text-primary"><Save size={18}/></button>
                            <button onClick={() => setEditingLedgerId(null)} className="btn-icon"><X size={18}/></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="text-muted">{t.expenseDate}</td>
                        <td>
                          <div className="font-semibold text-md">{t.name}</div>
                          {t.isFixed && (
                            <div className="flex items-center gap-1 mt-1">
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                              <span className="text-xs text-primary">Automated</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${t.type === 'INCOME' ? 'badge-income' : t.type === 'EXPENSE' ? 'badge-expense' : 'badge-savings'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className={`text-right font-bold text-lg ${t.type === 'INCOME' ? 'text-accent' : 'text-danger'}`}>
                          {t.type === 'INCOME' ? '+' : '-'}${(parseFloat(t.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="flex gap-3 justify-center">
                            <button className="btn-icon" onClick={() => startLedgerEdit(t)}><Edit2 size={18} /></button>
                            <button className="btn-icon hover:text-danger" onClick={() => handleDelete(t.id)}><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="mobile-card-list mobile-only">
            {filteredTransactions.map(t => (
              <div key={t.id} className="p-4 rounded-xl border border-glass-border" style={{ background: 'rgba(255,255,255,0.02)' }}>
                {editingLedgerId === t.id ? (
                  <div className="grid gap-3">
                    <input type="date" className="input-field" value={ledgerEditForm.expenseDate} onChange={(e) => setLedgerEditForm({...ledgerEditForm, expenseDate: e.target.value})} />
                    <input className="input-field" value={ledgerEditForm.name} onChange={(e) => setLedgerEditForm({...ledgerEditForm, name: e.target.value})} />
                    <select className="input-field" value={ledgerEditForm.type} onChange={(e) => setLedgerEditForm({...ledgerEditForm, type: e.target.value})}>
                      <option value="INCOME">INCOME</option>
                      <option value="EXPENSE">EXPENSE</option>
                      <option value="SAVINGS">SAVINGS</option>
                    </select>
                    <input type="number" className="input-field" value={ledgerEditForm.amount} onChange={(e) => setLedgerEditForm({...ledgerEditForm, amount: e.target.value})} />
                    <div className="flex gap-2">
                      <button onClick={saveLedgerEdit} className="btn btn-primary flex-1 py-2">Save</button>
                      <button onClick={() => setEditingLedgerId(null)} className="btn btn-outline flex-1 py-2">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-md mb-1">{t.name}</div>
                        <div className="text-xs text-muted">{t.expenseDate}</div>
                        {t.isFixed && (
                          <div className="text-xs text-primary mt-1">● Automated</div>
                        )}
                      </div>
                      <div className={`font-bold text-lg ${t.type === 'INCOME' ? 'text-accent' : 'text-danger'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}${(parseFloat(t.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: 'var(--glass-border)' }}>
                      <span className={`badge ${t.type === 'INCOME' ? 'badge-income' : t.type === 'EXPENSE' ? 'badge-expense' : 'badge-savings'}`}>
                        {t.type}
                      </span>
                      <div className="flex gap-2">
                        <button className="btn-icon p-1" onClick={() => startLedgerEdit(t)}><Edit2 size={16} /></button>
                        <button className="btn-icon p-1 text-danger" onClick={() => handleDelete(t.id)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <Search size={48} className="text-muted opacity-50" />
              </div>
              <p className="text-muted text-lg">No transactions found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Sidebar: Fixed Settings */}
        <div className="lg-col-span-4 flex flex-col gap-6">
          <div className="glass-card" style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h3 className="flex items-center gap-2 mb-6 text-h3 text-accent">
              <ArrowUpCircle size={24} />
              Monthly Income
            </h3>
            <div className="grid gap-4">
              {fixedIncomes.map(inc => (
                <div key={inc.id} className="p-4 rounded-xl" style={{ background: 'var(--accent-light)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  {editingId === inc.id ? (
                    <div className="grid gap-3">
                      <input className="input-field py-2" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                      <input type="number" className="input-field py-2" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="btn btn-primary flex-1 py-2 text-sm"><Save size={16}/> Save</button>
                        <button onClick={() => setEditingId(null)} className="btn btn-outline flex-1 py-2 text-sm"><X size={16}/> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-lg">{inc.source}</div>
                        <div className="text-accent font-extrabold text-xl">+${inc.amount}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-icon p-2" onClick={() => startEditing(inc, 'income')}><Edit2 size={18} /></button>
                        <button className="btn-icon p-2 hover:text-danger" onClick={() => handleFixedDelete(inc.id, 'income')}><Trash2 size={18} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {fixedIncomes.length === 0 && <p className="text-center text-muted text-sm p-4">No fixed income set.</p>}
            </div>
          </div>

          <div className="glass-card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 className="flex items-center gap-2 mb-6 text-h3 text-danger">
              <TrendingDown size={24} />
              Monthly Costs
            </h3>
            <div className="grid gap-4">
              {fixedExpenses.map(exp => (
                <div key={exp.id} className="p-4 rounded-xl" style={{ background: 'var(--danger-light)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  {editingId === exp.id ? (
                    <div className="grid gap-3">
                      <input className="input-field py-2" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                      <input type="number" className="input-field py-2" value={editForm.amount} onChange={(e) => setEditForm({...editForm, amount: e.target.value})} />
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="btn btn-primary flex-1 py-2 text-sm"><Save size={16}/> Save</button>
                        <button onClick={() => setEditingId(null)} className="btn btn-outline flex-1 py-2 text-sm"><X size={16}/> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-lg">{exp.name}</div>
                        <div className="text-danger font-extrabold text-xl">-${exp.amount}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-icon p-2" onClick={() => startEditing(exp, 'expense')}><Edit2 size={18} /></button>
                        <button className="btn-icon p-2 hover:text-danger" onClick={() => handleFixedDelete(exp.id, 'expense')}><Trash2 size={18} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {fixedExpenses.length === 0 && <p className="text-center text-muted text-sm p-4">No fixed costs set.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
