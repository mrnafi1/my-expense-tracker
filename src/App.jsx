import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, Calendar, DollarSign, PieChart, Share2, Download, Search } from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavings] = useState([]);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [shareLink, setShareLink] = useState('');
  
  const [expenseForm, setExpenseForm] = useState({
    amount: '', category: 'খাবার', date: new Date().toISOString().split('T')[0], note: ''
  });
  
  const [savingsForm, setSavingsForm] = useState({
    amount: '', date: new Date().toISOString().split('T')[0], note: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const categories = ['খাবার', 'যাতায়াত', 'বিনোদন', 'শিক্ষা', 'স্বাস্থ্য', 'কেনাকাটা', 'বিল', 'অন্যান্য'];
  const categoryColors = {
    'খাবার': '#FF6B6B', 'যাতায়াত': '#4ECDC4', 'বিনোদন': '#FFE66D', 'শিক্ষা': '#95E1D3',
    'স্বাস্থ্য': '#F38181', 'কেনাকাটা': '#AA96DA', 'বিল': '#FCBAD3', 'অন্যান্য': '#A8DADC'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const expenseData = localStorage.getItem('expenses-data');
      const savingsData = localStorage.getItem('savings-data');
      
      if (expenseData) setExpenses(JSON.parse(expenseData));
      if (savingsData) setSavings(JSON.parse(savingsData));
    } catch (error) {
      console.log('Error loading data:', error);
    }
    setLoading(false);
  };

  const saveData = (newExpenses, newSavings) => {
    try {
      localStorage.setItem('expenses-data', JSON.stringify(newExpenses));
      localStorage.setItem('savings-data', JSON.stringify(newSavings));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addExpense = () => {
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) return;
    const newExpense = { id: Date.now(), ...expenseForm, amount: parseFloat(expenseForm.amount) };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    saveData(updated, savings);
    setExpenseForm({ amount: '', category: 'খাবার', date: new Date().toISOString().split('T')[0], note: '' });
  };

  const addSavings = () => {
    if (!savingsForm.amount || parseFloat(savingsForm.amount) <= 0) return;
    const newSaving = { id: Date.now(), ...savingsForm, amount: parseFloat(savingsForm.amount) };
    const updated = [...savings, newSaving];
    setSavings(updated);
    saveData(expenses, updated);
    setSavingsForm({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
  };

  const deleteExpense = (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveData(updated, savings);
  };

  const deleteSaving = (id) => {
    const updated = savings.filter(s => s.id !== id);
    setSavings(updated);
    saveData(expenses, updated);
  };

  const generateShareLink = () => {
    const url = window.location.href;
    setShareLink(url);
    navigator.clipboard.writeText(url);
  };

  const exportToCSV = () => {
    const csvRows = [
      ['তারিখ', 'ধরন', 'ক্যাটাগরি', 'টাকা', 'নোট'],
      ...expenses.map(e => [e.date, 'খরচ', e.category, e.amount, e.note || '']),
      ...savings.map(s => [s.date, 'সেভিংস', '-', s.amount, s.note || ''])
    ];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getMonthData = (month) => {
    const monthExpenses = expenses.filter(e => e.date.startsWith(month));
    const monthSavings = savings.filter(s => s.date.startsWith(month));
    const totalExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSavings = monthSavings.reduce((sum, s) => sum + s.amount, 0);
    
    const categoryBreakdown = {};
    monthExpenses.forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });
    return { totalExpense, totalSavings, categoryBreakdown, count: monthExpenses.length };
  };

  const currentMonthData = getMonthData(selectedMonth);
  
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = !searchTerm || e.category.includes(searchTerm) || e.note.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && e.date.startsWith(selectedMonth);
  });

  const filteredSavings = savings.filter(s => s.date.startsWith(selectedMonth));

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-green-50"><div className="text-2xl font-bold text-green-700 animate-pulse">লোড হচ্ছে...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 p-4 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
        * { font-family: 'Noto Sans Bengali', sans-serif; }
        .card-hover { transition: all 0.3s; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 text-green-600">আমার হিসাব</h1>
          <p className="text-gray-600">প্রতিদিনের খরচ ও সেভিংস ট্র্যাকার</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {[
            { id: 'dashboard', label: '📊 ড্যাশবোর্ড', icon: PieChart },
            { id: 'add-expense', label: '➕ খরচ', icon: PlusCircle },
            { id: 'add-savings', label: '💰 সেভিংস', icon: TrendingUp },
            { id: 'history', label: '📋 ইতিহাস', icon: Calendar }
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} className={`px-6 py-3 rounded-xl font-semibold transition-all ${view === tab.id ? 'bg-green-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-green-50'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">মাস নির্বাচন:</label>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500" />
          </div>
          <div className="flex gap-2">
            <button onClick={generateShareLink} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Share2 size={18} /> শেয়ার</button>
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><Download size={18} /> ডাউনলোড</button>
          </div>
        </div>

        {view === 'dashboard' && (
          <div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-red-500 rounded-xl p-6 text-white card-hover">
                <TrendingDown size={32} className="mb-2" />
                <h3 className="text-xl">মোট খরচ</h3>
                <div className="text-3xl font-bold">৳{currentMonthData.totalExpense.toFixed(2)}</div>
              </div>
              <div className="bg-green-500 rounded-xl p-6 text-white card-hover">
                <TrendingUp size={32} className="mb-2" />
                <h3 className="text-xl">মোট সেভিংস</h3>
                <div className="text-3xl font-bold">৳{currentMonthData.totalSavings.toFixed(2)}</div>
              </div>
              <div className="bg-blue-500 rounded-xl p-6 text-white card-hover">
                <DollarSign size={32} className="mb-2" />
                <h3 className="text-xl">ব্যালেন্স</h3>
                <div className="text-3xl font-bold">৳{(currentMonthData.totalSavings - currentMonthData.totalExpense).toFixed(2)}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">ক্যাটাগরি অনুযায়ী খরচ</h3>
              <div className="space-y-4">
                {Object.entries(currentMonthData.categoryBreakdown).map(([category, amount]) => {
                  const percentage = (amount / currentMonthData.totalExpense * 100).toFixed(1);
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-700">{category}</span>
                        <span className="font-bold">৳{amount.toFixed(2)} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: categoryColors[category] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {view === 'add-expense' && (
          <div className="bg-white rounded-xl shadow-md p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">খরচ যোগ করুন</h2>
            <div className="space-y-4">
              <input type="number" placeholder="টাকার পরিমাণ" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="w-full p-3 border rounded-lg" />
              <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="w-full p-3 border rounded-lg">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className="w-full p-3 border rounded-lg" />
              <input type="text" placeholder="নোট (যেমন: বাস ভাড়া)" value={expenseForm.note} onChange={e => setExpenseForm({...expenseForm, note: e.target.value})} className="w-full p-3 border rounded-lg" />
              <button onClick={addExpense} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700">যোগ করুন</button>
            </div>
          </div>
        )}

        {view === 'add-savings' && (
          <div className="bg-white rounded-xl shadow-md p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">সেভিংস যোগ করুন</h2>
            <div className="space-y-4">
              <input type="number" placeholder="টাকার পরিমাণ" value={savingsForm.amount} onChange={e => setSavingsForm({...savingsForm, amount: e.target.value})} className="w-full p-3 border rounded-lg" />
              <input type="date" value={savingsForm.date} onChange={e => setSavingsForm({...savingsForm, date: e.target.value})} className="w-full p-3 border rounded-lg" />
              <input type="text" placeholder="নোট (যেমন: মাসিক সঞ্চয়)" value={savingsForm.note} onChange={e => setSavingsForm({...savingsForm, note: e.target.value})} className="w-full p-3 border rounded-lg" />
              <button onClick={addSavings} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700">যোগ করুন</button>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">লেনদেনের ইতিহাস</h3>
            <div className="space-y-3">
              {[...filteredExpenses, ...filteredSavings].sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 border-b">
                  <div>
                    <p className="font-semibold">{item.category || 'সেভিংস'}</p>
                    <p className="text-xs text-gray-500">{item.date} {item.note && `- ${item.note}`}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${item.category ? 'text-red-500' : 'text-green-500'}`}>
                      {item.category ? '-' : '+'}৳{item.amount.toFixed(2)}
                    </span>
                    <button onClick={() => item.category ? deleteExpense(item.id) : deleteSaving(item.id)} className="text-red-500 text-sm">মুছুন</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-gray-500 text-sm pb-4">
          <p>Developed by MUSHFIQUR NAFI . All data is securely stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
}