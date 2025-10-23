# ReservationsMobileCards Enhancement

## Changes Made

Updated `ReservationsMobileCards.tsx` to use the `useReservationFinancials` hook instead of the basic `useReservationsData` hook for better financial data handling with USD normalization.

## Key Changes

### 1. **Updated Imports**
```tsx
// Before
import { useReservationsData } from "../../hooks/useReservationsData";

// After
import {
  type ReservationFinancial,
  useReservationFinancials,
} from "../../hooks/useReservationFinancials";
```

### 2. **Replaced Data Hook**
```tsx
// Before
const { reservations, loading } = useReservationsData();

// After
const { data: reservations, isLoading: loading } = useReservationFinancials();
```

### 3. **Removed Manual Currency Conversion**
Removed the entire `convertedAmounts` state and the `useEffect` that handled currency conversion:
- ❌ Removed `useState` for `convertedAmounts`
- ❌ Removed `useEffect` with `convertCurrency` logic
- ✅ Hook now provides pre-converted USD amounts

### 4. **Enhanced Financial Display**
Updated card rendering to show comprehensive financial information in USD:

```tsx
// Room Amount (USD)
Room: $ {reservation.room_amount_usd.toLocaleString()}

// Expenses (USD)
Expenses: $ {reservation.expenses_usd.toLocaleString()}

// Paid Amount (USD)
Paid: $ {reservation.user_paid_amount_usd.toLocaleString()}

// Balance / Needs to Pay (USD)
Balance: $ {reservation.needs_to_pay_usd.toLocaleString()}
```

### 5. **Visual Indicators**
- ✅ **Room Amount**: Cash icon with room rate
- ✅ **Expenses**: Restaurant icon for additional services
- ✅ **Paid Amount**: Green checkmark icon with green text
- ✅ **Balance**: Alert icon (red if balance > 0, gray if paid)

### 6. **Updated Payment Calculation**
```tsx
// Before
const getTotalPayableAmount = (reservation: any): number => {
  return (reservation.paid_amount || 0) + (reservation.balance_amount || 0);
};

// After
const getTotalPayableAmount = (reservation: ReservationFinancial): number => {
  return reservation.room_amount_usd + reservation.expenses_usd;
};
```

## Benefits

1. ✅ **Consistent Currency Display** - All amounts shown in USD
2. ✅ **No Manual Conversion** - Hook handles all currency conversion
3. ✅ **Complete Financial Picture** - Shows room, expenses, paid, and balance
4. ✅ **Better Performance** - No per-reservation async conversion needed
5. ✅ **Type Safety** - Uses `ReservationFinancial` interface
6. ✅ **Visual Clarity** - Color-coded financial indicators

## Display Format

Each reservation card now shows:

```
┌─────────────────────────────────────────┐
│ RES-001              [Confirmed Badge]  │
│ John Doe                                 │
├─────────────────────────────────────────┤
│ 📍 Room 101 - Deluxe                    │
│ 📅 Jan 1, 2025 - Jan 5, 2025           │
│ 💵 Room: $ 400.00                       │
│ 🍽️ Expenses: $ 50.00                    │
│ ✅ Paid: $ 300.00                       │
│ ⚠️ Balance: $ 150.00                    │
├─────────────────────────────────────────┤
│ [View] [Edit] [Payment] [Income] [...]  │
└─────────────────────────────────────────┘
```

## Removed Dependencies

- ❌ No longer uses `convertCurrency` utility in component
- ❌ No longer needs `convertedAmounts` state management
- ❌ No longer needs `useEffect` for currency conversion
- ❌ No longer depends on `selectedCurrency` prop for display

## Financial Data Flow

```
useReservationFinancials Hook
  ↓
Fetches reservations + external bookings
  ↓
Fetches income records
  ↓
Converts all to USD
  ↓
Calculates financial metrics
  ↓
Returns ReservationFinancial[]
  ↓
ReservationsMobileCards displays USD amounts
```

## Testing Recommendations

1. **Verify Financial Calculations**
   - Check room_amount_usd = room_rate × nights (in USD)
   - Check expenses_usd includes all income records
   - Check user_paid_amount_usd matches payments
   - Check needs_to_pay_usd = (room + expenses) - paid

2. **Verify Visual Display**
   - All amounts show with 2 decimal places
   - Balance is red when > 0, gray when = 0
   - Icons display correctly for each field
   - Currency symbol is always $ (USD)

3. **Test Edge Cases**
   - Reservations with no expenses
   - Fully paid reservations (balance = 0)
   - Unpaid reservations (paid = 0)
   - External bookings (channel manager)
   - Multiple currencies in source data

## Next Steps

Consider applying the same pattern to:
- [ ] `ReservationsDesktopTable.tsx` (currently still uses old pattern)
- [ ] Any other components displaying reservation financial data
- [ ] Consider adding currency preference toggle (USD/EUR/GBP)
