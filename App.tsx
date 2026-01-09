
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ListOrdered, 
  FilePieChart, 
  PlusCircle, 
  Wallet,
  AlertCircle,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { User, Loan, TabType, USERS } from './types';
import Dashboard from './components/Dashboard';
import LoanList from './components/LoanList';
import Reports from './components/Reports';
import AddLoanModal from './components/AddLoanModal';
import Login from './components/Login';
import { GoogleGenAI } from "@google/genai";

const STORAGE_KEY = 'loan_tracker_data_v2';
const AUTH_KEY = 'loan_tracker_auth_v1';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY);
    return savedAuth ? JSON.parse(savedAuth) : null;
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('DASHBOARD');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessMessageOpen, setIsSuccessMessageOpen] = useState(false);
  
  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [geminiInsights, setGeminiInsights] = useState<string>("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  }, [loans]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const addLoan = (newLoan: Loan) => {
    setLoans(prev => [...prev, newLoan]);
  };

  const handleProcessPayment = () => {
    setLoans(prevLoans => {
      const updated = prevLoans.map(loan => {
        if (loan.tempo > 0) {
          return { ...loan, tempo: loan.tempo - 1 };
        }
        return loan;
      });
      return [...updated];
    });
    
    setIsConfirmModalOpen(false);
    setIsSuccessMessageOpen(true);
    setTimeout(() => setIsSuccessMessageOpen(false), 3000);
  };

  const decreaseTempo = () => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      alert('Hanya Admin yang dapat memproses pembayaran.');
      return;
    }
    
    const activeCount = loans.filter(l => l.tempo > 0).length;
    if (activeCount === 0) {
      alert('Tidak ada tagihan aktif.');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const fetchAIInsights = async () => {
    if (!process.env.API_KEY || !currentUser) return;
    setIsLoadingInsights(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const activeLoans = loans.filter(l => l.tempo > 0);
      const totalDebt = activeLoans.reduce((sum, l) => sum + l.amount, 0);
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analisis data hutang Rp ${totalDebt.toLocaleString()} dari ${activeLoans.length} pinjaman untuk user ${currentUser.name}. Berikan saran singkat dalam bahasa Indonesia.`
      });
      setGeminiInsights(response.text || "Tetaplah disiplin!");
    } catch (error) {
      setGeminiInsights("Gagal memuat saran.");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return (
          <Dashboard 
            loans={loans} 
            user={currentUser} 
            onDecreaseTempo={decreaseTempo}
            aiInsights={geminiInsights}
            isLoadingInsights={isLoadingInsights}
            onFetchInsights={fetchAIInsights}
          />
        );
      case 'LIST':
        return (
          <LoanList 
            loans={loans} 
            user={currentUser} 
            onAddClick={() => setIsModalOpen(true)} 
          />
        );
      case 'REPORT':
        return <Reports loans={loans} user={currentUser} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 shadow-xl overflow-hidden relative border-x border-slate-200">
      <header className="bg-indigo-900 text-white p-4 shadow-md sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">Loan Tracker</h1>
              <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-widest mt-0.5">{currentUser.name}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24 overflow-y-auto px-4 py-6">
        {renderContent()}
      </main>

      {isSuccessMessageOpen && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-[60] animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-bold">Pembayaran Berhasil!</span>
        </div>
      )}

      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl">
            <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-amber-600 mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Konfirmasi Pembayaran</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Tenor seluruh pinjaman aktif akan berkurang 1 bulan.
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={handleProcessPayment} className="w-full bg-indigo-800 text-white py-3 rounded-xl font-bold">Ya, Proses</button>
              <button onClick={() => setIsConfirmModalOpen(false)} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold">Batal</button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 shadow-lg flex justify-around items-center h-20 px-4 z-50">
        <button onClick={() => setActiveTab('DASHBOARD')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'DASHBOARD' ? 'text-indigo-800' : 'text-slate-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Dashboard</span>
        </button>
        <button onClick={() => setActiveTab('LIST')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'LIST' ? 'text-indigo-800' : 'text-slate-400'}`}>
          <ListOrdered className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Hutang</span>
        </button>
        <button onClick={() => setActiveTab('REPORT')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'REPORT' ? 'text-indigo-800' : 'text-slate-400'}`}>
          <FilePieChart className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Laporan</span>
        </button>
      </nav>

      {currentUser.role === 'ADMIN' && activeTab === 'LIST' && (
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-24 right-6 bg-indigo-800 text-white p-4 rounded-full shadow-2xl z-50 active:scale-90 transition-transform">
          <PlusCircle className="w-6 h-6" />
        </button>
      )}

      <AddLoanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addLoan} />
    </div>
  );
};

export default App;
