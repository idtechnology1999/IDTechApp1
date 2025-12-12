import { Ionicons } from "@expo/vector-icons";
import { Tabs, Slot } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Linking, Platform, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;

  // Pulse animation for WhatsApp button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Open WhatsApp chat
  const openWhatsApp = () => {
    const phone = "2347086292944";
    Linking.openURL(`https://wa.me/${phone}`);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#1A73E8",
          tabBarInactiveTintColor: "#999",
          tabBarShowLabel: true,
          tabBarStyle: {
            position: "absolute",
            bottom: (Platform.OS === "ios" ? 25 : 20) + insets.bottom,
            left: 20,
            right: 20,
            height: 60,
            borderRadius: 25,
            backgroundColor: "#fff",
            paddingBottom: 4,
            paddingTop: 5,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: "Courses",
            tabBarIcon: ({ color }) => <Ionicons name="book-outline" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="certificate"
          options={{
            title: "Certificate",
            tabBarIcon: ({ color }) => <Ionicons name="ribbon-outline" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="payments"
          options={{
            title: "Payments",
            tabBarIcon: ({ color }) => <Ionicons name="card-outline" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={24} color={color} />,
          }}
        />
      </Tabs>

      {/* Floating WhatsApp Button */}
      <Animated.View style={[styles.whatsappContainer, { transform: [{ scale }] }]}>
        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <Ionicons name="logo-whatsapp" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* <Slot />  */}
    </>
  );
}

const styles = StyleSheet.create({
  whatsappContainer: {
    position: "absolute",
    bottom: 110,
    right: 25,
    zIndex: 999,
  },
  whatsappButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#25D366",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
});
