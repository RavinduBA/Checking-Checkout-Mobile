import React from "react";
import { Text, View } from "react-native";

interface CalendarLegendProps {
  className?: string;
}

export function CalendarLegend({ className }: CalendarLegendProps) {
  return (
    <View className={className}>
      <View className="gap-2">
        {/* Reservation Status Legend */}
        <View>
          <Text className="text-[8px] sm:text-[9px] text-gray-500 font-semibold mb-1">
            Direct Bookings:
          </Text>
          <View className="flex-row flex-wrap gap-1">
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2.5 bg-emerald-500 rounded-sm" />
              <Text className="text-[9px] sm:text-[10px]">Confirmed</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2.5 bg-amber-500 rounded-sm" />
              <Text className="text-[9px] sm:text-[10px]">Tentative</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2.5 bg-sky-500 rounded-sm" />
              <Text className="text-[9px] sm:text-[10px]">Pending</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2.5 bg-violet-500 rounded-sm" />
              <Text className="text-[9px] sm:text-[10px]">Checked In</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2.5 bg-slate-400 rounded-sm" />
              <Text className="text-[9px] sm:text-[10px]">Checked Out</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2.5 bg-rose-500 rounded-sm" />
              <Text className="text-[9px] sm:text-[10px]">Cancelled</Text>
            </View>
          </View>
        </View>

        {/* Channel Bookings Legend */}
        <View>
          <Text className="text-[8px] sm:text-[9px] text-gray-500 font-semibold mb-1">
            Channel Bookings:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <View className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 bg-blue-100 border-2 border-blue-400 rounded-sm" />
              <Text className="text-[9px] sm:text-[10px]">Booking.com</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 bg-pink-100 border-2 border-pink-400 rounded-sm" />
              <Text className="text-[9px] sm:text-[10px]">Airbnb</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 bg-yellow-100 border-2 border-yellow-400 rounded-sm" />
              <Text className="text-[9px] sm:text-[10px]">Expedia</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 bg-purple-100 border-2 border-purple-400 rounded-sm" />
              <Text className="text-[9px] sm:text-[10px]">Beds24</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 bg-teal-100 border-2 border-teal-400 rounded-sm" />
              <Text className="text-[9px] sm:text-[10px]">iCal</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2.5 h-2.5 bg-yellow-100 border-2 border-yellow-600 rounded-sm" />
              <View className="flex-row items-center gap-0.5">
                <Text className="text-[9px] sm:text-[10px]">Unmapped</Text>
                <Text className="text-[8px]">⚠️</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
