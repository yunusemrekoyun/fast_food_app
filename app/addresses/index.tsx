// app/addresses/index.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import CustomButton from "@/components/CustomButton";
import BackButton from "@/components/BackButton";
import useAppwrite from "@/lib/useAppwrite";
import {
  listMyAddresses,
  setDefaultAddress,
  deleteAddress,
} from "@/lib/appwrite";
import { Address } from "@/type";
import { images } from "@/constants";

export default function AddressesScreen() {
  const { data, loading, refetch } = useAppwrite<
    Address[],
    Record<string, never>
  >({
    fn: listMyAddresses,
    params: {} as Record<string, never>,
  });
  // <<< titremeyi çözer
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [])
  );

  const onMakeDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      refetch();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not set default address.");
    }
  };

  const onDelete = async (id: string) => {
    Alert.alert("Delete address", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAddress(id);
            refetch();
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Could not delete address.");
          }
        },
      },
    ]);
  };

  const empty = !loading && (!data || data.length === 0);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-5 pb-3 flex-row items-center justify-between">
        <BackButton />
        <Text className="h3-bold text-dark-100">My Addresses</Text>
        <TouchableOpacity onPress={() => router.push("/addresses/new")}>
          <Text className="base-bold text-primary">Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : empty ? (
        <View className="flex-1 items-center justify-center px-8">
          <Image
            source={images.emptyState}
            className="w-40 h-40 mb-5 opacity-80"
          />
          <Text className="h3-bold text-dark-100 mb-2 text-center">
            No addresses yet
          </Text>
          <Text className="body-regular text-gray-200 mb-5 text-center">
            Add your first delivery address to check out faster.
          </Text>
          <CustomButton
            title="Add Address"
            onPress={() => router.push("/addresses/new")}
          />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(a) => a.$id}
          contentContainerClassName="px-5 pb-20 gap-3"
          renderItem={({ item }) => (
            <View className="border border-gray-200 rounded-2xl p-4 bg-white">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="base-bold text-dark-100">{item.label}</Text>
                {item.isDefault ? (
                  <Text className="small-bold text-primary">Default</Text>
                ) : (
                  <TouchableOpacity onPress={() => onMakeDefault(item.$id)}>
                    <Text className="small-bold text-primary">
                      Make default
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text className="body-regular text-dark-100">
                {item.fullName} • {item.phone}
              </Text>
              <Text className="body-regular text-gray-200">
                {item.line1}
                {!!item.line2 && `, ${item.line2}`}
              </Text>
              <Text className="body-regular text-gray-200">
                {item.city}
                {!!item.state && `, ${item.state}`} {item.postalCode}
              </Text>
              <Text className="body-regular text-gray-200">{item.country}</Text>

              <View className="flex-row justify-end mt-3 gap-4">
                <TouchableOpacity onPress={() => onDelete(item.$id)}>
                  <Text className="small-bold text-red-500">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View className="mt-4">
              <CustomButton
                title="Add Address"
                onPress={() => router.push("/addresses/new")}
              />
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
