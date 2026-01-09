
import React, { useMemo, useState } from 'react';
import { Calendar, Download, Filter, CheckCircle2, User as UserIcon, Wallet, ArrowRight } from 'lucide-react';
import { Loan, User, USERS, LOAN_TYPES } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ReportsProps {
  loans: Loan[];
  user: User;
}

const Reports: React.FC<ReportsProps> = ({ loans, user }) => {
  const [selectedMonth, setSelectedMonth] = useState('Semua');

  const filteredLoans = useMemo(() => {
    let list = user.role === 'ADMIN' ? loans : loans.filter(l => l.userId === user.id);
    if (selectedMonth !== 'Semua') {
      list = list.filter(l => l.month === selectedMonth);
    }
    return list;
  }, [loans, user, selectedMonth]);

  const uniqueMonths = useMemo(() => {
    const months = Array.from(new Set(loans.map(l => l.month)));
    return ['Semua', ...months.sort().reverse()];
  }, [loans]);

  const categoryBreakdownData = useMemo(() => {
    return LOAN_TYPES.map(type => {
      const amount = filteredLoans
        .filter(l => l.type === type)
        .reduce((sum, l) => sum + l.amount, 0);
      return { name: type, value: amount };
    }).filter(d => d.value > 0);
  }, [filteredLoans]);

  const adminUserSummary = useMemo(() => {
    if (user.role !== 'ADMIN') return [];
    return USERS.map(u => {
      const uLoans = loans.filter(l => l.userId === u.id);
      const active = uLoans.filter(l => l.tempo > 0);
      
      // Calculate total paid even for active loans: (original - current) * amount
      const totalPaidSoFar = uLoans.reduce((sum, l) => {
        const paidMonths = l.originalTempo - l.tempo;
        return sum + (l.amount * paidMonths);
      }, 0);

      return {
        name: u.name,
        activeDebt: active.reduce((s, l) => s + (l.amount * l.tempo), 0),
        monthlyDebt: active.reduce((s, l) => s + l.amount, 0),
        totalPaid: totalPaidSoFar,
      };
    }).filter(s => s.activeDebt > 0 || s.monthlyDebt > 0 || s.totalPaid > 0);
  }, [loans, user]);

  const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981'];

  const summary = useMemo(() => {
    const active = filteredLoans.filter(l => l.tempo > 0);
    
    // New logic: Sum of (originalTempo - currentTempo) * amount for all filtered loans
    const totalPaidCalculated = filteredLoans.reduce((sum, l) => {
      const paidMonths = l.originalTempo - l.tempo;
      return sum + (l.amount * paidMonths);
    }, 0);

    return {
      total: filteredLoans.reduce((s, l) => s + l.amount, 0),
      activeTotal: active.reduce((s, l) => s + l.amount, 0),
      paidTotal: totalPaidCalculated
    };
  }, [filteredLoans]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Laporan Keuangan</h2>
        <button className="text-indigo-600"><Download className="w-5 h-5" /></button>
      </div>

      {user.role === 'ADMIN' && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ringkasan Per User (Admin Only)</h3>
          <div className="grid grid-cols-1 gap-2">
            {adminUserSummary.map(s => (
              <div key={s.name} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600"><UserIcon className="w-4 h-4" /></div>
                    <span className="font-bold text-slate-800">{s.name}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">PROGRES</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Sudah Bayar (Total)</p>
                    <p className="text-xs font-black text-emerald-600">Rp {s.totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Sisa Hutang</p>
                    <p className="text-sm font-black text-indigo-700">Rp {s.activeDebt.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
        {uniqueMonths.map(month => (
          <button 
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedMonth === month ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {month}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Cicilan Bulanan</p>
          <p className="text-sm font-bold text-slate-800">Rp {summary.activeTotal.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
          <p className="text-[10px] text-emerald-600 uppercase font-bold mb-1">Sudah Dibayar</p>
          <p className="text-sm font-bold text-emerald-700">Rp {summary.paidTotal.toLocaleString()}</p>
        </div>
      </div>

      {categoryBreakdownData.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Kategori Pinjaman ({selectedMonth})</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdownData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="space-y-3 pb-10">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Log Riwayat Pinjaman</h3>
        {filteredLoans.length === 0 ? (
          <p className="text-center text-slate-400 py-10 text-sm italic">Belum ada data.</p>
        ) : (
          filteredLoans.sort((a,b) => b.createdAt - a.createdAt).map(loan => (
            <div key={loan.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-lg ${loan.tempo === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {loan.tempo === 0 ? <CheckCircle2 className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{loan.description}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{loan.userName} • {loan.month}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xs font-bold text-slate-900">Rp {loan.amount.toLocaleString()}</p>
                <p className={`text-[10px] font-black ${loan.tempo === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {loan.tempo === 0 ? 'LUNAS' : `SISA ${loan.tempo} BLN`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reports;
