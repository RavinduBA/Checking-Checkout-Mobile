import { useLocationContext } from "@/contexts/LocationContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getAvailableCurrencies } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ReportFiltersProps {
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  baseCurrency: string;
  setBaseCurrency: (v: string) => void;
  onRefresh: () => void;
  onExport: () => void;
}

function formatDateLabel(dateStr?: string) {
  if (!dateStr) return "Select";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toISOString().split("T")[0];
}

function parseDateString(date: Date) {
  return date.toISOString().split("T")[0];
}

export function ReportFilters({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  baseCurrency,
  setBaseCurrency,
  onRefresh,
  onExport,
}: ReportFiltersProps) {
  const { profile } = useUserProfile();
  const { getSelectedLocationData } = useLocationContext();
  const selectedLocationData = getSelectedLocationData?.();

  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!profile?.tenant_id) return;
      setLoading(true);
      try {
        const locationId = selectedLocationData?.id ?? "";
        const list = await getAvailableCurrencies(
          profile.tenant_id,
          String(locationId)
        );
        if (mounted) {
          setAvailableCurrencies(list || ["LKR"]);
          // Set default currency if not already set or if current is not in list
          if (
            list &&
            list.length > 0 &&
            (!baseCurrency || !list.includes(baseCurrency))
          ) {
            setBaseCurrency(list.includes("LKR") ? "LKR" : list[0]);
          }
        }
      } catch (e) {
        if (mounted) {
          setAvailableCurrencies(["LKR"]);
          if (!baseCurrency) setBaseCurrency("LKR");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [profile?.tenant_id, selectedLocationData?.id]);

  const handleFromDateChange = (_: any, selectedDate?: Date) => {
    setShowFromDatePicker(false);
    if (selectedDate) setDateFrom(parseDateString(selectedDate));
  };

  const handleToDateChange = (_: any, selectedDate?: Date) => {
    setShowToDatePicker(false);
    if (selectedDate) setDateTo(parseDateString(selectedDate));
  };

  const clearFromDate = () => {
    setDateFrom("");
  };

  const clearToDate = () => {
    setDateTo("");
  };

  return (
    <View className="bg-white rounded-lg p-2 mx-4 mb-3 border border-gray-200">
      {/* Single row with all controls */}
      <View className="flex-row items-end gap-2">
        {/* Currency Selector */}
        <View style={{ width: 90 }}>
          <Text className="text-xs text-gray-600 mb-1">Currency</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <View className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              <Picker
                selectedValue={baseCurrency}
                onValueChange={(itemValue) => {
                  if (itemValue) {
                    setBaseCurrency(String(itemValue));
                  }
                }}
                style={{ 
                  height: Platform.OS === "ios" ? 38 : 40,
                  width: "100%"
                }}
                itemStyle={{ height: Platform.OS === "ios" ? 38 : 40 }}
              >
                {availableCurrencies.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>
          )}
        </View>

        {/* From Date */}
        <View className="flex-1">
          <Text className="text-xs text-gray-600 mb-1">From</Text>
          <View className="flex-row items-center gap-1">
            <TouchableOpacity
              onPress={() => setShowFromDatePicker(true)}
              className="flex-1 flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-2 py-2"
            >
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text className="text-xs ml-1 flex-1" numberOfLines={1}>
                {formatDateLabel(dateFrom)}
              </Text>
            </TouchableOpacity>
            {dateFrom && (
              <TouchableOpacity onPress={clearFromDate}>
                <Ionicons name="close-circle" size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* To Date */}
        <View className="flex-1">
          <Text className="text-xs text-gray-600 mb-1">To</Text>
          <View className="flex-row items-center gap-1">
            <TouchableOpacity
              onPress={() => setShowToDatePicker(true)}
              className="flex-1 flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-2 py-2"
            >
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text className="text-xs ml-1 flex-1" numberOfLines={1}>
                {formatDateLabel(dateTo)}
              </Text>
            </TouchableOpacity>
            {dateTo && (
              <TouchableOpacity onPress={clearToDate}>
                <Ionicons name="close-circle" size={18} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Export Button */}
        <View style={{ marginBottom: Platform.OS === "ios" ? 0 : 2 }}>
          <TouchableOpacity
            onPress={onExport}
            className="px-3 py-2 bg-blue-500 rounded-lg flex-row items-center"
          >
            <Ionicons name="download-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {showFromDatePicker && (
        <DateTimePicker
          value={dateFrom ? new Date(dateFrom) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "calendar"}
          onChange={handleFromDateChange}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={dateTo ? new Date(dateTo) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "calendar"}
          onChange={handleToDateChange}
        />
      )}
    </View>
  );
}
