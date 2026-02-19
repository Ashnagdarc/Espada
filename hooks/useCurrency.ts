import { useSettings } from './useSettings';
import { formatCurrency as formatCurrencyUtil } from '@/lib/settings';

export function useCurrency() {
  const { settings } = useSettings();

  const formatPrice = (amount: number): string => {
    return formatCurrencyUtil(amount, settings.currency);
  };

  return {
    currency: settings.currency,
    formatPrice
  };
}
