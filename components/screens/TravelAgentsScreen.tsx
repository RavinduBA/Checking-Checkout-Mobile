import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TravelAgent {
  id: string;
  agentName: string;
  agencyName: string;
  phone: string;
  email: string;
  commissionRate: number;
  status: "Active" | "Inactive";
  createdDate: string;
}

export default function TravelAgentsScreen() {
  const [agents, setAgents] = useState<TravelAgent[]>([
    {
      id: "1",
      agentName: "Ravindu Bandara Abeysinghe",
      agencyName: "wealthos",
      phone: "+941313123",
      email: "ravindubandaraha@gmail.com",
      commissionRate: 20,
      status: "Active",
      createdDate: "10/1/2025",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<TravelAgent | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    agentName: "",
    agencyName: "",
    phone: "+94",
    email: "",
    commissionRate: 0,
    status: "Active" as "Active" | "Inactive",
  });

  const resetForm = () => {
    setFormData({
      agentName: "",
      agencyName: "",
      phone: "+94",
      email: "",
      commissionRate: 0,
      status: "Active",
    });
  };

  const handleAddAgent = () => {
    if (formData.agentName.trim() && formData.agencyName.trim()) {
      const newAgent: TravelAgent = {
        id: Date.now().toString(),
        agentName: formData.agentName.trim(),
        agencyName: formData.agencyName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        commissionRate: formData.commissionRate,
        status: formData.status,
        createdDate: new Date().toLocaleDateString(),
      };
      setAgents([...agents, newAgent]);
      resetForm();
      setShowAddModal(false);
    }
  };

  const handleEditAgent = (agent: TravelAgent) => {
    setEditingAgent(agent);
    setFormData({
      agentName: agent.agentName,
      agencyName: agent.agencyName,
      phone: agent.phone,
      email: agent.email,
      commissionRate: agent.commissionRate,
      status: agent.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateAgent = () => {
    if (
      editingAgent &&
      formData.agentName.trim() &&
      formData.agencyName.trim()
    ) {
      setAgents(
        agents.map((agent) =>
          agent.id === editingAgent.id
            ? {
                ...agent,
                ...formData,
                agentName: formData.agentName.trim(),
                agencyName: formData.agencyName.trim(),
              }
            : agent
        )
      );
      setShowEditModal(false);
      setEditingAgent(null);
      resetForm();
    }
  };

  const handleDeleteAgent = (agentId: string) => {
    Alert.alert(
      "Delete Agent",
      "Are you sure you want to delete this travel agent?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setAgents(agents.filter((agent) => agent.id !== agentId)),
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
                value={formData.agentName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, agentName: text }))
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
                value={formData.agencyName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, agencyName: text }))
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

            {/* Commission Rate */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </Text>
              <TextInput
                value={formData.commissionRate.toString()}
                onChangeText={(text) => {
                  const rate = parseFloat(text) || 0;
                  setFormData((prev) => ({ ...prev, commissionRate: rate }));
                }}
                placeholder="0"
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
                    setFormData((prev) => ({ ...prev, status: "Active" }))
                  }
                  className={`flex-1 py-3 rounded-lg border ${
                    formData.status === "Active"
                      ? "bg-green-50 border-green-500"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.status === "Active"
                        ? "text-green-700"
                        : "text-gray-600"
                    }`}
                  >
                    Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, status: "Inactive" }))
                  }
                  className={`flex-1 py-3 rounded-lg border ${
                    formData.status === "Inactive"
                      ? "bg-red-50 border-red-500"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      formData.status === "Inactive"
                        ? "text-red-700"
                        : "text-gray-600"
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
              {agents.map((agent) => (
                <View
                  key={agent.id}
                  className="flex-row p-4 border-b border-gray-100"
                >
                  <Text className="w-40 text-gray-800" numberOfLines={2}>
                    {agent.agentName}
                  </Text>
                  <Text className="w-32 text-gray-800" numberOfLines={2}>
                    {agent.agencyName}
                  </Text>
                  <Text className="w-32 text-gray-800">{agent.phone}</Text>
                  <Text className="w-48 text-gray-800" numberOfLines={2}>
                    {agent.email}
                  </Text>
                  <Text className="w-24 text-gray-800">
                    {agent.commissionRate}%
                  </Text>
                  <View className="w-20">
                    <View
                      className={`px-2 py-1 rounded-full ${
                        agent.status === "Active"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium text-center ${
                          agent.status === "Active"
                            ? "text-green-800"
                            : "text-red-800"
                        }`}
                      >
                        {agent.status}
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
              ))}
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
