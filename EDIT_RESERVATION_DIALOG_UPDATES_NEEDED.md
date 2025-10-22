# EditReservationDialog - Missing Features from Web App

## Overview

The mobile app's `EditReservationDialog` is missing several critical features that exist in the web app's `ReservationEditDialog`. This document outlines the gaps and provides guidance for updates.

## Major Missing Features

### 1. **Guest Address Field**

- **Web App:** Has a full `guest_address` textarea field
- **Mobile App:** Missing completely
- **Impact:** Cannot edit guest addresses
- **Fix:** Add TextInput with multiline for address

### 2. **Guest ID Number Field**

- **Web App:** Has `guest_id_number` field
- **Mobile App:** Missing
- **Impact:** Cannot track guest ID numbers
- **Fix:** Add TextInput for ID number

### 3. **Booking Source Selector**

- **Web App:** Comprehensive dropdown with 12 options:
  - direct, airbnb, booking_com, expedia, agoda, beds24
  - manual, online, phone, email, walk_in, ical
- **Mobile App:** Only has `booking_source: "direct"` hardcoded
- **Impact:** Cannot properly categorize booking channels
- **Fix:** Add Picker with all booking source options

### 4. **Currency Conversion on Room Selection**

- **Web App:** When selecting a room, automatically converts room price from room's currency to reservation currency using `convertCurrency()` API
- **Mobile App:** Simple assignment without conversion
- **Impact:** Incorrect pricing when room and reservation use different currencies
- **Fix:** Implement async currency conversion when room changes

### 5. **Date Calculation Logic**

- **Web App:** Sophisticated date parsing to avoid timezone issues:
  ```typescript
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  ```
- **Mobile App:** Basic date handling that may have timezone bugs
- **Impact:** Incorrect night calculations across timezones
- **Fix:** Use parseLocalDate pattern for date calculations

### 6. **OTP Verification Flow**

- **Web App:** Sophisticated OTP flow:
  - Shows OTP button when not verified
  - Disables Save button until OTP verified
  - Gets phone from location OR profile
  - Passes locationId for proper verification
- **Mobile App:** Basic or missing OTP integration
- **Impact:** Weaker security for reservation edits
- **Fix:** Implement proper OTP verification with conditional rendering

### 7. **SMS Notification After Update**

- **Web App:** Sends SMS notification after successful reservation update:
  - Fetches room number from database
  - Calls `send-sms-notification` Edge Function
  - Includes all reservation details in SMS
  - Status set to "UPDATED"
- **Mobile App:** Missing SMS notification
- **Impact:** Guests don't receive update confirmations
- **Fix:** Add SMS notification logic after successful save

### 8. **Room Selection Logic**

- **Web App:** Smart room handling:
  - Clears room_id if reservation location differs from selected location
  - Forces user to select new room for different location
  - Proper error handling with toast notifications
- **Mobile App:** Simpler room loading
- **Impact:** May show invalid rooms for location
- **Fix:** Add location comparison logic

### 9. **Status Field**

- **Web App:** Editable status dropdown
- **Mobile App:** Status field exists but might not be in UI
- **Impact:** Cannot change reservation status during edit
- **Fix:** Add Picker for status selection (pending, confirmed, tentative, checked_in, checked_out, cancelled)

### 10. **Financial Display**

- **Web App:** Shows summary box with:
  - Total Amount
  - Paid Amount
  - Balance (with color coding - red if positive, green if zero/negative)
- **Mobile App:** Missing financial summary
- **Impact:** User cannot see financial status while editing
- **Fix:** Add summary View with financial breakdown

### 11. **Form Validation**

- **Web App:** Toast notifications for errors
- **Mobile App:** Alert.alert for errors
- **Impact:** Inconsistent UX (but this is OK for mobile)
- **Note:** Keep Alert.alert for mobile - it's more native

### 12. **Data Fetching**

- **Web App:** Fetches commission_rate for agents and guides
- **Mobile App:** Only fetches id and name
- **Impact:** Cannot auto-populate commission rates
- **Fix:** Add commission_rate to SELECT queries

## Implementation Priority

### High Priority (Must Have)

1. ✅ Guest Address field
2. ✅ Booking Source selector (all 12 options)
3. ✅ Currency conversion on room selection
4. ✅ OTP verification flow
5. ✅ SMS notification after update
6. ✅ Financial summary display

### Medium Priority (Should Have)

7. ✅ Status field editor
8. ✅ Room selection with location check
9. ✅ Commission rate fetching
10. ✅ Date parsing logic improvement

### Low Priority (Nice to Have)

11. Guest ID number field
12. Better error messages

## Code Structure Comparison

### Web App Imports

```typescript
import { useProfile } from "@/hooks/useProfile";
import { convertCurrency } from "@/utils/currency";
import PhoneInput from "react-phone-number-input";
import { DatePicker } from "@/components/ui/date-picker";
import { OTPVerification } from "@/components/auth/OTPVerification";
```

