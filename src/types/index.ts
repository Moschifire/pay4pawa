export interface UserProfile {
  uid: string;
  phoneNumber: string;
  email?: string;
  displayName?: string;
  createdAt: number;
}

export interface Meter {
  id: string; // The 11 or 13 digit meter number
  ownerId: string;
  alias: string; // e.g. "Home", "Shop"
  provider: 'IKEDC' | 'EKEDC' | 'AEDC' | 'PHED' | string; 
  lastBalance: number;
  lastToken?: string;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  meterId: string;
  amount: number;
  token: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
}