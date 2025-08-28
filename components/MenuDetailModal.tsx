import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";
import { MenuItem } from "@/type";
import { useCartStore } from "@/store/cart.store";

type Props = {
  visible: boolean;
  item: (MenuItem & { description?: string }) | null;
  onClose: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { height } = Dimensions.get("window");

const MenuDetailModal: React.FC<Props> = ({ visible, item, onClose }) => {
  const { addItem } = useCartStore();

  // anim değerleri
  const backdrop = useSharedValue(0); // 0→1
  const card = useSharedValue(0); // 0→1
  const dragY = useSharedValue(0); // pan close

  // mount/unmount anim
  useEffect(() => {
    if (visible) {
      backdrop.value = withTiming(1, { duration: 160 });
      card.value = withSpring(1, { damping: 16, stiffness: 160 });
    } else {
      card.value = withTiming(0, { duration: 120 });
      backdrop.value = withTiming(0, { duration: 160 });
      dragY.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // backdrop anim stili
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backdrop.value, [0, 1], [0, 1], Extrapolate.CLAMP),
  }));

  // kart anim stili (fade + scale, hafif yukarı)
  const cardStyle = useAnimatedStyle(() => {
    const s = interpolate(card.value, [0, 1], [0.96, 1]);
    const ty =
      interpolate(card.value, [0, 1], [10, 0]) + // girişte 10px aşağıdan
      dragY.value; // sürükleme
    return {
      transform: [{ translateY: ty }, { scale: s }],
      opacity: card.value,
    };
  });

  // aşağı çekince kapat
  const onGestureEvent = (dy: number) => {
    dragY.value = Math.max(0, dy);
  };
  const onGestureEnd = () => {
    // 80px’ten fazla çekildiyse kapat
    if (dragY.value > 80) {
      runOnJS(onClose)();
    } else {
      dragY.value = withSpring(0, { damping: 16, stiffness: 200 });
    }
  };

  const handleAdd = () => {
    if (!item) return;
    addItem({
      id: item.$id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      customizations: [],
    });
    onClose();
  };

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle={
        Platform.OS === "ios" ? "overFullScreen" : "fullScreen"
      }
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* StatusBar kontrastını düzeltelim */}
      <StatusBar barStyle="light-content" />

      {/* BLUR + karartma */}
      <Animated.View
        style={[{ position: "absolute", inset: 0 }, backdropStyle]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose}>
          <BlurView intensity={40} tint="dark" style={{ flex: 1 }} />
        </Pressable>
      </Animated.View>

      {/* Orta Kart */}
      <View
        pointerEvents="box-none"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Animated.View
          style={[
            {
              width: "100%",
              maxWidth: 520,
              borderRadius: 24,
              backgroundColor: "white",
              padding: 16,
              shadowColor: "#000",
              shadowRadius: 20,
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 10 },
              elevation: 12,
            },
            cardStyle,
          ]}
        >
          {/* “drag handle” */}
          <View style={{ alignItems: "center", marginTop: 4 }}>
            <View
              style={{
                width: 48,
                height: 5,
                borderRadius: 999,
                backgroundColor: "#E6E6E8",
              }}
              // basılı tutup hafif çekme hissi (basit bir onMove)
              onStartShouldSetResponder={() => true}
              onResponderMove={(e) =>
                onGestureEvent(e.nativeEvent.locationY - 12 /* ~kaba offset */)
              }
              onResponderRelease={onGestureEnd}
            />
          </View>

          {/* görsel */}
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <Image
              source={{ uri: item.image_url }}
              style={{ width: 200, height: 200 }}
              contentFit="contain"
              transition={150}
              cachePolicy="memory-disk"
            />
          </View>

          {/* başlık + fiyat */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#131416",
              marginTop: 6,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#5D5F6D",
              marginTop: 2,
            }}
          >
            ${item.price.toFixed(2)}
          </Text>

          {/* açıklama (varsa) */}
          {item.description ? (
            <Text
              style={{
                marginTop: 10,
                fontSize: 14,
                lineHeight: 20,
                color: "#6B7280",
              }}
              numberOfLines={5}
            >
              {item.description}
            </Text>
          ) : null}

          {/* butonlar */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "#F2F2F3",
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
              }}
              android_ripple={{ color: "#e7e7ea" }}
            >
              <Text style={{ fontWeight: "700", color: "#131416" }}>Close</Text>
            </Pressable>

            <Pressable
              onPress={handleAdd}
              style={{
                flex: 1,
                backgroundColor: "#FE8C00",
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
              }}
              android_ripple={{ color: "#ffb869" }}
            >
              <Text style={{ fontWeight: "700", color: "white" }}>
                Add to Cart
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default MenuDetailModal;
