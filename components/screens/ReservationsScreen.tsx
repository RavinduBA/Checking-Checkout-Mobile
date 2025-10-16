import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAccountData } from "../../hooks/useAccountData";
import { useReservationFinancials } from "../../hooks/useReservationFinancials";
import { useReservationsData } from "../../hooks/useReservationsData";
import { useTenant } from "../../hooks/useTenant";
import { useToast } from "../../hooks/useToast";
import { Database } from "../../integrations/supabase/types";
import { supabase } from "../../lib/supabase";
import {
  EditReservationDialog,
  NewReservationDialog,
  PaymentDialog,
  ViewReservationDialog,
} from "../modals";
import { CompactReservationDialog } from "../reservation/CompactReservationDialog";
import { ReservationsFilters } from "../reservation/ReservationsFilters";
import { ReservationsHeader } from "../reservation/ReservationsHeader";
import { Reservation, ReservationsList } from "../reservation/ReservationsList";

type CurrencyType = Database["public"]["Enums"]["currency_type"];
// TODO: Create mobile versions of these components
// import { PaymentsTable } from "../reservation/PaymentsTable";
// import { OTPVerification } from "../auth/OTPVerification";
// import { AddIncomeDialog } from "../reservation/AddIncomeDialog";

export default function ReservationsScreen() {
  const { refetch } = useReservationsData();
  const { refetch: refetchFinancials } = useReservationFinancials();
  const { tenant } = useTenant();
  const { toast } = useToast();

  // State management
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>("USD");
  const [accounts, setAccounts] = useState<any[]>([]);

  // Dialog states
  const [activeTab, setActiveTab] = useState("reservations");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewReservationDialogOpen, setIsNewReservationDialogOpen] =
    useState(false);
  const [isCompactReservationDialogOpen, setIsCompactReservationDialogOpen] =
    useState(false);

  // View dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingReservationId, setViewingReservationId] = useState<
    string | null
  >(null);

  // Edit dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<any>(null);

  // Payment dialog states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    reservationId: string;
    amount: number;
    currency: string;
  } | null>(null);

  // Income dialog states
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);

  // OTP verification states (for future implementation)
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showEditOTPVerification, setShowEditOTPVerification] = useState(false);
  const [otpData, setOtpData] = useState<{
    phoneNumber: string;
    reservationId: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [editOtpData, setEditOtpData] = useState<{
    phoneNumber: string;
    reservation: any;
  } | null>(null);

  // Use real data from hooks
  const { reservations, loading, error } = useReservationsData();
  const { fetchAccountDetails } = useAccountData(selectedCurrency);

  // Load account details when currency changes
  useEffect(() => {
    async function loadAccountDetails() {
      const result = await fetchAccountDetails();
      if (result) {
        setAccounts(result.accounts);
      }
    }
    loadAccountDetails();
  }, [fetchAccountDetails]);

  // Event handlers matching web app functionality
  const handleViewReservation = (id: string) => {
    setViewingReservationId(id);
    setIsViewDialogOpen(true);
  };

  const handleEditReservation = (reservation: any) => {
    // Check if guest has phone number for OTP verification (future feature)
    if (reservation.guest_phone) {
      // For now, skip OTP and go directly to edit
      setEditingReservation(reservation);
      setIsEditDialogOpen(true);
    } else {
      setEditingReservation(reservation);
      setIsEditDialogOpen(true);
    }
  };

  const handlePayment = (
    reservationId: string,
    amount: number,
    currency: string
  ) => {
    setPaymentData({ reservationId, amount, currency });
    setIsPaymentDialogOpen(true);
  };

  // TODO: Implement OTP verified

  const handleAddIncome = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsIncomeDialogOpen(true);
  };

  // TODO: Implement mobile print functionality
  const handlePrint = (reservation: any) => {
    toast({
      title: "Print Feature",
      description: "Print functionality will be implemented in a future update",
      variant: "default",
    });
  };

  // Success handlers
  const handleIncomeSuccess = () => {
    refetch();
    refetchFinancials();
    setIsIncomeDialogOpen(false);
    setSelectedReservation(null);
  };

  const handlePaymentSuccess = () => {
    refetch();
    refetchFinancials();
    setIsPaymentDialogOpen(false);
    setPaymentData(null);
  };

  const handleDataUpdate = () => {
    refetch();
    refetchFinancials();
  };

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

  // Remove this - using the new handleDataUpdate function below

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
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={setSelectedCurrency}
        onNewReservation={() => setIsNewReservationDialogOpen(true)}
        onNewCompactReservation={() => setIsCompactReservationDialogOpen(true)}
      />
      <ReservationsList
        reservations={filteredReservations}
        onView={handleViewReservation}
        onEdit={handleEditReservation}
        onPayment={(reservation) => {
          // Find the full reservation data for payment calculation
          const fullReservation = reservations.find(
            (r) => r.id === reservation.id
          );
          if (fullReservation) {
            const balance =
              (fullReservation.total_amount || 0) -
              (fullReservation.paid_amount || 0);
            handlePayment(
              reservation.id,
              balance,
              fullReservation.currency || "USD"
            );
          }
        }}
      />
      <ViewReservationDialog
        visible={isViewDialogOpen}
        reservation={
          viewingReservationId
            ? filteredReservations.find((r) => r.id === viewingReservationId)
            : null
        }
        onClose={() => {
          setIsViewDialogOpen(false);
          setViewingReservationId(null);
        }}
      />
      <EditReservationDialog
        visible={isEditDialogOpen}
        reservation={editingReservation}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingReservation(null);
        }}
        onSuccess={() => {
          handleDataUpdate();
          setIsEditDialogOpen(false);
          setEditingReservation(null);
        }}
      />
      {paymentData && (
        <PaymentDialog
          visible={isPaymentDialogOpen}
          reservation={filteredReservations.find(
            (r) => r.id === paymentData.reservationId
          )}
          onClose={() => {
            setIsPaymentDialogOpen(false);
            setPaymentData(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
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
