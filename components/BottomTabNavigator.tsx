import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { View } from "react-native";
import TopBar from "./TopBar";

// Import screen components
import AccountsScreen from "./screens/AccountsScreen";
import BillingSubscriptionsScreen from "./screens/BillingSubscriptionsScreen";
import BookingChannelsScreen from "./screens/BookingChannelsScreen";
import CalendarScreen from "./screens/CalendarScreen";
import DashboardScreen from "./screens/DashboardScreen";
import ExpensesScreen from "./screens/ExpensesScreen";
import MasterFilesScreen from "./screens/MasterFilesScreen";
import ReportsScreen from "./screens/ReportsScreen";
import ReservationsScreen from "./screens/ReservationsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import UsersScreen from "./screens/UsersScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Wrapper component that adds TopBar to each screen
function ScreenWithTopBar({
  component: Component,
}: {
  component: React.ComponentType<any>;
}) {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-gray-100">
      <View className="mt-20">
        <TopBar
          selectedLocation="Downtown Hotel"
          userName="John Doe"
          userEmail="john.doe@hotel.com"
          onLocationChange={(location: string) =>
            console.log("Location changed to:", location)
          }
          onSearch={(query: string) => console.log("Search query:", query)}
          onSettingsPress={() => console.log("Settings pressed")}
          onUserManagementPress={() => console.log("User management pressed")}
          onLogout={() => console.log("Logout pressed")}
          onNavigateToSettings={() => navigation.navigate("Settings")}
          onNavigateToUsers={() => navigation.navigate("Users")}
          onNavigateToBilling={() => navigation.navigate("Billing")}
        />
      </View>
      <Component navigation={navigation} />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 10,
          paddingTop: 3,
          height: 80,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: "absolute",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#6b7280",
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: "500",
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={20} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={DashboardScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Calendar"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={20} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={CalendarScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Reservations"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="bed" size={20} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={ReservationsScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Expenses"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="attach-money" size={20} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={ExpensesScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Accounts"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-balance" size={20} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={AccountsScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Booking Channels"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="globe" size={20} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={BookingChannelsScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Master Files"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="folder" size={20} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={MasterFilesScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Reports"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart" size={20} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={ReportsScreen} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Users" component={UsersScreen} />
      <Stack.Screen name="Billing" component={BillingSubscriptionsScreen} />
    </Stack.Navigator>
  );
}
