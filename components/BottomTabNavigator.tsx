import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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

export default function BottomTabNavigator() {
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
      />
      </View>
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
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Reservations"
          component={ReservationsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bed" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Expenses"
          component={ExpensesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="attach-money" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Accounts"
          component={AccountsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="account-balance" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Booking Channels"
          component={BookingChannelsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="globe" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Master Files"
          component={MasterFilesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="folder" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Billing"
          component={BillingSubscriptionsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="credit-card" size={size} color={color} />
            ),
            tabBarLabel: "Billing & Subscriptions",
          }}
        />
      </Tab.Navigator>
    </View>
  );
}
