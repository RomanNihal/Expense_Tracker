import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/api';
import { 
  Trash2, 
  Calendar, 
  Search, 
  Filter, 
  ArrowUpCircle, 
  TrendingDown,
  Settings,
  Edit2,
  Save,
  X
} from 'lucide-react';


const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [fixedIncomes, setFixedIncomes] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('DESC');

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



  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'ALL' || t.type === filterType;
      return matchesSearch && matchesFilter;
    })

    .sort((a, b) => {
      const dateA = new Date(a.expenseDate);
      const dateB = new Date(b.expenseDate);
      return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
    });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading ledger...</div>;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }} className="animate-fade-in">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Your Wallet</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Transaction history and recurring settings</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid var(--glass-border)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            width: '320px',
            backdropFilter: 'blur(10px)'
          }}>
            <Search size={20} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'white', 
                outline: 'none',
                width: '100%',
                fontSize: '1rem'
              }}
            />
          </div>

          <select 
            className="custom-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >

            <option value="ALL" style={{ background: 'var(--bg)' }}>All Activities</option>
            <option value="INCOME" style={{ background: 'var(--bg)' }}>Income Only</option>
            <option value="EXPENSE" style={{ background: 'var(--bg)' }}>Expenses Only</option>
            <option value="SAVINGS" style={{ background: 'var(--bg)' }}>Savings Only</option>
          </select>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
        {/* Main List */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Ledger History</h3>
            <button 
              onClick={() => setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')}
              style={{ background: 'rgba(99, 102, 241, 0.1)', border: 'none', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
            >
              <Calendar size={16} />
              {sortOrder === 'DESC' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
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

