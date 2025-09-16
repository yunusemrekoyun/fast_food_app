// app/addresses/new.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import BackButton from "@/components/BackButton";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import { createAddress } from "@/lib/appwrite";

export default function NewAddressScreen() {
  const [form, setForm] = useState({
    label: "",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Türkiye",
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((s) => ({ ...s, [key]: v }));

  const submit = async () => {
    if (
      !form.label ||
      !form.fullName ||
      !form.phone ||
      !form.line1 ||
      !form.city
    ) {
      return Alert.alert("Error", "Please fill the required fields.");
    }
    try {
      setLoading(true);
      await createAddress(form);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <BackButton />
        <Text className="h3-bold text-dark-100">Add Address</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerClassName="px-5 pb-28 gap-4"
          keyboardShouldPersistTaps="handled"
        >
          <View className="border border-gray-200 rounded-2xl p-4 bg-white gap-3">
            <CustomInput
              label="Label*"
              value={form.label}
              onChangeText={set("label")}
            />
            <CustomInput
              label="Full name*"
              value={form.fullName}
              onChangeText={set("fullName")}
            />
            <CustomInput
              label="Phone*"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={set("phone")}
            />
            <CustomInput
              label="Address line 1*"
              value={form.line1}
              onChangeText={set("line1")}
            />
            <CustomInput
              label="Address line 2"
              value={form.line2}
              onChangeText={set("line2")}
            />
            <CustomInput
              label="City*"
              value={form.city}
              onChangeText={set("city")}
            />
            <CustomInput
              label="State"
              value={form.state}
              onChangeText={set("state")}
            />
            <CustomInput
              label="Postal code"
              keyboardType="numeric"
              value={form.postalCode}
              onChangeText={set("postalCode")}
            />
            <CustomInput
              label="Country"
              value={form.country}
              onChangeText={set("country")}
            />

            <View className="flex-row items-center justify-between mt-2">
              <Text className="base-bold text-dark-100">Set as default</Text>
              <Switch
                value={form.isDefault}
                onValueChange={(v) => setForm((s) => ({ ...s, isDefault: v }))}
              />
            </View>
          </View>
        </ScrollView>

        {/* Sticky Footer CTA */}
        <View className="absolute left-0 right-0 bottom-0 p-5 bg-white border-t border-gray-200">
          <CustomButton
            title="Save Address"
            isLoading={loading}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
