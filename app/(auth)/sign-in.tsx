// app/(auth)/sign-in.tsx
import { View, Text, Alert } from "react-native";
import React, { useState } from "react";
import { Link, router } from "expo-router";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import { signIn } from "@/lib/appwrite";
import * as Sentry from "@sentry/react-native";
import useAuthStore from "@/store/auth.store";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setform] = useState({ email: "", password: "" });
  const { fetchAuthenticatedUser } = useAuthStore();

  const submit = async () => {
    const { email, password } = form;
    if (!email || !password)
      return Alert.alert("Error", "Please fill in all fields.");

    setIsSubmitting(true);
    try {
      await signIn({ email, password });

      // Oturum açıldıktan hemen sonra global auth state'i tazele
      await fetchAuthenticatedUser();

      // Artık Tabs'e gönderebiliriz
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong.");
      Sentry.captureException(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter your e-mail"
        value={form.email}
        onChangeText={(text) => setform((prev) => ({ ...prev, email: text }))}
        label="E-mail"
        keyboardType="email-address"
      />
      <CustomInput
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(text) =>
          setform((prev) => ({ ...prev, password: text }))
        }
        label="Password"
        secureTextEntry
      />
      <CustomButton title="Sign In" isLoading={isSubmitting} onPress={submit} />
      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">
          Don&apos;t have an account?
        </Text>
        <Link href="/sign-up" className="base-bold text-primary">
          Sign Up
        </Link>
      </View>
    </View>
  );
};

export default SignIn;
