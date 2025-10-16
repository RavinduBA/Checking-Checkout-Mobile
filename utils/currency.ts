// Currency utility functions for mobile app
export type Currency = "LKR" | "USD";

// Basic exchange rates (in a real app, these would come from an API)
const exchangeRates: Record<Currency, number> = {
  USD: 1,
  LKR: 300, // 1 USD = 300 LKR (approximate)
};

export function formatCurrency(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: "$",
    LKR: "Rs.",
  };

  const formattedAmount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbols[currency]}${formattedAmount}`;
}

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to USD first, then to target currency
  const usdAmount = amount / exchangeRates[fromCurrency];
  return usdAmount * exchangeRates[toCurrency];
}

export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: "$",
    LKR: "Rs.",
  };
  return symbols[currency];
}

export function formatCurrencyAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Enhanced conversion function compatible with web app
export async function convertCurrencyAdvanced(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  tenantId?: string,
  locationId?: string
): Promise<number> {
  // For mobile app, use simplified conversion for now
  return convertCurrency(amount, fromCurrency, toCurrency);
}

// Additional utility functions to match web app
export interface CurrencyRate {
  currency_code: string;
  usd_rate: number;
  is_custom: boolean;
}

export async function getCurrencyDetails(
  tenantId: string,
  locationId: string
): Promise<CurrencyRate[]> {
  // For mobile app, return default currencies
  // In future, this could fetch from Supabase
  return [
    { currency_code: "USD", usd_rate: 1, is_custom: false },
    { currency_code: "LKR", usd_rate: 300, is_custom: false },
    { currency_code: "EUR", usd_rate: 0.85, is_custom: false },
    { currency_code: "GBP", usd_rate: 0.75, is_custom: false },
  ];
}

export function getCurrencyConversionSearchUrl(currency: string): string {
  return `https://www.google.com/search?q=USD+to+${currency}+conversion+rate`;
}
