import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import React from 'react';
import LottieView from 'lottie-react-native';
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function Onboard3() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      {/* Animation */}
      <LottieView
        source={require("../assets/animations/certificate.json")}
        autoPlay
        loop
        style={styles.animation}
      />

      {/* Title */}
      <Text style={styles.title}>Earn Your Certificate</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Complete your program and instantly{"\n"}
        receive a recognized certificate.
      </Text>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>

      {/* Bottom Buttons */}
      <View style={styles.buttonRow}>

        {/* Skip */}
        {/* <TouchableOpacity
        //  onPress={() => router.replace("/system")}
         >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity> */}

        {/* Next */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/Login")}
        >
          <Text style={styles.nextText}>Finish</Text>
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
    backgroundColor: "#fff",
  },

  animation: {
    width: width * 0.75,
    height: width * 0.75,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FF6A00",
    marginTop: 10,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 18,
    color: "#1A73E8",
    opacity: 0.8,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 26,
  },

  dotsContainer: {
    flexDirection: "row",
    marginTop: 25,
    marginBottom: 20,
    gap: 8,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },

  dotActive: {
    backgroundColor: "#FF6A00",
    width: 22,
  },

  buttonRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    position: "absolute",
    bottom: 40,
  },

  skipText: {
    fontSize: 18,
    color: "#1A73E8",
    fontWeight: "600",
  },

  nextButton: {
    backgroundColor: "#FF6A00",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },

  nextText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "700",
  },
});
