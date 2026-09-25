import { createContext } from 'react';
import type { User } from 'firebase/auth';

export interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loading: true,
});