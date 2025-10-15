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
