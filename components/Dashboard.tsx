
import React, { useMemo } from 'react';
import { 
  Wallet, 
  Calendar, 
  Sparkles,
  Loader2,
  Users,
  CheckCircle2,
  Tag,
  ArrowRightCircle
} from 'lucide-react';
import { Loan, User, USERS } from '../types';

interface DashboardProps {
  loans: Loan[];
  user: User;
  onDecreaseTempo: () => void;
  aiInsights: string;
  isLoadingInsights: boolean;
  onFetchInsights: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  loans, 
  user, 
  onDecreaseTempo,
  aiInsights,
  isLoadingInsights,
  onFetchInsights
}) => {
  const activeLoans = useMemo(() => loans.filter(l => l.tempo > 0), [loans]);
  
  const userLoans = useMemo(() => {
    return user.role === 'ADMIN' ? activeLoans : activeLoans.filter(l => l.userId === user.id);
  }, [activeLoans, user]);

  const totalMonthlyTagihan = useMemo(() => {
    return userLoans.reduce((sum, loan) => sum + loan.amount, 0);
  }, [userLoans]);

  const totalRemainingBalance = useMemo(() => {
    return userLoans.reduce((sum, loan) => sum + (loan.amount * loan.tempo), 0);
  }, [userLoans]);

  const userBreakdownData = useMemo(() => {
    return USERS.map(u => {
      const amount = activeLoans
        .filter(l => l.userId === u.id)
        .reduce((sum, l) => sum + l.amount, 0);
      const remaining = activeLoans
        .filter(l => l.userId === u.id)
        .reduce((sum, l) => sum + (l.amount * l.tempo), 0);
      return { name: u.name, value: amount, remaining };
    }).filter(d => d.value > 0);
  }, [activeLoans]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="mb-4">
            <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-widest mb-1">Tagihan Bulan Ini</p>
            <h2 className="text-3xl font-bold tracking-tight">
              Rp {totalMonthlyTagihan.toLocaleString('id-ID')}
            </h2>
          </div>
          
          <div className="pt-4 border-t border-white/20">
            <p className="text-indigo-100 text-[10px] uppercase font-bold tracking-widest mb-1">Total Sisa Hutang</p>
            <h3 className="text-xl font-bold">
              Rp {totalRemainingBalance.toLocaleString('id-ID')}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-indigo-100 text-[10px] bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/20 mt-4">
            <Calendar className="w-3 h-3" />
            <span className="font-bold uppercase tracking-wider">{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {user.role === 'ADMIN' && (
        <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800">Pembayaran Cicilan</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Kurangi tenor pinjaman</p>
            </div>
          </div>
          
          <button 
            onClick={onDecreaseTempo}
            disabled={activeLoans.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-white py-4 rounded-xl text-sm font-black transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            Payment ({activeLoans.length})
            <ArrowRightCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI Insight</span>
          </div>
          <button onClick={onFetchInsights} disabled={isLoadingInsights} className="text-[10px] bg-white border border-indigo-200 text-indigo-600 px-2 py-1 rounded-md font-bold">
            {isLoadingInsights ? '...' : 'Saran'}
          </button>
        </div>
        <div className="text-xs text-slate-700 italic leading-relaxed">
          {aiInsights || "Klik 'Saran' untuk analisis data."}
        </div>
      </div>

      <div className="space-y-3 pb-8">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          {user.role === 'ADMIN' ? 'Status Per User' : 'Pinjaman Aktif Anda'}
        </h3>
        {user.role === 'ADMIN' ? (
          userBreakdownData.map((d) => (
            <div key={d.name} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 p-2.5 rounded-xl text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-800">{d.name}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase">Bulan ini: Rp {d.value.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900">Rp {d.remaining.toLocaleString()}</p>
                <p className="text-[9px] text-indigo-500 font-bold uppercase">Sisa</p>
              </div>
            </div>
          ))
        ) : (
          userLoans.map((loan) => (
            <div key={loan.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 p-2.5 rounded-xl text-indigo-600">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{loan.description}</p>
                   <p className="text-[10px] text-amber-500 font-black uppercase">Sisa {loan.tempo} Bln</p>
                </div>
              </div>
              <span className="text-sm font-black text-indigo-700">Rp {loan.amount.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
