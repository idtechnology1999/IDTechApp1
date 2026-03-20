import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
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
        Animated.timing(scale, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [scale]);

  // Open WhatsApp chat
  const openWhatsApp = () => {
    const phone = "2347086292944";
    const url = Platform.OS === "ios" 
      ? `whatsapp://send?phone=${phone}` 
      : `https://wa.me/${phone}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://wa.me/${phone}`);
        }
      })
      .catch(() => Linking.openURL(`https://wa.me/${phone}`));
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#FF6A00",
          tabBarInactiveTintColor: "#999",
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
          tabBarStyle: {
            position: "absolute",
            bottom: Platform.OS === "ios" ? 25 + insets.bottom : insets.bottom > 0 ? insets.bottom + 10 : 30,
            left: 20,
            right: 20,
            height: 65,
            borderRadius: 25,
            backgroundColor: "#fff",
            paddingBottom: 8,
            paddingTop: 8,
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            borderWidth: 1,
            borderColor: "#f0f0f0",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: "Courses",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "book" : "book-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="certificate"
          options={{
            title: "Certificate",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "ribbon" : "ribbon-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="payments"
          options={{
            title: "Payments",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "card" : "card-outline"} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? "person-circle" : "person-circle-outline"} 
                size={26} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>

      {/* Floating WhatsApp Button */}
      <Animated.View 
        style={[
          styles.whatsappContainer, 
          { 
            bottom: Platform.OS === "ios" 
              ? 105 + insets.bottom 
              : insets.bottom > 0 ? insets.bottom + 90 : 110,
            transform: [{ scale }] 
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.whatsappButton} 
          onPress={openWhatsApp}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-whatsapp" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  whatsappContainer: {
    position: "absolute",
    right: 25,
    zIndex: 999,
  },
  whatsappButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#25D366",
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});