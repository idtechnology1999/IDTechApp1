import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Animation */}
      <LottieView
        source={require("../assets/animations/phone.json")}
        autoPlay
        loop
        style={{ width: 220, height: 220, marginBottom: 20 }}
      />

      {/* Title */}
      <Text style={styles.title}>Learn Anywhere</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Access your courses anytime, anywhere.{"\n"}
        Learn at your own pace with our mobile‑friendly platform.
      </Text>

      {/* Pagination Indicator */}
      <View style={styles.paginationContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        {/* Skip Button */}
        <TouchableOpacity
          style={styles.skipButton}
        onPress={() => router.push("/Login")}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => 
            router.push("/FirstOnboard")} // navigates to next onboarding
        >
          <Text style={styles.nextText}>Next</Text>
          <AntDesign name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    lineHeight: 20,
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
    marginTop: 10,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  skipText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 6,
  },
});
