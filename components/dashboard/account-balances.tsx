import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useTenant } from "../../hooks/useTenant";
import type { Database } from "../../integrations/supabase/types";
import { supabase } from "../../lib/supabase";
import { getCurrencySymbol } from "../../utils/currency";

type Account = Database["public"]["Tables"]["accounts"]["Row"];

interface AccountBalance {
  id: string;
  name: string;
  currency: string;
  initial_balance: number;
  current_balance: number;
  location_access: string[];
}

interface AccountBalancesProps {
  selectedLocation: string;
}

export function AccountBalances({ selectedLocation }: AccountBalancesProps) {
  const [loading, setLoading] = useState(true);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const { tenant } = useTenant();

  const fetchAccountBalances = useCallback(async () => {
    if (!tenant?.id) {
      setLoading(false);
      return;
    }

    try {
      // Get locations for the tenant first to filter by tenant
      const { data: tenantLocations } = await supabase
        .from("locations")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("is_active", true);

      const tenantLocationIds = tenantLocations?.map((loc) => loc.id) || [];

      if (tenantLocationIds.length === 0) {
        setAccountBalances([]);
        setLoading(false);
        return;
      }

      // Fetch accounts with balances
      const { data: directBalanceData, error: directError } = await supabase
        .from("accounts")
        .select(
          `
          id,
          name,
          currency,
          initial_balance,
          current_balance,
          location_access
        `
        )
        .eq("tenant_id", tenant.id);

      if (directError) {
        throw directError;
      }

      // Filter and process the data
      const processedBalances = (directBalanceData || [])
        .filter((account) =>
          account.location_access.some((locationId: string) =>
            tenantLocationIds.includes(locationId)
          )
        )
        .map((account) => ({
          id: account.id,
          name: account.name,
          currency: account.currency,
          initial_balance: account.initial_balance,
          current_balance: account.current_balance,
          location_access: account.location_access,
        }));

      setAccountBalances(processedBalances);
    } catch (error) {
      console.error("Error fetching account balances:", error);
      setAccountBalances([]);
    } finally {
      setLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    fetchAccountBalances();
  }, [fetchAccountBalances]);

  if (loading) {
    return (
      <View className="bg-white rounded-xl p-6 border border-gray-200">
        <View className="flex-row items-center gap-2 mb-4">
          <Ionicons name="cash-outline" size={20} color="#3b82f6" />
          <Text className="text-lg font-semibold text-gray-900">
            Account Balances
          </Text>
        </View>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200">
      <View className="flex-row items-center gap-2 mb-4">
        <Ionicons name="wallet" size={20} color="#3b82f6" />
        <Text className="text-lg font-semibold text-gray-900">
          Account Balances
        </Text>
      </View>
      <View className="gap-3">
        {accountBalances.map((account) => (
          <View
            key={account.id}
            className="flex-row items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View className="bg-blue-500 rounded-full p-2">
                <Ionicons name="card" size={18} color="white" />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="font-bold text-gray-900 text-sm" numberOfLines={1}>
                  {account.name}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {account.currency} Account
                </Text>
              </View>
            </View>
            <View className="items-end ml-3">
              <Text className="text-base font-bold text-blue-600">
                {getCurrencySymbol(account.currency)}
                {account.current_balance.toLocaleString()}
              </Text>
              <View className="mt-1 px-2 py-0.5 bg-blue-500 rounded-full">
                <Text className="text-[10px] font-bold text-white">
                  {account.currency}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
