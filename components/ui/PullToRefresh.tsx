import React, { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  refreshing?: boolean;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: any;
  style?: any;
}

export default function PullToRefresh({
  onRefresh,
  children,
  refreshing: externalRefreshing,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  style,
}: PullToRefreshProps) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  // Use external refreshing state if provided, otherwise use internal state
  const isRefreshing =
    externalRefreshing !== undefined ? externalRefreshing : internalRefreshing;

  const handleRefresh = async () => {
    if (externalRefreshing === undefined) {
      setInternalRefreshing(true);
    }

    try {
      await onRefresh();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      if (externalRefreshing === undefined) {
        setInternalRefreshing(false);
      }
    }
  };

  return (
    <ScrollView
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={["#3b82f6"]} // Android
          tintColor="#3b82f6" // iOS
          title="Pull to refresh..." // iOS
          titleColor="#6b7280" // iOS
        />
      }
    >
      {children}
    </ScrollView>
  );
}

// Alternative component for FlatList and SectionList
export function RefreshControlComponent({
  onRefresh,
  refreshing: externalRefreshing,
}: {
  onRefresh: () => Promise<void> | void;
  refreshing?: boolean;
}) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const isRefreshing =
    externalRefreshing !== undefined ? externalRefreshing : internalRefreshing;

  const handleRefresh = async () => {
    if (externalRefreshing === undefined) {
      setInternalRefreshing(true);
    }

    try {
      await onRefresh();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      if (externalRefreshing === undefined) {
        setInternalRefreshing(false);
      }
    }
  };

  return (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      colors={["#3b82f6"]} // Android
      tintColor="#3b82f6" // iOS
      title="Pull to refresh..." // iOS
      titleColor="#6b7280" // iOS
    />
  );
}
