import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useReservationsData } from "../../hooks/useReservationsData";
import { useToast } from "../../hooks/useToast";
import { supabase } from "../../lib/supabase";
import { 
  NewReservationDialog,
  ViewReservationDialog,
  EditReservationDialog,
  PaymentDialog,
} from "../modals";
import { CompactReservationDialog } from "../reservation/CompactReservationDialog";
import { ReservationsFilters } from "../reservation/ReservationsFilters";
import { ReservationsHeader } from "../reservation/ReservationsHeader";
import { Reservation, ReservationsList } from "../reservation/ReservationsList";

export default function ReservationsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [paymentDialogVisible, setPaymentDialogVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [isNewReservationDialogOpen, setIsNewReservationDialogOpen] =
    useState(false);
  const [isCompactReservationDialogOpen, setIsCompactReservationDialogOpen] =
    useState(false);

  // Use real data from hooks
  const { reservations, loading, error, refetch } = useReservationsData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("reservations");
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "LKR">(
    "USD"
  );

  // Transform reservation data to match component interface
  const transformedReservations: Reservation[] = reservations.map((res) => ({
    id: res.id,
    guestName: res.guest_name,
    roomNumber: res.rooms?.room_number || "N/A",
    status: res.status,
    checkIn: res.check_in_date,
    checkOut: res.check_out_date,
  }));

  // Filter logic
  const filteredReservations = transformedReservations.filter((r) => {
    const matchesSearch = r.guestName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle data updates
  const handleDataUpdate = () => {
    refetch();
    toast({
      title: "Success",
      description: "Reservations updated successfully",
      variant: "default",
    });
  };

  // New reservation creation logic
  const handleCreateReservation = async (reservationData: any) => {
    try {
      const { error } = await supabase
        .from("reservations")
        .insert([reservationData]);
      if (error) throw error;
      toast({
        title: "Reservation Created",
        description: "New reservation has been created.",
        variant: "default",
      });
      refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create reservation.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
        <Text className="mt-2 text-gray-600">Loading reservations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-red-600 text-center px-4">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ReservationsHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <ReservationsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedCurrency={selectedCurrency}
        setSelectedCurrency={setSelectedCurrency}
        onNewReservation={() => setIsNewReservationDialogOpen(true)}
        onNewCompactReservation={() => setIsCompactReservationDialogOpen(true)}
      />
      <ReservationsList
        reservations={filteredReservations}
        onView={(id) => {
          const res = filteredReservations.find((r) => r.id === id) || null;
          setSelectedReservation(res);
          setViewDialogVisible(true);
        }}
        onEdit={(reservation) => {
          setSelectedReservation(reservation);
          setEditDialogVisible(true);
        }}
        onPayment={(reservation) => {
          setSelectedReservation(reservation);
          setPaymentDialogVisible(true);
        }}
      />
      <ViewReservationDialog
        visible={viewDialogVisible}
        reservation={selectedReservation}
        onClose={() => {
          setViewDialogVisible(false);
          setSelectedReservation(null);
        }}
      />
      <EditReservationDialog
        visible={editDialogVisible}
        reservation={selectedReservation}
        onClose={() => {
          setEditDialogVisible(false);
          setSelectedReservation(null);
        }}
        onSuccess={handleDataUpdate}
      />
      <PaymentDialog
        visible={paymentDialogVisible}
        reservation={selectedReservation}
        onClose={() => {
          setPaymentDialogVisible(false);
          setSelectedReservation(null);
        }}
        onSuccess={handleDataUpdate}
      />
      {/* Compact Reservation Dialog */}
      <CompactReservationDialog
        isOpen={isCompactReservationDialogOpen}
        onClose={() => setIsCompactReservationDialogOpen(false)}
        onSave={async (reservationData) => {
          await handleCreateReservation(reservationData);
          setIsCompactReservationDialogOpen(false);
        }}
      />
      {/* Full-featured NewReservationDialog for advanced reservation creation */}
      <NewReservationDialog
        isOpen={isNewReservationDialogOpen}
        onClose={() => setIsNewReservationDialogOpen(false)}
        onReservationCreated={() => {
          setIsNewReservationDialogOpen(false);
          handleDataUpdate();
        }}
      />
    </View>
  );
}
