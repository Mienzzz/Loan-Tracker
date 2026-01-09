
import React, { useMemo } from 'react';
import { Search, Clock, ChevronRight, Tag, User } from 'lucide-react';
import { Loan, User as UserType } from '../types';

interface LoanListProps {
  loans: Loan[];
  user: UserType;
  onAddClick: () => void;
}

const LoanList: React.FC<LoanListProps> = ({ loans, user }) => {
  const activeLoans = useMemo(() => {
    const list = loans.filter(l => l.tempo > 0);
    return user.role === 'ADMIN' ? list : list.filter(l => l.userId === user.id);
  }, [loans, user]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Daftar Hutang Aktif</h2>
        <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-bold">
          {activeLoans.length} Record
        </span>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Cari hutang atau keterangan..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm shadow-sm"
        />
      </div>

      <div className="space-y-4 pb-10">
        {activeLoans.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm">Tidak ada hutang aktif yang ditemukan.</p>
          </div>
        ) : (
          activeLoans.sort((a,b) => b.createdAt - a.createdAt).map((loan) => (
            <div key={loan.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    loan.type === 'Kredivo' ? 'bg-orange-100 text-orange-700' :
                    loan.type === 'ShopeePayLater' ? 'bg-pink-100 text-pink-700' :
                    loan.type === 'Traveloka' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {loan.type}
                  </span>
                  {user.role === 'ADMIN' && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <User className="w-3 h-3" />
                      {loan.userName}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
                  <Clock className="w-3 h-3" />
                  Tempo: {loan.tempo} Bln
                </div>
              </div>

              <h4 className="font-bold text-slate-800 mb-1">{loan.description}</h4>
              
              <div className="flex justify-between items-end mt-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Tag className="w-3 h-3" />
                    Bulan: {loan.month}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 mb-1">Nominal</p>
                  <p className="text-lg font-bold text-indigo-700">Rp {loan.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoanList;
