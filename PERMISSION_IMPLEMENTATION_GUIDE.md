# Permission Implementation Guide for Mobile Screens

## Overview

This guide shows how to implement permission checks in all mobile screens to match the web app's security model. Users should only see screens they have permission to access.

## Permission Types (from `types.ts`)

```typescript
access_dashboard; // Dashboard Access
access_income; // Income Management
access_expenses; // Expense Management
access_reports; // Reports & Analytics
access_calendar; // Calendar Access
access_bookings; // Booking Management
access_rooms; // Room Management
access_master_files; // Master Files
access_accounts; // Account Management
access_users; // User Management
access_settings; // Settings Access
access_booking_channels; // Booking Channels
```

## Implementation Pattern

### 1. Import usePermissions Hook

```tsx
import { usePermissions } from "@/hooks/usePermissions";
```

### 2. Use Hook in Component

```tsx
export default function YourScreen() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  // ... rest of code
}
```

### 3. Add Permission Check

```tsx
// Check for single permission
if (!hasPermission("access_reports")) {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-gray-50">
      <View className="bg-red-50 border border-red-200 rounded-lg p-6 items-center">
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text className="text-lg font-semibold text-red-900 mt-4">
          Access Denied
        </Text>
        <Text className="text-sm text-red-700 text-center mt-2">
          You don't have permission to access reports. Please contact your
          administrator.
        </Text>
      </View>
    </View>
  );
}
```

### 4. Check Multiple Permissions (OR logic)

```tsx
// User needs ANY of these permissions
if (!hasAnyPermission(["access_calendar", "access_bookings"])) {
  return <AccessDeniedView />;
}
```

## Screen-by-Screen Implementation Status

### ✅ COMPLETED

1. **UsersScreen.tsx** - `access_users` ✅

   - Already has permission check for invite button
   - Needs full screen access check

2. **ExpensesScreen.tsx** - `access_expenses` ✅

   - Permission check added

3. **ReportsScreen.tsx** - `access_reports` ✅
   - Permission check added

### ⏳ NEEDS IMPLEMENTATION

4. **CalendarScreen.tsx** - `access_calendar`

```tsx
if (!hasPermission("access_calendar")) {
  return <AccessDeniedView message="calendar" />;
}
```

5. **ReservationsScreen.tsx** - `access_bookings`

```tsx
if (!hasPermission("access_bookings")) {
  return <AccessDeniedView message="reservations" />;
}
```

6. **AccountsScreen.tsx** - `access_accounts`

```tsx
if (!hasPermission("access_accounts")) {
  return <AccessDeniedView message="accounts" />;
}
```

7. **SettingsScreen.tsx** - `access_settings`

```tsx
if (!hasPermission("access_settings")) {
  return <AccessDeniedView message="settings" />;
}
```

8. **MasterFilesScreen.tsx** - `access_master_files`

```tsx
if (!hasPermission("access_master_files")) {
  return <AccessDeniedView message="master files" />;
}
```

9. **RoomsScreen.tsx** - `access_rooms`

```tsx
if (!hasPermission("access_rooms")) {
  return <AccessDeniedView message="rooms" />;
}
```

10. **BookingChannelsScreen.tsx** - `access_booking_channels`

```tsx
if (!hasPermission("access_booking_channels")) {
  return <AccessDeniedView message="booking channels" />;
}
```

### ℹ️ NO PERMISSION CHECK NEEDED

11. **DashboardScreen.tsx** - `access_dashboard`

- Usually everyone has dashboard access
- Can check if you want to restrict

12. **BillingSubscriptionsScreen.tsx**

- Admin-only, handled by navigation

13. **OnboardingScreen.tsx** / **AuthScreen.tsx** / **LoginScreen.tsx**

- Public screens, no permission needed

## Reusable Access Denied Component

Create a shared component for consistency:

```tsx
// components/common/AccessDenied.tsx
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

interface AccessDeniedProps {
  feature?: string;
}

export function AccessDenied({ feature = "this feature" }: AccessDeniedProps) {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-gray-50">
      <View className="bg-red-50 border border-red-200 rounded-lg p-6 items-center max-w-md">
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text className="text-lg font-semibold text-red-900 mt-4 text-center">
          Access Denied
        </Text>
        <Text className="text-sm text-red-700 text-center mt-2">
          You don't have permission to access {feature}. Please contact your
          administrator to request access.
        </Text>
      </View>
    </View>
  );
}
```

Then use it:

```tsx
if (!hasPermission("access_reports")) {
  return <AccessDenied feature="reports" />;
}
```

## Navigation Tab Hiding

Also hide navigation tabs for screens users can't access:

```tsx
// In BottomTabNavigator.tsx
const { hasPermission } = usePermissions();

<Tab.Navigator>
  <Tab.Screen name="Dashboard" component={DashboardScreen} />

  {hasPermission("access_calendar") && (
    <Tab.Screen name="Calendar" component={CalendarScreen} />
  )}

  {hasPermission("access_expenses") && (
    <Tab.Screen name="Expenses" component={ExpensesScreen} />
  )}

  {hasPermission("access_reports") && (
    <Tab.Screen name="Reports" component={ReportsScreen} />
  )}

  {hasPermission("access_settings") && (
    <Tab.Screen name="Settings" component={SettingsScreen} />
  )}
</Tab.Navigator>;
```

## Testing Checklist

After implementing:

- [ ] Test with admin user (should see all screens)
- [ ] Test with limited user (should only see assigned screens)
- [ ] Test with no permissions (should see access denied)
- [ ] Verify navigation tabs hide correctly
- [ ] Check error messages are user-friendly
- [ ] Ensure tenant admins bypass all checks (they have all permissions)

## Web App Reference

Check these web files for permission implementation examples:

- `src/pages/expense.tsx` - Good example with `hasAnyPermission`
- `src/pages/reports.tsx` - Permission check at page level
- `src/pages/accounts.tsx` - Permission check with redirect
- `src/hooks/use-permissions.tsx` - Hook implementation
- `src/components/layout/nav-items.tsx` - Navigation hiding logic

## Priority Order

1. **HIGH** - Financial screens (Expenses, Reports, Accounts)
2. **MEDIUM** - Booking screens (Calendar, Reservations, Rooms)
3. **LOW** - Settings, Master Files, Booking Channels

---

**Last Updated**: November 2, 2025
**Status**: 3 of 10 screens completed
