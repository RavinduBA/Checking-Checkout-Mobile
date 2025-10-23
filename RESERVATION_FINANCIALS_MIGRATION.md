# useReservationFinancials Hook Migration

## Changes Made

Migrated the `useReservationFinancials` hook from the web app to the mobile app with proper adaptations for React Native.

## Key Adaptations for Mobile App

### 1. **Using Mobile App Contexts & Hooks**
- ✅ Uses `useTenant()` from mobile app (instead of `useAuth().tenant`)
- ✅ Uses `useLocationContext()` from mobile app contexts
- ✅ Uses mobile app's `supabase` client from `lib/supabase`
- ✅ Uses mobile app's `convertCurrency` utility

### 2. **Changed from React Query to useState/useEffect**
Web app uses `@tanstack/react-query`:
```tsx
return useQuery({
  queryKey: ["reservation-financials", tenant?.id, selectedLocation],
  queryFn: async () => { ... }
});
```

Mobile app uses React hooks:
```tsx
const [data, setData] = useState<ReservationFinancial[]>([]);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  fetchData();
}, [fetchData]);

return { data, isLoading, error, refetch };
```

### 3. **External Bookings Handling**
Added graceful error handling for `external_bookings` table (which may not exist in all schemas):
```tsx
if (externalError) {
  console.warn("External bookings error (may not exist):", externalError);
}
```

### 4. **Data Structure**
Uses the same `ReservationFinancial` interface:
```tsx
export interface ReservationFinancial {
  id: string;
  reservation_number: string;
  guest_name: string;
  status: string;
  currency: string;
  room_amount_usd: number;
  expenses_usd: number;
  user_paid_amount_usd: number;
  needs_to_pay_usd: number;
  // ... additional fields
}
```

## Features

### ✅ **Currency Conversion**
- Converts all amounts to USD for consistent financial reporting
- Uses proper async currency conversion for each reservation
- Handles multiple currencies (LKR, USD, etc.)

### ✅ **External Bookings Support**
- Integrates channel manager bookings (Beds24, etc.)
- Transforms external bookings to match reservation format
- Combines regular and external reservations

### ✅ **Income Tracking**
- Fetches income records linked to reservations
- Converts income amounts to USD
- Calculates total expenses from income records

### ✅ **Financial Calculations**
- Room amount (rate × nights)
- Total expenses from income records
- Paid amount
- Balance (needs to pay)

### ✅ **Error Handling**
- Graceful fallback if currency conversion fails
- Continues processing other reservations on individual errors
- Logs errors to console for debugging

## Usage in Mobile App

```tsx
import { useReservationFinancials } from "@/hooks/useReservationFinancials";

function ReservationsScreen() {
  const { data, isLoading, error, refetch } = useReservationFinancials();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <View>
      {data.map(reservation => (
        <ReservationCard 
          key={reservation.id}
          reservation={reservation}
          // All amounts are in USD
          roomAmount={reservation.room_amount_usd}
          expenses={reservation.expenses_usd}
          paid={reservation.user_paid_amount_usd}
          balance={reservation.needs_to_pay_usd}
        />
      ))}
    </View>
  );
}
```

## Return Values

```tsx
{
  data: ReservationFinancial[];      // Array of reservations with financial data
  isLoading: boolean;                 // Loading state
  error: string | null;               // Error message if any
  refetch: () => Promise<void>;       // Function to manually refetch data
}
```

## Differences from Web App

| Feature | Web App | Mobile App |
|---------|---------|------------|
| State Management | React Query | useState + useEffect |
| Auth Context | `useAuth().tenant` | `useTenant()` |
| Auto-fetch | Via React Query | Via useEffect |
| Enabled Logic | Query `enabled` prop | Conditional in useEffect |
| Caching | React Query cache | Component state only |

## Benefits for Mobile App

1. ✅ **Simplified Dependencies** - No need for React Query library
2. ✅ **Consistent with Mobile Patterns** - Uses existing mobile app hooks
3. ✅ **Better Error Handling** - Graceful degradation on errors
4. ✅ **Performance** - Auto-fetches and caches in component state
5. ✅ **Unified Data** - Combines regular and external bookings seamlessly

## Next Steps

Consider adding:
- [ ] Memoization with `useMemo` for filtered/sorted data
- [ ] Pull-to-refresh support
- [ ] Pagination for large datasets
- [ ] Offline caching with AsyncStorage
