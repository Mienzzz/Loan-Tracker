
export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export type LoanType = 'Kredivo' | 'ShopeePayLater' | 'Traveloka' | 'Personil';

export interface Loan {
  id: string;
  userId: string;
  userName: string;
  month: string;
  type: LoanType;
  description: string;
  amount: number;
  tempo: number; // Remaining periods
  originalTempo: number; // Starting periods
  createdAt: number;
}

export type TabType = 'DASHBOARD' | 'LIST' | 'REPORT';

export const USERS: User[] = [
  { id: 'firman', name: 'Firman', role: 'ADMIN' },
  { id: 'tommy', name: 'Tommy', role: 'USER' },
  { id: 'anggi', name: 'Anggi', role: 'USER' }
];

export const LOAN_TYPES: LoanType[] = ['Kredivo', 'ShopeePayLater', 'Traveloka', 'Personil'];
