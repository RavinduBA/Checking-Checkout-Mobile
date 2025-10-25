import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Alert, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthContext } from "../contexts/AuthContext";
import { signOut } from "../lib/auth";
import TopBar from "./TopBar";

// Import screen components
import AccountsScreen from "./screens/AccountsScreen";
import BillingSubscriptionsScreen from "./screens/BillingSubscriptionsScreen";
import CalendarScreen from "./screens/CalendarScreen";
import DashboardScreen from "./screens/DashboardScreen";
import ExpensesScreen from "./screens/ExpensesScreen";
import MasterFilesScreen from "./screens/MasterFilesScreen";
import ReportsScreen from "./screens/ReportsScreen";
import ReservationsScreen from "./screens/ReservationsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import UsersScreen from "./screens/UsersScreen";

const Tab = createBottomTabNavigator(); // used for bottom tab navigation.
const Stack = createNativeStackNavigator(); // used for navigating to screens that aren’t part of the tab bar (like Settings or Users).

// Wrapper component that adds TopBar to each screen
function ScreenWithTopBar({
  component: Component,
}: {
  component: React.ComponentType<any>;
}) {
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          // Navigation will be handled automatically by auth state change
        },
      },
    ]);
  };

  const insets = useSafeAreaInsets();
  
  return (
    <View className="flex-1 bg-gray-100">
      <View className="mt-20">
        <TopBar
          onSearch={(query: string) => console.log("Search query:", query)}
          onSettingsPress={() => console.log("Settings pressed")}
          onUserManagementPress={() => console.log("User management pressed")}
          onLogout={handleLogout}
          onNavigateToSettings={() => navigation.navigate("Settings")}
          onNavigateToUsers={() => navigation.navigate("Users")}
          onNavigateToBilling={() => navigation.navigate("Billing")}
          onNavigateToMasterFiles={() => navigation.navigate("MasterFiles")}
        />
      </View>
      <View 
        className="flex-1" 
        style={{ paddingBottom: 30 + insets.bottom + 40 }}
      >
        <Component navigation={navigation} />
      </View>
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 0,
          paddingBottom:  insets.bottom,
          paddingTop: 8,
          paddingHorizontal: 15,
          height: 30 + insets.bottom,
          borderRadius: 30,
          position: "absolute",
          bottom: insets.bottom > 0 ? insets.bottom : 20,
          left: 15,
          right: 15,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: -2,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={25} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={DashboardScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Calendar"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={25} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={CalendarScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Reservations"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="bed" size={25} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={ReservationsScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Expenses"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="attach-money" size={25} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={ExpensesScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Accounts"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="account-balance" size={25} color={color} />
          ),
        }}
      >
        {() => <ScreenWithTopBar component={AccountsScreen} />}
      </Tab.Screen>

      <Tab.Screen
        name="Reports"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart" size={25} color={color} />
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
      <Stack.Screen name="MasterFiles" component={MasterFilesScreen} />
    </Stack.Navigator>
  );
}
