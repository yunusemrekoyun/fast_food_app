import { Text, TouchableOpacity, Platform, View } from "react-native";
import { MenuItem } from "@/type";
import { useCartStore } from "@/store/cart.store";
import { Image } from "expo-image";
import { useMemo, useState } from "react";

function toThumb(url: string) {
  try {
    if (url.includes("/view")) {
      const [base, query = ""] = url.split("?");
      const qs = query ? `&${query}` : "";
      return `${base.replace("/view", "/preview")}?width=256&height=256&quality=70&gravity=center${qs}`;
    }
    return url;
  } catch {
    return url;
  }
}

type Props = {
  item: MenuItem;
  onPress?: () => void;
};

const MenuCard = ({
  item: { $id, image_url, name, price },
  onPress,
}: Props) => {
  const { addItem } = useCartStore();
  const initialThumb = useMemo(() => toThumb(image_url), [image_url]);
  const [imgUri, setImgUri] = useState<string>(initialThumb);
  const [triedFallback, setTriedFallback] = useState(false);

  return (
    <TouchableOpacity
      className="menu-card"
      style={
        Platform.OS === "android"
          ? { elevation: 10, shadowColor: "#878787" }
          : {}
      }
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View className="absolute -top-10 self-center">
        <Image
          source={{ uri: imgUri }}
          style={{ width: 128, height: 128 }}
          contentFit="contain"
          transition={150}
          cachePolicy="memory-disk"
          priority="high"
          onError={() => {
            if (!triedFallback) {
              setTriedFallback(true);
              setImgUri(image_url);
            }
          }}
        />
      </View>

      <Text
        className="text-center base-bold text-dark-100 mb-2 mt-20"
        numberOfLines={1}
      >
        {name}
      </Text>

      <Text className="body-regular text-gray-200 mb-4">From ${price}</Text>

      <TouchableOpacity
        onPress={() =>
          addItem({
            id: $id,
            name,
            price,
            image_url: image_url,
            customizations: [],
          })
        }
        activeOpacity={0.8}
      >
        <Text className="paragraph-bold text-primary">Add to Cart +</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default MenuCard;
