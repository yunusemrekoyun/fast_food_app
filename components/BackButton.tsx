// components/BackButton.tsx
import React from "react";
import { TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { images } from "@/constants";

type Props = {
  onPress?: () => void;
  tintColor?: string;
  size?: number;
  className?: string;
};

const BackButton = ({
  onPress,
  tintColor = "#1A1A1A",
  size = 24,
  className,
}: Props) => {
  const handle = () => (onPress ? onPress() : router.back());
  return (
    <TouchableOpacity onPress={handle} className={className}>
      <Image
        source={images.arrowBack}
        style={{ width: size, height: size, tintColor }}
      />
    </TouchableOpacity>
  );
};

export default BackButton;
