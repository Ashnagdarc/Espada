import { createContext } from 'react';
import type { LocaleContextType } from './LocaleContextTypes';

export const LocaleContext = createContext<LocaleContextType | undefined>(undefined);
