
import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Loan, LoanType, LOAN_TYPES, USERS } from '../types';

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (loan: Loan) => void;
}

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const YEARS = [
  new Date().getFullYear() - 1,
  new Date().getFullYear(),
  new Date().getFullYear() + 1,
  new Date().getFullYear() + 2
];

const AddLoanModal: React.FC<AddLoanModalProps> = ({ isOpen, onClose, onAdd }) => {
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    userId: 'firman',
    selectedMonth: MONTHS[currentMonthIdx],
    selectedYear: currentYear.toString(),
    type: 'Kredivo' as LoanType,
    description: '',
    amount: '',
    tempo: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.id === formData.userId);
    
    // Create combined Month Year label
    const monthYear = `${formData.selectedMonth} ${formData.selectedYear}`;

    const newLoan: Loan = {
      id: Math.random().toString(36).substr(2, 9),
      userId: formData.userId,
      userName: user?.name || '',
      month: monthYear,
      type: formData.type,
      description: formData.description,
      amount: parseFloat(formData.amount),
      tempo: parseInt(formData.tempo),
      originalTempo: parseInt(formData.tempo),
      createdAt: Date.now()
    };

    onAdd(newLoan);
    onClose();
    // Reset inputs
    setFormData(prev => ({
      ...prev,
      description: '',
      amount: '',
      tempo: ''
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Tambah Pinjaman Baru</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Atas Nama</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                value={formData.userId}
                onChange={(e) => setFormData({...formData, userId: e.target.value})}
              >
                {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Bulan & Tahun</label>
              <div className="flex gap-1">
                <select 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={formData.selectedMonth}
                  onChange={(e) => setFormData({...formData, selectedMonth: e.target.value})}
                >
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                  className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={formData.selectedYear}
                  onChange={(e) => setFormData({...formData, selectedYear: e.target.value})}
                >
                  {YEARS.map(y => <option key={y} value={y.toString()}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Jenis Layanan</label>
            <div className="grid grid-cols-2 gap-2">
              {LOAN_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, type})}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    formData.type === type 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Keterangan Pinjaman</label>
            <input 
              type="text" 
              placeholder="Contoh: Cicilan Laptop, Tiket, dll"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Nominal (Rp)</label>
              <input 
                type="number" 
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Sisa Tenor (Bulan)</label>
              <input 
                type="number" 
                placeholder="1"
                min="1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                value={formData.tempo}
                onChange={(e) => setFormData({...formData, tempo: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 mt-4 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            Simpan Data Baru
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddLoanModal;
