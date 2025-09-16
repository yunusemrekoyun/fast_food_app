// app/addresses/_layout.tsx
import { Stack } from "expo-router";

export default function AddressesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Ekranların içinde kendi header’ımız var
        animation: "slide_from_right",
      }}
    />
  );
}
