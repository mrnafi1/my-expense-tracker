import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, Calendar, DollarSign, PieChart, Camera, Download, Search } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavings] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Forms
  const [expenseForm, setExpenseForm] = useState({
    amount: '', category: 'খাবার', date: new Date().toISOString().split('T')[0], note: ''
  });
  const [savingsForm, setSavingsForm] = useState({
    amount: '', date: new Date().toISOString().split('T')[0], note: ''
  });
  
  // Custom Category State
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const defaultCategories = ['খাবার', 'যাতায়াত', 'বিনোদন', 'শিক্ষা', 'স্বাস্থ্য', 'কেনাকাটা', 'বিল', 'অন্যান্য'];
  const allCategories = [...defaultCategories, ...customCategories];
  
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
      const customCats = localStorage.getItem('custom-categories');
      
      if (expenseData) setExpenses(JSON.parse(expenseData));
      if (savingsData) setSavings(JSON.parse(savingsData));
      if (customCats) setCustomCategories(JSON.parse(customCats));
    } catch (error) {
      console.log('Error loading data:', error);
    }
    setLoading(false);
  };

  const saveData = (newExpenses, newSavings) => {
    localStorage.setItem('expenses-data', JSON.stringify(newExpenses));
    localStorage.setItem('savings-data', JSON.stringify(newSavings));
  };

  // Add Custom Category
  const handleAddCategory = () => {
    if (newCategory.trim() && !allCategories.includes(newCategory.trim())) {
      const updated = [...customCategories, newCategory.trim()];
      setCustomCategories(updated);
      localStorage.setItem('custom-categories', JSON.stringify(updated));
      setExpenseForm({ ...expenseForm, category: newCategory.trim() });
      setNewCategory('');
      setShowCategoryInput(false);
      toast.success('নতুন ক্যাটাগরি যোগ হয়েছে!');
    } else {
      toast.error('ক্যাটাগরির নাম সঠিক নয় বা আগেই আছে!');
    }
  };

  const addExpense = () => {
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      toast.warn('দয়া করে সঠিক টাকার পরিমাণ দিন');
      return;
    }
    const newExpense = { id: Date.now(), ...expenseForm, amount: parseFloat(expenseForm.amount) };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    saveData(updated, savings);
    setExpenseForm({ amount: '', category: allCategories[0], date: new Date().toISOString().split('T')[0], note: '' });
    toast.error('খরচ যুক্ত হয়েছে!', { icon: '💸' });
  };

  const addSavings = () => {
    if (!savingsForm.amount || parseFloat(savingsForm.amount) <= 0) {
      toast.warn('দয়া করে সঠিক টাকার পরিমাণ দিন');
      return;
    }
    const newSaving = { id: Date.now(), ...savingsForm, amount: parseFloat(savingsForm.amount) };
    const updated = [...savings, newSaving];
    setSavings(updated);
    saveData(expenses, updated);
    setSavingsForm({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
    toast.success('সেভিংস যুক্ত হয়েছে!', { icon: '💰' });
  };

  const deleteExpense = (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveData(updated, savings);
    toast.info('রেকর্ড মুছে ফেলা হয়েছে');
  };

  const deleteSaving = (id) => {
    const updated = savings.filter(s => s.id !== id);
    setSavings(updated);
    saveData(expenses, updated);
    toast.info('রেকর্ড মুছে ফেলা হয়েছে');
  };

  // Screenshot Capture Feature
  const captureAndShare = async () => {
    const element = document.getElementById('dashboard-snapshot');
    if (!element) return;
    
    toast.info('ছবি তৈরি হচ্ছে, একটু অপেক্ষা করুন...', { autoClose: 2000 });
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#f0fdf4' });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `my-expense-${selectedMonth}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('ছবি ডাউনলোড হয়েছে! এবার যেকোনো জায়গায় শেয়ার করতে পারেন।');
    } catch (error) {
      toast.error('ছবি তৈরি করতে সমস্যা হয়েছে!');
    }
  };

  // Chart Data Generation (Daily breakdown for selected month)
  const getChartData = () => {
    const dataMap = {};
    const processItems = (items, type) => {
      items.forEach(item => {
        if (item.date.startsWith(selectedMonth)) {
          if (!dataMap[item.date]) dataMap[item.date] = { date: item.date, 'খরচ': 0, 'সেভিংস': 0 };
          dataMap[item.date][type] += item.amount;
        }
      });
    };
    processItems(expenses, 'খরচ');
    processItems(savings, 'সেভিংস');
    return Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date));
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
  const chartData = getChartData();
  
  const filteredExpenses = expenses.filter(e => e.date.startsWith(selectedMonth) && (!searchTerm || e.category.includes(searchTerm) || e.note.toLowerCase().includes(searchTerm.toLowerCase())));
  const filteredSavings = savings.filter(s => s.date.startsWith(selectedMonth));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-green-50"><div className="text-2xl font-bold text-green-700 animate-pulse">লোড হচ্ছে...</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 p-4 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
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
          <button onClick={captureAndShare} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all">
            <Camera size={18} /> ছবি হিসেবে শেয়ার
          </button>
        </div>

        {view === 'dashboard' && (
          <div id="dashboard-snapshot" className="p-2 bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 rounded-xl">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-red-500 rounded-xl p-6 text-white shadow-md">
                <TrendingDown size={32} className="mb-2" />
                <h3 className="text-xl">মোট খরচ</h3>
                <div className="text-3xl font-bold">৳{currentMonthData.totalExpense.toFixed(2)}</div>
              </div>
              <div className="bg-green-500 rounded-xl p-6 text-white shadow-md">
                <TrendingUp size={32} className="mb-2" />
                <h3 className="text-xl">মোট সেভিংস</h3>
                <div className="text-3xl font-bold">৳{currentMonthData.totalSavings.toFixed(2)}</div>
              </div>
              <div className="bg-blue-500 rounded-xl p-6 text-white shadow-md">
                <DollarSign size={32} className="mb-2" />
                <h3 className="text-xl">ব্যালেন্স</h3>
                <div className="text-3xl font-bold">৳{(currentMonthData.totalSavings - currentMonthData.totalExpense).toFixed(2)}</div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">দৈনিক খরচ ও সেভিংস গ্রাফ</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} />
                    <Legend />
                    <Bar dataKey="খরচ" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="সেভিংস" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">ক্যাটাগরি অনুযায়ী খরচ</h3>
              <div className="space-y-4">
                {Object.entries(currentMonthData.categoryBreakdown).map(([category, amount]) => {
                  const percentage = (amount / currentMonthData.totalExpense * 100).toFixed(1);
                  const color = categoryColors[category] || '#9CA3AF'; // fallback gray for custom categories
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-700">{category}</span>
                        <span className="font-bold">৳{amount.toFixed(2)} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }} />
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
              <input type="number" placeholder="টাকার পরিমাণ" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="w-full p-3 border rounded-lg focus:border-green-500 focus:outline-none" />
              
              <div className="flex gap-2">
                <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value})} className="flex-1 p-3 border rounded-lg focus:border-green-500 focus:outline-none">
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <button onClick={() => setShowCategoryInput(!showCategoryInput)} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-bold">
                  {showCategoryInput ? 'বাতিল' : '+ নতুন'}
                </button>
              </div>

              {showCategoryInput && (
                <div className="flex gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <input type="text" placeholder="নতুন ক্যাটাগরির নাম" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="flex-1 p-2 border rounded-md focus:outline-none" />
                  <button onClick={handleAddCategory} className="px-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">যোগ করুন</button>
                </div>
              )}

              <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} className="w-full p-3 border rounded-lg focus:border-green-500 focus:outline-none" />
              <input type="text" placeholder="নোট (যেমন: বাস ভাড়া)" value={expenseForm.note} onChange={e => setExpenseForm({...expenseForm, note: e.target.value})} className="w-full p-3 border rounded-lg focus:border-green-500 focus:outline-none" />
              <button onClick={addExpense} className="w-full bg-red-500 text-white p-3 rounded-lg font-bold hover:bg-red-600 transition-colors">খরচ যোগ করুন</button>
            </div>
          </div>
        )}

        {view === 'add-savings' && (
          <div className="bg-white rounded-xl shadow-md p-6 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-4">সেভিংস যোগ করুন</h2>
            <div className="space-y-4">
              <input type="number" placeholder="টাকার পরিমাণ" value={savingsForm.amount} onChange={e => setSavingsForm({...savingsForm, amount: e.target.value})} className="w-full p-3 border rounded-lg focus:border-green-500 focus:outline-none" />
              <input type="date" value={savingsForm.date} onChange={e => setSavingsForm({...savingsForm, date: e.target.value})} className="w-full p-3 border rounded-lg focus:border-green-500 focus:outline-none" />
              <input type="text" placeholder="নোট (যেমন: মাসিক সঞ্চয়)" value={savingsForm.note} onChange={e => setSavingsForm({...savingsForm, note: e.target.value})} className="w-full p-3 border rounded-lg focus:border-green-500 focus:outline-none" />
              <button onClick={addSavings} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition-colors">সেভিংস যোগ করুন</button>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">লেনদেনের ইতিহাস</h3>
            </div>
            <div className="space-y-3">
              {[...filteredExpenses, ...filteredSavings].sort((a, b) => new Date(b.date) - new Date(a.date)).map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50 transition-colors rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{item.category || 'সেভিংস'}</p>
                    <p className="text-xs text-gray-500">{item.date} {item.note && `- ${item.note}`}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-lg ${item.category ? 'text-red-500' : 'text-green-500'}`}>
                      {item.category ? '-' : '+'}৳{item.amount.toFixed(2)}
                    </span>
                    <button onClick={() => item.category ? deleteExpense(item.id) : deleteSaving(item.id)} className="text-red-400 hover:text-red-600 text-sm font-semibold transition-colors px-2 py-1 bg-red-50 rounded">মুছুন</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-8 text-gray-500 text-sm pb-4">
          <p>Your data remains safe and private on your device. </p>
          <div className="text-center mt-8 text-gray-500 text-sm pb-4">
  <p>&copy; {new Date().getFullYear()} Mushfiqur Nafi. All rights reserved.</p>
</div>
        </div>
      </div>
    </div>
  );
}