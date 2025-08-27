import { Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";

const _layout = () => {
  return (
    <SafeAreaView>
      <Text>_layout</Text>
      <Slot />
    </SafeAreaView>
  );
};

export default _layout;
