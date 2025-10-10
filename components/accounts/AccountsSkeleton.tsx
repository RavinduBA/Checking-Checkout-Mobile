import React from "react";
import { View } from "react-native";

export function AccountsSkeleton() {
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4">
        <View className="h-8 bg-gray-200 rounded w-32" />
      </View>

      <View className="px-6 py-6">
        {/* Summary Cards Skeleton */}
        <View className="flex-row gap-3 mb-6">
          {[1, 2, 3].map((index) => (
            <View
              key={index}
              className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <View className="w-8 h-8 bg-gray-200 rounded-lg mb-2" />
              <View className="h-3 bg-gray-200 rounded w-16 mb-1" />
              <View className="h-4 bg-gray-200 rounded w-12" />
            </View>
          ))}
        </View>

        {/* Tab Navigation Skeleton */}
        <View className="bg-white rounded-lg p-1 mb-6 shadow-sm border border-gray-100">
          <View className="flex-row">
            <View className="flex-1 h-12 bg-gray-200 rounded-md mr-1" />
            <View className="flex-1 h-12 bg-gray-100 rounded-md ml-1" />
          </View>
        </View>

        {/* Account Cards Skeleton */}
        {[1, 2, 3].map((index) => (
          <View
            key={index}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
          >
            <View className="flex-row justify-between items-center mb-3">
              <View className="h-5 bg-gray-200 rounded w-32" />
              <View className="w-12 h-6 bg-gray-200 rounded-full" />
            </View>
            <View className="flex-row justify-between items-center mb-4">
              <View className="h-4 bg-gray-200 rounded w-24" />
              <View className="h-6 bg-gray-200 rounded w-20" />
            </View>
            <View className="flex-row gap-2">
              <View className="flex-1 h-12 bg-gray-100 rounded-lg" />
              <View className="flex-1 h-12 bg-gray-100 rounded-lg" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
