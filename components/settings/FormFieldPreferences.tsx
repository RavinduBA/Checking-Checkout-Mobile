import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFormFieldPreferences } from '../../hooks/useFormFieldPreferences';

export default function FormFieldPreferences() {
  const {
    preferences: formPreferences,
    updatePreferences: updateFormPreferences,
    loading: formPreferencesLoading,
  } = useFormFieldPreferences();

  if (formPreferencesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  const PreferenceItem = ({ 
    id, 
    label, 
    value, 
    onValueChange 
  }: {
    id: string;
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.preferenceItem}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e1e5e9', true: '#007AFF' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Reservation Form Field Preferences</Text>
        <Text style={styles.subtitle}>
          Select which fields to show in the reservation form. Disabled fields will be hidden from the form.
        </Text>
      </View>

      <View style={styles.content}>
        {/* Guest Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Information</Text>
          <View style={styles.sectionContent}>
            <PreferenceItem
              id="show_guest_email"
              label="Guest Email"
              value={formPreferences?.show_guest_email ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_email: value })
              }
            />
            <PreferenceItem
              id="show_guest_phone"
              label="Guest Phone"
              value={formPreferences?.show_guest_phone ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_phone: value })
              }
            />
            <PreferenceItem
              id="show_guest_address"
              label="Guest Address"
              value={formPreferences?.show_guest_address ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_address: value })
              }
            />
            <PreferenceItem
              id="show_guest_nationality"
              label="Guest Nationality"
              value={formPreferences?.show_guest_nationality ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_nationality: value })
              }
            />
            <PreferenceItem
              id="show_guest_passport_number"
              label="Passport Number"
              value={formPreferences?.show_guest_passport_number ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_passport_number: value })
              }
            />
            <PreferenceItem
              id="show_guest_id_number"
              label="ID Number"
              value={formPreferences?.show_guest_id_number ?? false}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_id_number: value })
              }
            />
          </View>
        </View>

        {/* Booking Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.sectionContent}>
            <PreferenceItem
              id="show_adults"
              label="Number of Adults"
              value={formPreferences?.show_adults ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_adults: value })
              }
            />
            <PreferenceItem
              id="show_children"
              label="Number of Children"
              value={formPreferences?.show_children ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_children: value })
              }
            />
            <PreferenceItem
              id="show_arrival_time"
              label="Arrival Time"
              value={formPreferences?.show_arrival_time ?? false}
              onValueChange={(value) =>
                updateFormPreferences({ show_arrival_time: value })
              }
            />
            <PreferenceItem
              id="show_special_requests"
              label="Special Requests"
              value={formPreferences?.show_special_requests ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_special_requests: value })
              }
            />
          </View>
        </View>

        {/* Financial & Commission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial & Commission</Text>
          <View style={styles.sectionContent}>
            <PreferenceItem
              id="show_advance_amount"
              label="Advance Amount"
              value={formPreferences?.show_advance_amount ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_advance_amount: value })
              }
            />
            <PreferenceItem
              id="show_paid_amount"
              label="Paid Amount"
              value={formPreferences?.show_paid_amount ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_paid_amount: value })
              }
            />
            <PreferenceItem
              id="show_guide"
              label="Guide Selection"
              value={formPreferences?.show_guide ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_guide: value })
              }
            />
            <PreferenceItem
              id="show_agent"
              label="Agent Selection"
              value={formPreferences?.show_agent ?? true}
              onValueChange={(value) =>
                updateFormPreferences({ show_agent: value })
              }
            />
            <PreferenceItem
              id="show_booking_source"
              label="Booking Source"
              value={formPreferences?.show_booking_source ?? false}
              onValueChange={(value) =>
                updateFormPreferences({ show_booking_source: value })
              }
            />
            <PreferenceItem
              id="show_id_photos"
              label="ID Photo Upload"
              value={formPreferences?.show_id_photos ?? false}
              onValueChange={(value) =>
                updateFormPreferences({ show_id_photos: value })
              }
            />
            <PreferenceItem
              id="show_guest_signature"
              label="Guest Signature"
              value={formPreferences?.show_guest_signature ?? false}
              onValueChange={(value) =>
                updateFormPreferences({ show_guest_signature: value })
              }
            />
          </View>
        </View>

        {/* Note Section */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>Note:</Text>
          <Text style={styles.noteText}>
            Required fields like Guest Name, Room, Check-in/Check-out dates, and Room Rate are always 
            visible and cannot be hidden.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  sectionContent: {
    padding: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceLabel: {
    fontSize: 15,
    color: '#1a1a1a',
    flex: 1,
  },
  noteContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 18,
  },
});
