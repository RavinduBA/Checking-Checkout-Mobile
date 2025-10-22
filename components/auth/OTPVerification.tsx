import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

interface OTPVerificationProps {
  onVerified: () => void;
  phoneNumber?: string;
  locationId?: string;
  triggerComponent: React.ReactNode;
}

export const OTPVerification = ({
  onVerified,
  phoneNumber,
  locationId,
  triggerComponent,
}: OTPVerificationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const sendOTP = async () => {
    setIsSending(true);
    try {
      // Generate OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000);

      // Call Supabase Edge Function to send SMS
      const { data, error } = await supabase.functions.invoke(
        "send-sms-notification",
        {
          body: {
            phoneNumber,
            locationId,
            message: `Your OTP for reservation editing is: ${otpCode}. This code expires in 5 minutes.`,
            type: "otp_verification",
          },
        }
      );

      if (error) throw error;

      setOtpSent(true);
      Alert.alert("OTP Sent", `Verification code sent to ${phoneNumber}`);
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsSending(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      // TODO: Implement actual OTP verification with SMS service
      // For now, accepting any valid 6-digit code
      if (otp.length === 6) {
        onVerified();
        setIsOpen(false);
        setOtp("");
        setOtpSent(false);
        Alert.alert(
          "Verified",
          "OTP verified successfully. You can now edit the reservation."
        );
      } else {
        throw new Error("Invalid OTP");
      }
    } catch (error: any) {
      Alert.alert("Verification Failed", "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setOtp("");
    setOtpSent(false);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setIsOpen(true)}>
        {triggerComponent}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        animationType="fade"
        transparent
        onRequestClose={handleClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg w-11/12 max-w-md p-6">
            {/* Header */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#374151"
                />
                <Text className="text-lg font-semibold text-gray-900 ml-2">
                  OTP Verification Required
                </Text>
              </View>
              <Text className="text-sm text-gray-500">
                Verify your identity to edit this reservation
              </Text>
            </View>

            {/* Content */}
            <View className="bg-gray-50 rounded-lg p-4 mb-4">
              <Text className="text-xs text-gray-600 text-center mb-4">
                To edit this reservation, we need to verify your identity.
                {"\n"}
                An OTP will be sent to:{" "}
                <Text className="font-medium">{phoneNumber}</Text>
              </Text>

              {!otpSent ? (
                <TouchableOpacity
                  onPress={sendOTP}
                  disabled={isSending}
                  className={`flex-row items-center justify-center bg-blue-600 rounded-md py-3 px-4 ${
                    isSending ? "opacity-50" : ""
                  }`}
                >
                  {isSending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="send-outline" size={16} color="white" />
                      <Text className="text-white font-medium ml-2">
                        Send OTP
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <View>
                  <View className="flex-row items-center justify-center mb-4">
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#10B981"
                    />
                    <Text className="text-sm text-green-600 ml-1">
                      OTP sent successfully!
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Enter 6-digit OTP
                    </Text>
                    <TextInput
                      value={otp}
                      onChangeText={(text) =>
                        setOtp(text.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="000000"
                      keyboardType="number-pad"
                      maxLength={6}
                      className="text-center text-lg tracking-widest border border-gray-300 rounded-md py-3 px-4 bg-white"
                    />
                  </View>

                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => setOtpSent(false)}
                      className="flex-1 border border-gray-300 rounded-md py-3 px-4 bg-white"
                    >
                      <Text className="text-center text-gray-700 font-medium">
                        Resend OTP
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={verifyOTP}
                      disabled={isVerifying || otp.length !== 6}
                      className={`flex-1 bg-blue-600 rounded-md py-3 px-4 ${
                        isVerifying || otp.length !== 6 ? "opacity-50" : ""
                      }`}
                    >
                      <Text className="text-center text-white font-medium">
                        {isVerifying ? "Verifying..." : "Verify"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={handleClose}
              className="border border-gray-300 rounded-md py-2 px-4 bg-white"
            >
              <Text className="text-center text-gray-700">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
