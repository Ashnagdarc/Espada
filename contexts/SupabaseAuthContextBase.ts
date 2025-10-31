import { createContext } from 'react';
import type { AuthContextType } from './SupabaseAuthTypes';

export const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);
