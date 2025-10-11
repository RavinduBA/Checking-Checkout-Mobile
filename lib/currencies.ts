// Currency management utilities for mobile app
export type CurrencyType = 'LKR' | 'USD';

export interface CurrencyOption {
  value: CurrencyType;
  label: string;
  symbol: string;
}

// Supported currencies - restricted to LKR and USD only
export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { value: 'LKR', label: 'Sri Lankan Rupee', symbol: 'Rs.' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
];

// Get currency symbol
export const getCurrencySymbol = (currency: CurrencyType): string => {
  const option = SUPPORTED_CURRENCIES.find(opt => opt.value === currency);
  return option?.symbol || '$';
};

// Get currency label
export const getCurrencyLabel = (currency: CurrencyType): string => {
  const option = SUPPORTED_CURRENCIES.find(opt => opt.value === currency);
  return option?.label || currency;
};

// Get currency option by value
export const getCurrencyOption = (currency: CurrencyType): CurrencyOption | undefined => {
  return SUPPORTED_CURRENCIES.find(opt => opt.value === currency);
};

// Default exchange rates (can be updated by user)
export const DEFAULT_EXCHANGE_RATES = {
  usdToLkr: 300,
  lkrToUsd: 0.0033,
};

// Get conversion rate between currencies
export const getConversionRate = (
  fromCurrency: CurrencyType,
  toCurrency: CurrencyType,
  exchangeRates = DEFAULT_EXCHANGE_RATES
): number => {
  if (fromCurrency === toCurrency) return 1;
  
  if (fromCurrency === 'USD' && toCurrency === 'LKR') {
    return exchangeRates.usdToLkr;
  } else if (fromCurrency === 'LKR' && toCurrency === 'USD') {
    return exchangeRates.lkrToUsd;
  }
  
  return 1;
};
