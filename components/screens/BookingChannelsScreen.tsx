import AccessDenied from "@/components/AccessDenied";
import { usePermissions } from "@/hooks/usePermissions";
import React from "react";
import { Text, View } from "react-native";

export default function BookingChannelsScreen() {
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  if (permissionsLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!hasPermission("access_booking_channels")) {
    return (
      <AccessDenied message="You don't have permission to access Booking Channels." />
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-xl font-semibold text-gray-800">
        Booking Channels Screen
      </Text>
      <Text className="text-gray-600 mt-2">
        Manage online booking platforms and channels
      </Text>
    </View>
  );
}
