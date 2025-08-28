import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { account } from "@/lib/appwrite";
import { router } from "expo-router";

const Profile = () => {
  const { isAuthenticated, user, setUser, setIsAuthenticated } = useAuthStore();

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/sign-in");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not log out.");
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Image
          source={images.avatar}
          className="w-24 h-24 mb-6"
          resizeMode="contain"
        />
        <Text className="h2-bold text-dark-100 mb-2">Welcome</Text>
        <Text className="body-regular text-gray-200 mb-8 text-center">
          Please sign in or create an account to continue.
        </Text>
        <View className="flex-row gap-4">
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl"
            onPress={() => router.push("/sign-in")}
          >
            <Text className="base-bold text-white">Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="border border-primary px-6 py-3 rounded-xl"
            onPress={() => router.push("/sign-up")}
          >
            <Text className="base-bold text-primary">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Authenticated state
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="items-center px-6 py-10"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: user?.avatar || images.avatar }}
          className="w-28 h-28 rounded-full mb-6"
        />
        <Text className="h2-bold text-dark-100">{user?.name}</Text>
        <Text className="body-regular text-gray-200">{user?.email}</Text>

        <View className="w-full mt-10 gap-4">
          <TouchableOpacity
            className="bg-primary px-6 py-4 rounded-xl"
            onPress={handleLogout}
          >
            <Text className="base-bold text-white text-center">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
