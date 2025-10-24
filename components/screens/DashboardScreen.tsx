import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useLocationContext } from "../../contexts/LocationContext";
import { usePermissions } from "../../hooks/usePermissions";
import type { Database } from "../../integrations/supabase/types";
import {
  AccountBalances,
  BookingSourceChart,
  DashboardHeader,
  IncomeExpenseChart,
  UpcomingBookings,
} from "../dashboard";

type Location = Database["public"]["Tables"]["locations"]["Row"];

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { selectedLocation } = useLocationContext();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const { hasAnyPermission } = usePermissions();

  const handleViewAllBookings = () => {
    navigation.navigate("Calendar");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 pb-20 gap-4">
        {/* Header */}
        <DashboardHeader />

        {/* Income & Expense Chart */}
        <IncomeExpenseChart
          selectedLocation={selectedLocation || ""}
          selectedMonth={selectedMonth}
          locations={locations}
        />

        {/* Booking Source Chart */}
        <BookingSourceChart
          selectedLocation={selectedLocation || ""}
          selectedMonth={selectedMonth}
        />

        {/* Account Balances and Upcoming Bookings */}
        <View className="gap-4">
          {/* Account Balances */}
          <AccountBalances selectedLocation={selectedLocation || ""} />

          {/* Upcoming Bookings */}
          <UpcomingBookings
            selectedLocation={selectedLocation || ""}
            hasCalendarPermission={hasAnyPermission("access_calendar")}
            onViewAllPress={handleViewAllBookings}
          />
        </View>
      </View>
    </ScrollView>
  );
}
