// app/(tabs)/profile.tsx
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

  // ----- AUTHENTICATED VIEW -----
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerClassName="px-6 py-8 pb-28"
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View className="w-full rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <View className="flex-row items-center gap-4">
            <Image
              // user?.avatar bir URL ise uri ile, yoksa local fallback
              source={
                user?.avatar ? { uri: user.avatar } : (images.avatar as any)
              }
              className="w-20 h-20 rounded-full"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="h3-bold text-dark-100" numberOfLines={1}>
                {user?.name}
              </Text>
              <Text className="body-regular text-gray-200" numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
          </View>

          {/* Quick actions */}
          <View className="mt-5 border-t border-gray-200 pt-4 gap-3">
            <TouchableOpacity
              className="flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
              onPress={() => router.push("/addresses")}
            >
              <View className="flex-row items-center gap-3">
                <Image
                  source={images.location}
                  className="w-6 h-6"
                  resizeMode="contain"
                />
                <View>
                  <Text className="base-bold text-dark-100">Addresses</Text>
                  <Text className="small-regular text-gray-200">
                    Manage your delivery addresses
                  </Text>
                </View>
              </View>
              <Image
                source={images.arrowRight}
                className="w-5 h-5 opacity-70"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger / Other */}
        <View className="w-full mt-6">
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
