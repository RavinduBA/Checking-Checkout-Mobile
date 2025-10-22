import React from "react";
import { Text, View } from "react-native";
import { useIncomeData } from "../../hooks";

interface ReservationExpensesDisplayProps {
  reservationId: string;
  currency: string;
  isCompact?: boolean;
}

export function ReservationExpensesDisplay({
  reservationId,
  currency,
  isCompact = false,
}: ReservationExpensesDisplayProps) {
  const { incomeRecords } = useIncomeData();

  // Utility function
  const getCurrencySymbol = (currency: string): string => {
    const symbols: Record<string, string> = {
      LKR: "Rs.",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    return symbols[currency] || currency;
  };

  const additionalServices = incomeRecords
    .filter(
      (inc) =>
        inc.booking_id === reservationId && inc.payment_method === "pending"
    )
    .reduce((sum, inc) => sum + Number(inc.amount), 0);

  const totalAdditionalServices = incomeRecords
    .filter((inc) => inc.booking_id === reservationId)
    .reduce((sum, inc) => sum + Number(inc.amount), 0);

  if (totalAdditionalServices === 0) {
    return <Text className="text-gray-400">-</Text>;
  }

  if (isCompact) {
    return (
      <View className="flex-row flex-wrap">
        <Text className="text-sm text-gray-800">
          {getCurrencySymbol(currency)}{" "}
          {totalAdditionalServices.toLocaleString()}
        </Text>
        {additionalServices > 0 && (
          <Text className="text-sm text-yellow-600 ml-2">
            (Pending: {getCurrencySymbol(currency)}{" "}
            {additionalServices.toLocaleString()})
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="space-y-1">
      <Text className="font-medium text-sm text-gray-800">
        {getCurrencySymbol(currency)} {totalAdditionalServices.toLocaleString()}
      </Text>
      {additionalServices > 0 && (
        <Text className="text-yellow-600 text-xs">
          Pending: {getCurrencySymbol(currency)}{" "}
          {additionalServices.toLocaleString()}
        </Text>
      )}
    </View>
  );
}
