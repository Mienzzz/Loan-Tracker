import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ListOrdered, 
  FilePieChart, 
  PlusCircle, 
  Wallet,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Download
} from 'lucide-react';
import { User, Loan, TabType, USERS } from './types';
import Dashboard from './components/Dashboard';
import LoanList from './components/LoanList';
import Reports from './components/Reports';
import AddLoanModal from './components/AddLoanModal';
import Login from './components/Login';
import { GoogleGenAI } from "@google/genai";

/* =========================
   PWA INSTALL EVENT TYPE
========================= */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'loan_tracker_data_v2';
const AUTH_KEY = 'loan_tracker_auth_v1';

const App: React.FC = () => {

  /* =========================
     PWA INSTALL STATE
  ========================= */
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  /* =========================
     APP STATE
  ========================= */
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
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [geminiInsights, setGeminiInsights] = useState<string>("");
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  /* =========================
     SAVE DATA
  ========================= */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  }, [loans]);

  /* =========================
     PWA INSTALL LISTENER
  ========================= */
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  /* =========================
     AUTH
  ========================= */
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  /* =========================
     LOAN LOGIC
  ========================= */
  const addLoan = (newLoan: Loan) => {
    setLoans(prev => [...prev, newLoan]);
  };

  const handleProcessPayment = () => {
    setLoans(prevLoans =>
      prevLoans.map(loan =>
        loan.tempo > 0 ? { ...loan, tempo: loan.tempo - 1 } : loan
      )
    );
    setIsConfirmModalOpen(false);
    setIsSuccessMessageOpen(true);
    setTimeout(() => setIsSuccessMessageOpen(false), 3000);
  };

  const decreaseTempo = () => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      alert('Hanya Admin yang dapat memproses pembayaran.');
      return;
    }

    if (loans.filter(l => l.tempo > 0).length === 0) {
      alert('Tidak ada tagihan aktif.');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  /* =========================
     AI INSIGHT
  ========================= */
  const fetchAIInsights = async () => {
    if (!process.env.API_KEY || !currentUser) return;
    setIsLoadingInsights(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const activeLoans = loans.filter(l => l.tempo > 0);
      const totalDebt = activeLoans.reduce((sum, l) => sum + l.amount, 0);

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analisis data hutang Rp ${totalDebt.toLocaleString()} dari ${activeLoans.length} pinjaman untuk user ${currentUser.name}.`
      });

      setGeminiInsights(response.text || "Tetaplah disiplin!");
    } catch {
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
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 shadow-xl relative">

      {/* HEADER */}
      <header className="bg-indigo-900 text-white p-4 sticky top-0 z-40 flex justify-between">
        <div className="flex items-center gap-2">
          <Wallet />
          <strong>Loan Tracker</strong>
        </div>
        <button onClick={handleLogout}><LogOut /></button>
      </header>

      <main className="flex-1 px-4 py-6">{renderContent()}</main>

      {/* INSTALL BUTTON */}
      {canInstall && (
        <button
          onClick={handleInstallApp}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-indigo-800 text-white px-6 py-3 rounded-full shadow-2xl z-[999]"
        >
          <Download className="inline w-4 h-4 mr-2" />
          Install App
        </button>
      )}

      {/* NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white flex justify-around h-20 border-t">
        <button onClick={() => setActiveTab('DASHBOARD')}><LayoutDashboard /></button>
        <button onClick={() => setActiveTab('LIST')}><ListOrdered /></button>
        <button onClick={() => setActiveTab('REPORT')}><FilePieChart /></button>
      </nav>

      <AddLoanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addLoan} />
    </div>
  );
};

export default App;

