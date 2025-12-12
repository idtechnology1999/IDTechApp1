import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import LottieView from "lottie-react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Onboard2() {
  const router = useRouter();

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current; // start 50px below

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim,slideAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.animationContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Lottie Animation */}
        <LottieView
          source={require("../assets/animations/handshake.json")}
          autoPlay
          loop
          style={styles.animation}
        />

        {/* Title */}
        <Text style={styles.title}>Track Your Activities</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Keep track of your learning progress, completed courses, and achievements.
          Stay motivated and see how far you’ve come!
        </Text>
      </Animated.View>

      {/* Pagination Dots */}
      <Animated.View
        style={[
          styles.paginationContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
     
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </Animated.View>

      {/* Buttons */}
      <Animated.View
        style={[styles.buttonRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <TouchableOpacity
          style={styles.skipButton}
        onPress={() => router.push("/Login")}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/SecondOnboard")}
        >
          <Text style={styles.nextText}>Next</Text>
          <AntDesign name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "white",
  },
  animationContainer: {
    alignItems: "center",
  },
  animation: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 25,
  },
  paginationContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: "#3B82F6",
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 6,
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
});
