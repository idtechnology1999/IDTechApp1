import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import GestureRecognizer from "react-native-swipe-gestures";

export default function Index() {
  const router = useRouter();
  const swipeConfig = { velocityThreshold: 0.25, directionalOffsetThreshold: 70 };

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.93)).current;

  // Breathing ring animations
  const ring1 = useRef(new Animated.Value(1)).current;
  const ring2 = useRef(new Animated.Value(1)).current;
  const ring3 = useRef(new Animated.Value(1)).current;

  // Floating chip animations
  const chip1 = useRef(new Animated.Value(0)).current;
  const chip2 = useRef(new Animated.Value(0)).current;
  const chip3 = useRef(new Animated.Value(0)).current;

  const breathe = (anim: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1.06, duration: 1500, delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,    duration: 1500,        easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

  const floatChip = (anim: Animated.Value, delay: number) =>
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: -7, duration: 1750, delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue:  0, duration: 1750,        easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 650, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
    ]).start();

    breathe(ring1, 0).start();
    breathe(ring2, 500).start();
    breathe(ring3, 1000).start();
    floatChip(chip1, 0).start();
    floatChip(chip2, 1100).start();
    floatChip(chip3, 2100).start();
  }, []);

  return (
    <GestureRecognizer style={{ flex: 1 }} config={swipeConfig} onSwipeLeft={() => router.push("/FirstOnboard")}>
      <SafeAreaView style={styles.container}>
        {/* Accent bar */}
        <View style={styles.accentBar} />

        {/* Hero */}
        <Animated.View style={[styles.heroWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.heroBox}>
            {/* Breathing rings */}
            <Animated.View style={[styles.ring, styles.ring3, { transform: [{ scale: ring3 }] }]} />
            <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ring2 }] }]} />
            <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: ring1 }] }]} />

            {/* Lottie */}
            <View style={styles.iconCore}>
              <LottieView source={require("../assets/animations/phone.json")} autoPlay loop style={styles.lottie} />
            </View>

            {/* Floating chips */}
            <Animated.View style={[styles.chip, styles.chipA, { transform: [{ translateY: chip1 }] }]}>
              <Text style={styles.chipTextOrange}>Live Courses</Text>
            </Animated.View>
            <Animated.View style={[styles.chip, styles.chipB, { transform: [{ translateY: chip2 }] }]}>
              <Text style={styles.chipTextYellow}>Anytime</Text>
            </Animated.View>
            <Animated.View style={[styles.chip, styles.chipC, { transform: [{ translateY: chip3 }] }]}>
              <Text style={styles.chipTextBlue}>Mobile</Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.badge}><Text style={styles.badgeText}>Onboarding</Text></View>
          <Text style={styles.title}>Learn <Text style={styles.ora}>Anywhere</Text>{"\n"}Anytime</Text>
          <Text style={styles.subtitle}>Access all your courses from any device. Learn at your own pace on our mobile-first platform.</Text>
        </Animated.View>

        {/* Dots */}
        <Animated.View style={[styles.dotsRow, { opacity: fadeAnim }]}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity onPress={() => router.push("/Login")}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={() => router.push("/FirstOnboard")}>
            <Text style={styles.nextText}>Next</Text>
            <Ionicons name="arrow-forward" size={15} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </GestureRecognizer>
  );
}

const RING_BASE = 74;
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24 },
  accentBar:   { height: 3, backgroundColor: "#FF6B00", marginHorizontal: -24, marginBottom: 6 },
  heroWrap:    { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 16 },
  heroBox: {
    width: 268, height: 268,
    borderRadius: 32,
    backgroundColor: "#FFF8F0",
    borderWidth: 1, borderColor: "#FFE4C4",
    justifyContent: "center", alignItems: "center",
    overflow: "visible",
  },
  ring: {
    position: "absolute", borderRadius: 999, borderWidth: 1.5,
  },
  ring1: { width: RING_BASE,      height: RING_BASE,      borderColor: "rgba(255,107,0,0.28)" },
  ring2: { width: RING_BASE + 18, height: RING_BASE + 18, borderColor: "rgba(255,107,0,0.15)" },
  ring3: { width: RING_BASE + 36, height: RING_BASE + 36, borderColor: "rgba(255,107,0,0.08)" },
  iconCore: { width: 68, height: 68, borderRadius: 18, backgroundColor: "#FFF0E5", justifyContent: "center", alignItems: "center", zIndex: 2 },
  lottie:   { width: 56, height: 56 },
  chip: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 20, paddingHorizontal: 11, paddingVertical: 5,
    borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 3, zIndex: 10,
  },
  chipA: { top: 22, right: 18, borderColor: "#FFD4B0" },
  chipB: { bottom: 24, left: 16, borderColor: "#FFE97A" },
  chipC: { top: 44, left: 14, borderColor: "#C8DDF8" },
  chipTextOrange: { fontSize: 11, fontWeight: "600", color: "#CC5500" },
  chipTextYellow: { fontSize: 11, fontWeight: "600", color: "#B88000" },
  chipTextBlue:   { fontSize: 11, fontWeight: "600", color: "#1553A8" },
  content:  { marginBottom: 24 },
  badge:    { alignSelf: "flex-start", backgroundColor: "#FFF0E5", borderWidth: 1, borderColor: "#FFCFA0", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3, marginBottom: 10 },
  badgeText:{ fontSize: 10, fontWeight: "600", color: "#CC5500", textTransform: "uppercase", letterSpacing: 0.5 },
  title:    { fontSize: 26, fontWeight: "700", color: "#1A1D23", lineHeight: 32, marginBottom: 9 },
  ora:      { color: "#FF6B00" },
  subtitle: { fontSize: 13, color: "#6B7280", lineHeight: 21 },
  dotsRow:  { flexDirection: "row", gap: 5, alignItems: "center", marginBottom: 24 },
  dot:      { width: 7, height: 4, borderRadius: 4, backgroundColor: "#E2E5EA" },
  dotActive:{ width: 22, backgroundColor: "#FF6B00" },
  footer:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  skipText: { fontSize: 14, fontWeight: "500", color: "#9CA3AF", paddingHorizontal: 8, paddingVertical: 10 },
  nextBtn:  { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FF6B00", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
  nextText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});