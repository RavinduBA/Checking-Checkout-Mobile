import { Text, View } from "react-native";

export function DashboardHeader() {
  return (
    <View className="gap-2">
      <Text className="text-2xl font-bold text-gray-900">Welcome Back!</Text>
      <Text className="text-sm text-gray-600">
        Here's what's happening with your property today
      </Text>
    </View>
  );
}
