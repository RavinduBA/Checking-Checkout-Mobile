# Add Income Feature - Component Structure

## Overview

Restructured the Add Income feature to match the web app's component architecture with proper separation of concerns.

## File Structure

```
components/modals/income/
├── AddIncomeDialog.tsx          # Main dialog wrapper
├── AddToBillForm.tsx            # Form for pending charges
├── ImmediatePaymentForm.tsx     # Form for immediate payments
└── shared/
    ├── AmountInput.tsx          # Currency amount input with conversion
    └── AccountSelector.tsx      # Account selection dropdown
```

## Component Responsibilities

### AddIncomeDialog.tsx

- Main modal wrapper
- Toggle between "Add to Bill" and "Immediate Payment" modes
- Fetches income types from database
- Manages base currency and conversion state
- Renders appropriate form based on mode

**Props:**

- `visible`: boolean
- `onClose`: () => void
- `selectedReservation`: Reservation | null
- `accounts`: Account[]
- `onSuccess`: () => void

### AddToBillForm.tsx

- Creates income record with `payment_method="pending"`
- Sets `account_id=null` (not paid yet)
- Database trigger updates `reservation.total_amount`
- Shows blue "Add to Guest Bill" badge
- No account selection needed

**Database Operation:**

```typescript
supabase.from("income").insert({
  booking_id: reservation.id,
  amount: formData.amount,
  currency: formData.currency,
  payment_method: "pending",
  account_id: null,
  type: "booking",
});
```

### ImmediatePaymentForm.tsx

- Creates income record with selected payment method
- Requires account selection
- Converts amount to account currency
- Logs currency conversion
- Sets `additional_service_id=null` (general income)
- Shows green "Immediate Payment" badge

**Database Operation:**

```typescript
// Convert to account currency
convertedAmount = await convertCurrency(
  formData.amount,
  formData.currency,
  accountCurrency,
  tenantId,
  locationId
);

// Insert income
supabase.from("income").insert({
  booking_id: reservation.id,
  amount: convertedAmount,
  currency: accountCurrency,
  payment_method: formData.payment_method,
  account_id: formData.account_id,
  additional_service_id: null
})

// Log conversion
supabase.from("currency_conversion_log").insert({...})
```

### shared/AmountInput.tsx

- Amount input with decimal keyboard
- Currency picker (LKR, USD, EUR, GBP)
- Real-time currency conversion using `convertCurrency()`
- Updates displayed reservation amount when currency changes

**Features:**

- Converts current amount to new currency
- Converts base reservation amount for display
- Shows warnings if conversion fails
- Validates tenant_id and location_id

### shared/AccountSelector.tsx

- Dropdown for selecting payment account
- Shows account name and currency
- Required field indicator
- Filtered by tenant/location (handled by parent)

**Props:**

- `accounts`: Account[]
- `selectedAccountId`: string
- `onAccountChange`: (accountId: string) => void
- `required`: boolean

## Integration

### ReservationsScreen.tsx

```typescript
import { AddIncomeDialog } from "../modals/income/AddIncomeDialog";

// State
const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
const [selectedReservation, setSelectedReservation] = useState<any>(null);

// Handler
const handleAddIncome = (reservation: any) => {
  setSelectedReservation(reservation);
  setIsIncomeDialogOpen(true);
};

// Render
<AddIncomeDialog
  visible={isIncomeDialogOpen}
  selectedReservation={selectedReservation}
  accounts={accounts}
  onClose={() => {
    setIsIncomeDialogOpen(false);
    setSelectedReservation(null);
  }}
  onSuccess={handleIncomeSuccess}
/>;
```

## Database Schema

### income table

- `id`: uuid (PK)
- `booking_id`: uuid (FK → reservations)
- `amount`: numeric
- `currency`: enum (LKR, USD, EUR, GBP)
- `payment_method`: text (cash, card, pending, etc.)
- `account_id`: uuid (FK → accounts, null for pending)
- `income_type_id`: uuid (FK → income_types)
- `type`: text (booking, general, etc.)
- `note`: text
- `date`: date
- `additional_service_id`: uuid (null for general income)
- `tenant_id`: uuid
- `location_id`: uuid

### Database Triggers

1. **Add to Bill**: Trigger increases `reservation.total_amount`
2. **Immediate Payment**: No trigger (direct account recording)

## Currency Conversion

Uses `convertCurrency()` utility:

```typescript
convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  tenantId: string,
  locationId: string
): Promise<number>
```

**Flow:**

1. Fetch exchange rate from `currency_rates` table
2. Calculate converted amount
3. Return rounded result
4. Log conversion in `currency_conversion_log` table

## Feature Parity with Web App

✅ **Completed:**

- Dual-mode toggle (Add to Bill / Immediate Payment)
- Income type selection
- Multi-currency support with conversion
- Account selection for immediate payments
- Payment method selection
- Notes/descriptions
- Database triggers respect
- Currency conversion logging
- Validation (amount > 0, account required)
- Success/error handling with toasts

## Usage Examples

### Add to Bill (Pending Payment)

1. User clicks "Add Income" on reservation
2. Dialog opens with toggle OFF (default)
3. Turn toggle ON for "Add to Guest Bill"
4. Select income type (e.g., "Room Service")
5. Enter amount (e.g., 5000 LKR)
6. Add note (e.g., "Breakfast delivery")
7. Click "Add to Bill"
8. Database creates pending income record
9. Trigger updates reservation total_amount
10. Guest pays at checkout

### Immediate Payment

1. User clicks "Add Income" on reservation
2. Dialog opens with toggle OFF
3. Select income type (e.g., "Laundry")
4. Enter amount (e.g., 50 USD)
5. Select currency (converts if needed)
6. Select account (e.g., "Cash Account LKR")
7. System converts 50 USD → LKR
8. Select payment method (e.g., "Cash")
9. Add note
10. Click "Record Payment"
11. Income recorded in account immediately
12. Conversion logged for audit

## Benefits of New Structure

1. **Maintainability**: Each component has single responsibility
2. **Reusability**: Shared components can be used elsewhere
3. **Testability**: Smaller components easier to test
4. **Code Organization**: Matches web app structure
5. **Feature Parity**: 100% match with web app functionality
6. **Scalability**: Easy to add new features or modify existing ones
