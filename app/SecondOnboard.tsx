import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import GestureRecognizer from "react-native-swipe-gestures";

const { width } = Dimensions.get("window");

export default function SecondOnboard() {
  const router = useRouter();
  const swipeConfig = { velocityThreshold: 0.25, directionalOffsetThreshold: 70 };

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.93)).current;

  const ring1 = useRef(new Animated.Value(1)).current;
  const ring2 = useRef(new Animated.Value(1)).current;
  const ring3 = useRef(new Animated.Value(1)).current;
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
    <GestureRecognizer style={{ flex: 1 }} config={swipeConfig} onSwipeRight={() => router.back()}>
      <SafeAreaView style={styles.container}>
        <View style={styles.accentBar} />

        <Animated.View style={[styles.heroWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.heroBox}>
            <Animated.View style={[styles.ring, styles.ring3, { transform: [{ scale: ring3 }] }]} />
            <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ring2 }] }]} />
            <Animated.View style={[styles.ring, styles.ring1, { transform: [{ scale: ring1 }] }]} />

            <View style={styles.iconCore}>
              <LottieView source={require("../assets/animations/certificate.json")} autoPlay loop style={styles.lottie} />
            </View>

            <Animated.View style={[styles.chip, styles.chipA, { transform: [{ translateY: chip1 }] }]}>
              <Text style={styles.chipTextA}>Certified</Text>
            </Animated.View>
            <Animated.View style={[styles.chip, styles.chipB, { transform: [{ translateY: chip2 }] }]}>
              <Text style={styles.chipTextB}>Top Rated</Text>
            </Animated.View>
            <Animated.View style={[styles.chip, styles.chipC, { transform: [{ translateY: chip3 }] }]}>
              <Text style={styles.chipTextC}>Official</Text>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.badge}><Text style={styles.badgeText}>Certification</Text></View>
          <Text style={styles.title}>Earn Your <Text style={styles.blu}>Certificate</Text></Text>
          <Text style={styles.subtitle}>Complete your program and instantly receive a recognized certificate to boost your career.</Text>
        </Animated.View>

        <Animated.View style={[styles.dotsRow, { opacity: fadeAnim }]}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity style={styles.startBtn} onPress={() => router.push("/Login")}>
            <Text style={styles.startText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={17} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </GestureRecognizer>
  );
}

const RING_BASE = 74;
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24 },
  accentBar:   { height: 3, backgroundColor: "#1A73E8", marginHorizontal: -24, marginBottom: 6 },
  heroWrap:    { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 16 },
  heroBox: {
    width: width * 0.68, height: width * 0.68,
    borderRadius: 32,
    backgroundColor: "#F0F6FF",
    borderWidth: 1, borderColor: "#C8DDF8",
    justifyContent: "center", alignItems: "center",
    overflow: "visible",
  },
  ring:  { position: "absolute", borderRadius: 999, borderWidth: 1.5 },
  ring1: { width: RING_BASE,      height: RING_BASE,      borderColor: "rgba(26,115,232,0.28)" },
  ring2: { width: RING_BASE + 18, height: RING_BASE + 18, borderColor: "rgba(26,115,232,0.15)" },
  ring3: { width: RING_BASE + 36, height: RING_BASE + 36, borderColor: "rgba(26,115,232,0.08)" },
  iconCore: { width: 68, height: 68, borderRadius: 18, backgroundColor: "#EBF3FF", justifyContent: "center", alignItems: "center", zIndex: 2 },
  lottie:   { width: 56, height: 56 },
  chip: {
    position: "absolute",
    backgroundColor: "#fff", borderRadius: 20,
    paddingHorizontal: 11, paddingVertical: 5,
    borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 3, zIndex: 10,
  },
  chipA: { top: 22, right: 18, borderColor: "#B8D4F8" },
  chipB: { bottom: 24, left: 16, borderColor: "#FFE97A" },
  chipC: { top: 44, left: 14, borderColor: "#FFCFA0" },
  chipTextA: { fontSize: 11, fontWeight: "600", color: "#1553A8" },
  chipTextB: { fontSize: 11, fontWeight: "600", color: "#8A6800" },
  chipTextC: { fontSize: 11, fontWeight: "600", color: "#CC5500" },
  content:   { marginBottom: 24 },
  badge:     { alignSelf: "flex-start", backgroundColor: "#EBF3FF", borderWidth: 1, borderColor: "#B8D4F8", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3, marginBottom: 10 },
  badgeText: { fontSize: 10, fontWeight: "600", color: "#1553A8", textTransform: "uppercase", letterSpacing: 0.5 },
  title:     { fontSize: 26, fontWeight: "700", color: "#1A1D23", lineHeight: 32, marginBottom: 9 },
  blu:       { color: "#1A73E8" },
  subtitle:  { fontSize: 13, color: "#6B7280", lineHeight: 21 },
  dotsRow:   { flexDirection: "row", gap: 5, alignItems: "center", marginBottom: 24 },
  dot:       { width: 7, height: 4, borderRadius: 4, backgroundColor: "#E2E5EA" },
  dotActive: { width: 22, backgroundColor: "#1A73E8" },
  footer:    { marginBottom: 24 },
  startBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#1A73E8", paddingVertical: 15, borderRadius: 14, width: "100%" },
  startText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});