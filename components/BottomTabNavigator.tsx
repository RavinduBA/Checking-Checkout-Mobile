import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
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

// Wrapper component that adds TopBar to each screen
function ScreenWithTopBar({ component: Component }: { component: React.ComponentType }) {
  const navigation = useNavigation();
  
  return (
    <View className="flex-1 bg-gray-50">
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
          onNavigateToSettings={() => navigation.navigate('Settings' as never)}
          onNavigateToUsers={() => navigation.navigate('Users' as never)}
        />
      </View>
      <Component />
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#6b7280",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
        tabBarIconStyle: {
          marginBottom: -3,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={DashboardScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Calendar"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={CalendarScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Reservations"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bed" size={size} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={ReservationsScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Expenses"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="attach-money" size={size} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={ExpensesScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Accounts"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-balance" size={size} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={AccountsScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Booking Channels"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="globe" size={size} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={BookingChannelsScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Master Files"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder" size={size} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={MasterFilesScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Reports"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={ReportsScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Users"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={UsersScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={SettingsScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Billing"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="credit-card" size={size} color={color} />
          ),
          tabBarLabel: "Billing & Subscriptions",
        }}
      >
        {() => <ScreenWithTopBar component={BillingSubscriptionsScreen} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
      