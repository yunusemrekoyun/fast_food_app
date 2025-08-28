import { View, Text, Alert } from "react-native";
import React, { useState } from "react";
import { Link, router } from "expo-router";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import { createUser } from "@/lib/appwrite";

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setform] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
    const { name, email, password } = form;
    if (!name || !email || !password)
      return Alert.alert("Error", "Please fill in all fields.");

    setIsSubmitting(true);

    try {
      await createUser({ name, email, password });


      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter your full name"
        value={form.name}
        onChangeText={(text) => setform((prev) => ({ ...prev, name: text }))}
        label="Full Name"
      />
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
        secureTextEntry={true}
      />
      <CustomButton title="Sign Up" isLoading={isSubmitting} onPress={submit} />
      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">
          Already have an account?
        </Text>
        <Link href="/sign-in" className="base-bold text-primary">
          Sign In
        </Link>
      </View>
    </View>
  );
};
export default SignUp;
