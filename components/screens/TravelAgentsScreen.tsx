import AccessDenied from "@/components/AccessDenied";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePermissions } from "../../hooks/usePermissions";
import { useUserProfile } from "../../hooks/useUserProfile";
import { supabase } from "../../lib/supabase";

interface Agent {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  agency_name?: string;
  commission_rate: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
}

export default function TravelAgentsScreen() {
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { profile } = useUserProfile();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    agency_name: "",
    phone: "",
    email: "",
    notes: "",
    commission_rate: 15,
    is_active: true,
  });

  // Fetch agents from database
  useEffect(() => {
    if (!profile?.tenant_id) {
      setAgents([]);
      setLoading(false);
      return;
    }

    const fetchAgents = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("tenant_id", profile.tenant_id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        setAgents(data || []);
      } catch (err) {
        console.error("Error in fetchAgents:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [profile?.tenant_id]);

  const resetForm = () => {
    setFormData({
      name: "",
      agency_name: "",
      phone: "",
      email: "",
      notes: "",
      commission_rate: 15,
      is_active: true,
    });
  };

  const handleAddAgent = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Agent name is required");
      return;
    }

    if (!profile?.tenant_id) {
      Alert.alert("Error", "User profile not loaded. Please try again.");
      return;
    }

    try {
      // Convert undefined values to null for database compatibility
      const dataToInsert = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        agency_name: formData.agency_name.trim() || null,
        notes: formData.notes.trim() || null,
        commission_rate: formData.commission_rate,
        is_active: formData.is_active,
        tenant_id: profile.tenant_id,
      };

      const { data, error } = await supabase
        .from("agents")
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Agent created successfully:", data);
      // Update local state
      setAgents((prev) => [...prev, data]);
      setShowAddModal(false);
      resetForm();
      Alert.alert("Success", "Travel agent added successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      Alert.alert("Error", `Failed to add travel agent: ${errorMessage}`);
      console.error("Error adding travel agent:", error);
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      agency_name: agent.agency_name || "",
      phone: agent.phone || "",
      email: agent.email || "",
      notes: agent.notes || "",
      commission_rate: agent.commission_rate,
      is_active: agent.is_active,
    });
    setShowEditModal(true);
  };

  const handleUpdateAgent = async () => {
    if (!editingAgent || !formData.name.trim()) {
      Alert.alert("Error", "Agent name is required");
      return;
    }

    try {
      // Convert undefined values to null for database compatibility
      const updatesToApply = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        agency_name: formData.agency_name.trim() || null,
        notes: formData.notes.trim() || null,
        commission_rate: formData.commission_rate,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("agents")
        .update(updatesToApply)
        .eq("id", editingAgent.id)
        .eq("tenant_id", profile?.tenant_id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setAgents((prev) =>
        prev.map((agent) => (agent.id === editingAgent.id ? data : agent))
      );
      setShowEditModal(false);
      setEditingAgent(null);
      resetForm();
      Alert.alert("Success", "Travel agent updated successfully");
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error occurred";
      Alert.alert("Error", `Failed to update travel agent: ${errorMessage}`);
      console.error("Error updating travel agent:", error);
    }
  };

  const handleDeleteAgent = (agentId: string) => {
    Alert.alert(
      "Delete Travel Agent",
      "Are you sure you want to delete this travel agent?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("agents")
                .delete()
                .eq("id", agentId)
                .eq("tenant_id", profile?.tenant_id);

              if (error) {
                throw error;
              }
              // Update local state
              setAgents((prev) => prev.filter((agent) => agent.id !== agentId));
              Alert.alert("Success", "Travel agent deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete travel agent");
            }
          },
        },
      ]
    );
  };

  const renderModal = (isEdit: boolean) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      transparent
      animationType="slide"
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View className="bg-white rounded-t-3xl p-6 max-h-5/6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">
              {isEdit ? "Edit Agent" : "Add New Agent"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setEditingAgent(null);
                } else {
                  setShowAddModal(false);
                }
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 mb-6">
            Enter the details for the new agent.
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Agent Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Agent Name
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Agent's full name"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>

            {/* Agency Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Agency Name
              </Text>
              <TextInput
                value={formData.agency_name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, agency_name: text }))
                }
                placeholder="Travel agency name"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone
              </Text>
              <TextInput
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone: text }))
                }
                placeholder="+94"
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Email
              </Text>
              <TextInput
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>

            {/* Notes */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Notes
              </Text>
              <TextInput
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, notes: text }))
                }
                placeholder="Additional notes about the agent"
                multiline
                numberOfLines={3}
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {/* Commission Rate */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </Text>
              <TextInput
                value={formData.commission_rate.toString()}
                onChangeText={(text) => {
                  const rate = parseFloat(text) || 0;
                  setFormData((prev) => ({ ...prev, commission_rate: rate }));
                }}
                placeholder="15"
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg px-3 py-3 text-gray-800"
              />
            </View>

            {/* Status */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Status
              </Text>
              <View className="flex-row" style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, is_active: true }))
                  }
                  className={`flex-1 py-3 rounded-lg border ${
                    formData.is_active
                      ? "bg-green-50 border-green-500"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.is_active ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, is_active: false }))
                  }
                  className={`flex-1 py-3 rounded-lg border ${
                    !formData.is_active
                      ? "bg-red-50 border-red-500"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      !formData.is_active ? "text-red-700" : "text-gray-600"
                    }`}
                  >
                    Inactive
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  if (isEdit) {
                    setShowEditModal(false);
                    setEditingAgent(null);
                  } else {
                    setShowAddModal(false);
                  }
                  resetForm();
                }}
                className="flex-1 py-3 bg-gray-100 rounded-lg"
              >
                <Text className="text-center font-medium text-gray-700">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={isEdit ? handleUpdateAgent : handleAddAgent}
                className="flex-1 py-3 bg-blue-600 rounded-lg"
              >
                <Text className="text-center font-medium text-white">
                  {isEdit ? "Update Agent" : "Create Agent"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Permission check - AFTER all hooks are declared
  if (permissionsLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!hasPermission("access_master_files")) {
    return (
      <AccessDenied message="You don't have permission to access Travel Agents." />
    );
  }

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-600">Loading travel agents...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center p-4">
        <Text className="text-red-600 text-center mb-4">Error: {error}</Text>
        <TouchableOpacity
          onPress={() => window.location.reload()}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6 flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Travel Agents
          </Text>
          <Text className="text-gray-600">
            Manage travel agents and their commission rates
          </Text>
        </View>

        {/* Add Agent Button */}
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="bg-blue-600 rounded-lg px-4 py-3 flex-row items-center"
          style={{ gap: 8 }}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-medium">Add Agent</Text>
        </TouchableOpacity>
      </View>

      {/* Agents Table */}
      <View className="flex-1 bg-white rounded-xl">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="min-w-full">
            {/* Header */}
            <View className="flex-row bg-gray-50 p-4 border-b border-gray-200">
              <Text className="w-40 font-semibold text-gray-700">Name</Text>
              <Text className="w-32 font-semibold text-gray-700">Agency</Text>
              <Text className="w-32 font-semibold text-gray-700">Phone</Text>
              <Text className="w-48 font-semibold text-gray-700">Email</Text>
              <Text className="w-24 font-semibold text-gray-700">
                Commission %
              </Text>
              <Text className="w-20 font-semibold text-gray-700">Status</Text>
              <Text className="w-24 font-semibold text-gray-700">Actions</Text>
            </View>

            {/* Data Rows */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {agents.length === 0 ? (
                <View className="p-8 items-center">
                  <Ionicons name="people-outline" size={48} color="#9ca3af" />
                  <Text className="text-gray-500 text-center mt-4">
                    No travel agents found
                  </Text>
                  <Text className="text-gray-400 text-center mt-2">
                    Add your first travel agent to get started
                  </Text>
                </View>
              ) : (
                agents.map((agent) => (
                  <View
                    key={agent.id}
                    className="flex-row p-4 border-b border-gray-100"
                  >
                    <Text className="w-40 text-gray-800" numberOfLines={2}>
                      {agent.name}
                    </Text>
                    <Text className="w-32 text-gray-800" numberOfLines={2}>
                      {agent.agency_name || "N/A"}
                    </Text>
                    <Text className="w-32 text-gray-800">
                      {agent.phone || "N/A"}
                    </Text>
                    <Text className="w-48 text-gray-800" numberOfLines={2}>
                      {agent.email || "N/A"}
                    </Text>
                    <Text className="w-24 text-gray-800">
                      {agent.commission_rate}%
                    </Text>
                    <View className="w-20">
                      <View
                        className={`px-2 py-1 rounded-full ${
                          agent.is_active ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium text-center ${
                            agent.is_active ? "text-green-800" : "text-red-800"
                          }`}
                        >
                          {agent.is_active ? "Active" : "Inactive"}
                        </Text>
                      </View>
                    </View>
                    <View className="w-24 flex-row" style={{ gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleEditAgent(agent)}
                        className="bg-blue-100 p-2 rounded"
                      >
                        <Ionicons name="pencil" size={14} color="#1d4ed8" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteAgent(agent.id)}
                        className="bg-red-100 p-2 rounded"
                      >
                        <Ionicons name="trash" size={14} color="#dc2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </ScrollView>

        {agents.length === 0 && (
          <View className="flex-1 justify-center items-center p-8">
            <Ionicons name="business-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg font-medium mt-4">
              No Travel Agents
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Add your first travel agent to get started
            </Text>
          </View>
        )}
      </View>

      {/* Modals */}
      {renderModal(false)}
      {renderModal(true)}
    </View>
  );
}
