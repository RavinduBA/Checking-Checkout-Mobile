# Accounts Components - React Native Mobile App

This directory contains all the components and functionality for the Accounts feature in the React Native mobile app, ported from the web application.

## Components

### Core Components

- **AccountCard.tsx** - Individual account display card with edit/delete actions
- **AccountGrid.tsx** - Grid/list layout for displaying multiple accounts
- **AccountSummaryCards.tsx** - Summary cards showing total accounts and balances by currency
- **AccountForm.tsx** - Modal form for creating and editing accounts
- **AccountTransferForm.tsx** - Modal form for transferring money between accounts
- **RecentTransactions.tsx** - Display recent income and expense transactions
- **AccountsSkeleton.tsx** - Loading skeleton for the accounts screen

### Features Implemented

#### ✅ Account Management

- Create new accounts with name, currency (LKR, USD, EUR, GBP), and initial balance
- Edit existing accounts (updates current balance based on initial balance changes)
- Delete accounts with confirmation dialog
- Location-based access control for accounts

#### ✅ Account Display

- Summary cards showing total accounts and balances by currency
- Mobile-optimized card layout for individual accounts
- Currency symbols and proper formatting
- Empty state with friendly message

#### ✅ Money Transfers

- Transfer money between accounts of the same currency
- Real-time balance validation
- Currency mismatch warnings
- Transaction-like updates (rollback on failure)

#### ✅ Transaction History

- Recent transactions from both income and expenses tables
- Transaction type indicators (income/expense)
- Date formatting with relative time
- Pull-to-refresh functionality
- Empty state handling

#### ✅ Mobile UX Features

- Pull-to-refresh for data updates
- Loading skeletons
- Modal forms optimized for mobile
- Touch-friendly buttons and interactions
- Proper keyboard handling
- Native alerts and confirmations

## Hooks

### Custom Hooks Created

- **useAccounts.ts** - Manages account data fetching and state
- **useTenant.ts** - Handles tenant information and ownership
- **useLocations.ts** - Manages location data for account access control
- **useAccountOperations.ts** - Handles account deletion with user confirmation
- **useToast.ts** - Simple toast/alert utility for user feedback

## Data Flow

1. **Authentication** → `useAuth` hook provides user session
2. **Profile** → `useUserProfile` hook gets user profile with tenant_id
3. **Tenant** → `useTenant` hook gets tenant information
4. **Accounts** → `useAccounts` hook fetches tenant's accounts
5. **Locations** → `useLocations` hook fetches tenant's locations for access control

## Database Integration

The components integrate with Supabase tables:

- `accounts` - Account information and balances
- `locations` - Property locations for access control
- `income` - Income transactions for history
- `expenses` - Expense transactions for history
- `tenants` - Tenant information
- `profiles` - User profiles

## Usage

```tsx
import AccountsScreen from "./components/screens/AccountsScreen";

// The AccountsScreen component handles all account functionality
<AccountsScreen />;
```

## Mobile Adaptations

The components have been specifically adapted for mobile:

- Touch-optimized button sizes and spacing
- Modal forms instead of dialogs
- Pull-to-refresh for data updates
- Mobile-friendly loading states
- Proper keyboard handling for form inputs
- Native platform alerts and confirmations
- Responsive grid layouts
- Safe area handling

## Dependencies

- React Native
- Expo Vector Icons
- Supabase JS client
- NativeWind for styling
- AsyncStorage for caching
- React Navigation (for modals)

## Performance Considerations

- Efficient re-renders with proper dependency arrays
- Optimistic updates where appropriate
- Proper loading states to prevent UI jumps
- Minimal API calls with smart caching
- Pull-to-refresh for user-initiated updates