### Mobile App Missing Imports

- `useProfile` hook
- `convertCurrency` utility
- OTPVerification component integration

## Recommended Implementation Approach

### Step 1: Add Missing Form Fields

Add guest_address, guest_id_number, booking_source picker

### Step 2: Implement Currency Conversion

```typescript
const handleRoomChange = async (roomId: string) => {
  const selectedRoom = rooms.find((r) => r.id === roomId);
  if (selectedRoom && reservation) {
    try {
      const convertedPrice = await convertCurrency(
        selectedRoom.base_price,
        selectedRoom.currency,
        formData.currency || "USD",
        reservation.tenant_id || "",
        selectedLocation || ""
      );
      setFormData({
        ...formData,
        room_id: roomId,
        room_rate: convertedPrice,
        total_amount: convertedPrice * (formData.nights || 1),
      });
    } catch (error) {
      console.error("Currency conversion failed:", error);
      // Fallback to original price
    }
  }
};
```

### Step 3: Add OTP Verification

```typescript
const [isOTPVerified, setIsOTPVerified] = useState(false);
const [showOTPDialog, setShowOTPDialog] = useState(false);

const handleSaveRequest = () => {
  if (!validateForm()) return;
  setShowOTPDialog(true);
};

const handleOTPVerified = () => {
  setIsOTPVerified(true);
  setShowOTPDialog(false);
  handleSave();
};
```

### Step 4: Add SMS Notification

```typescript
// After successful update
if (reservation?.guest_phone) {
  try {
    const { data: roomData } = await supabase
      .from("rooms")
      .select("room_number")
      .eq("id", formData.room_id || reservation.room_id)
      .single();

    await supabase.functions.invoke("send-sms-notification", {
      body: {
        type: "reservation",
        phoneNumber: reservation.guest_phone,
        guestName: formData.guest_name || reservation.guest_name,
        reservationNumber: reservation.reservation_number,
        roomNumber: roomData?.room_number || "N/A",
        checkIn: formData.check_in_date || reservation.check_in_date,
        checkOut: formData.check_out_date || reservation.check_out_date,
        amount: formData.total_amount || reservation.total_amount,
        currency: formData.currency || reservation.currency,
        status: "UPDATED",
      },
    });
  } catch (smsError) {
    console.error("Error sending SMS notification:", smsError);
  }
}
```

### Step 5: Add Financial Summary

```tsx
<View className="bg-gray-50 rounded-lg p-4 mb-4">
  <Text className="text-sm font-medium text-gray-700 mb-2">
    Financial Summary
  </Text>

  <View className="flex-row justify-between mb-1">
    <Text className="text-sm text-gray-600">Total Amount:</Text>
    <Text className="text-sm font-semibold">
      {getCurrencySymbol(formData.currency || "USD")}{" "}
      {(formData.total_amount || 0).toLocaleString()}
    </Text>
  </View>

  <View className="flex-row justify-between mb-1">
    <Text className="text-sm text-gray-600">Paid Amount:</Text>
    <Text className="text-sm font-semibold text-emerald-600">
      {getCurrencySymbol(formData.currency || "USD")}{" "}
      {(formData.paid_amount || 0).toLocaleString()}
    </Text>
  </View>

  <View className="flex-row justify-between">
    <Text className="text-sm font-medium">Balance:</Text>
    <Text
      className={`text-base font-bold ${
        (formData.balance_amount || 0) > 0 ? "text-red-600" : "text-emerald-600"
      }`}
    >
      {getCurrencySymbol(formData.currency || "USD")}{" "}
      {(formData.balance_amount || 0).toLocaleString()}
    </Text>
  </View>
</View>
```

## Testing Checklist

After implementing changes, test:

- [ ] Guest address saves and loads correctly
- [ ] Booking source options all display and save
- [ ] Currency conversion works when selecting different rooms
- [ ] OTP verification blocks save until verified
- [ ] SMS notification sends after successful update
- [ ] Financial summary shows correct calculations
- [ ] Status changes save properly
- [ ] Room selection respects location boundaries
- [ ] Date calculations work across timezones
- [ ] Commission rates auto-populate for agents/guides

## Files to Update

1. `components/modals/EditReservationDialog.tsx` - Main component
2. `components/auth/OTPVerification.tsx` - May need mobile version
3. `utils/currency.ts` - Ensure convertCurrency is exported

## Estimated Effort

- **Time:** 4-6 hours
- **Complexity:** High (async operations, OTP flow, SMS integration)
- **Testing:** 2-3 hours
- **Total:** ~8 hours

## Notes

- Mobile app uses React Native components (View, Text, TextInput, Picker, TouchableOpacity)
- Web app uses shadcn/ui components (Dialog, Input, Select, Button)
- Keep mobile-specific patterns (Alert.alert vs toast, Modal vs Dialog)
- Ensure all async operations have proper error handling
- Test on both iOS and Android if possible
