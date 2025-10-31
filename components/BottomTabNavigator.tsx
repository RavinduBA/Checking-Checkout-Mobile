import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { Alert, Text, View } from "react-native";
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
      <View style={{ paddingTop: insets.top }}>
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
      <View className="flex-1" style={{ paddingBottom: 60 + insets.bottom }}>
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
          borderTopWidth: 1,
          borderTopColor: "#ffffff",
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          paddingHorizontal: 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
          borderRadius: 0,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowColor: "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
        },
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          opacity: 1,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name="home" 
              size={25} 
              color={color}
              style={{ opacity: focused ? 1 : 0.5 }}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text 
              style={{ 
                fontSize: 10, 
                color: focused ? "#000000" : "#9ca3af",
                fontWeight: focused ? "700" : "400",
                opacity: focused ? 1 : 0.6,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              Dashboard
            </Text>
          ),
        }}
      >
        {() => <ScreenWithTopBar component={DashboardScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Calendar"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name="calendar" 
              size={25} 
              color={color}
              style={{ opacity: focused ? 1 : 0.5 }}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text 
              style={{ 
                fontSize: 10, 
                color: focused ? "#000000" : "#9ca3af",
                fontWeight: focused ? "700" : "400",
                opacity: focused ? 1 : 0.6,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              Calendar
            </Text>
          ),
        }}
      >
        {() => <ScreenWithTopBar component={CalendarScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Reservations"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name="bed" 
              size={25} 
              color={color}
              style={{ opacity: focused ? 1 : 0.5 }}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text 
              style={{ 
                fontSize: 10, 
                color: focused ? "#000000" : "#9ca3af",
                fontWeight: focused ? "700" : "400",
                opacity: focused ? 1 : 0.6,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              Reservations
            </Text>
          ),
        }}
      >
        {() => <ScreenWithTopBar component={ReservationsScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Expenses"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name="attach-money" 
              size={25} 
              color={color}
              style={{ opacity: focused ? 1 : 0.5 }}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text 
              style={{ 
                fontSize: 10, 
                color: focused ? "#000000" : "#9ca3af",
                fontWeight: focused ? "700" : "400",
                opacity: focused ? 1 : 0.6,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              Expenses
            </Text>
          ),
        }}
      >
        {() => <ScreenWithTopBar component={ExpensesScreen} />}
      </Tab.Screen>
      <Tab.Screen
        name="Accounts"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons 
              name="account-balance" 
              size={25} 
              color={color}
              style={{ opacity: focused ? 1 : 0.5 }}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text 
              style={{ 
                fontSize: 10, 
                color: focused ? "#000000" : "#9ca3af",
                fontWeight: focused ? "700" : "400",
                opacity: focused ? 1 : 0.6,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              Accounts
            </Text>
          ),
        }}
      >
        {() => <ScreenWithTopBar component={AccountsScreen} />}
      </Tab.Screen>

      <Tab.Screen
        name="Reports"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name="bar-chart" 
              size={25} 
              color={color}
              style={{ opacity: focused ? 1 : 0.5 }}
            />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text 
              style={{ 
                fontSize: 10, 
                color: focused ? "#000000" : "#9ca3af",
                fontWeight: focused ? "700" : "400",
                opacity: focused ? 1 : 0.6,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              Reports
            </Text>
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
