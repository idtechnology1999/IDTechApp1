import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View, Text, StyleSheet, Alert, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, TextInput, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import GestureRecognizer from "react-native-swipe-gestures";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export default function Login() {
  const router = useRouter();
  const swipeConfig = { velocityThreshold: 0.25, directionalOffsetThreshold: 70 };

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [message,     setMessage]     = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.65)).current;

  // Growing accent bar width
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 65, useNativeDriver: true }),
    ]).start();
    Animated.timing(barWidth, { toValue: 1, duration: 800, useNativeDriver: false }).start();
  }, []);

  const handleForgotPassword = () => router.push("/ForgotPassword");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setMessage("Email and password are required");
      setMessageType("error");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(`${apiUrl}/api/mobile/login`, { email, password });
      setMessage(response.data.message);
      setMessageType(response.data.status ? "success" : "error");
      if (response.data.status === true) {
        await AsyncStorage.setItem("userEmail", response.data.data.email);
        await AsyncStorage.setItem("userName", response.data.data.fullName);
        setTimeout(() => router.replace("/SystemTabs"), 800);
      }
    } catch {
      setMessage("Unable to connect to server");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () =>
    Alert.alert("Registration", "Contact the administrator of IDTECH to create an account.");

  return (
    <GestureRecognizer style={{ flex: 1 }} config={swipeConfig} onSwipeRight={() => router.back()}>
      <SafeAreaView style={styles.container}>
        {/* Animated accent bar */}
        <Animated.View style={[styles.accentBar, { width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

            {/* Back */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#FF6B00" />
            </TouchableOpacity>

            {/* Brand — spring pop-in */}
            <Animated.View style={[styles.brandBlock, { transform: [{ scale: logoScale }], opacity: fadeAnim }]}>
              <View style={styles.lockCircle}>
                <Ionicons name="lock-closed" size={26} color="#FF6B00" />
              </View>
              <Text style={styles.brandTitle}>IDTECH</Text>
              <Text style={styles.brandSub}>Real World Academy</Text>
            </Animated.View>

            {/* Divider below brand */}
            <View style={styles.brandDivider} />

            {/* Form */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <Text style={styles.welcomeTitle}>Welcome back 👋</Text>
              <Text style={styles.welcomeSub}>Sign in to continue learning</Text>

              {/* Message */}
              {message ? (
                <View style={[styles.msgBox, messageType === "success" ? styles.successBox : styles.errorBox]}>
                  <Text style={[styles.msgText, messageType === "success" ? styles.successText : styles.errorText]}>{message}</Text>
                </View>
              ) : null}

              {/* Email */}
              <Text style={styles.fieldLbl}>Email</Text>
              <View style={styles.fieldRow}>
                <Ionicons name="mail-outline" size={15} color="#C5CADB" style={styles.fieldIco} />
                <TextInput
                  style={styles.fieldInput}
                  value={email} onChangeText={setEmail}
                  placeholder="you@example.com" placeholderTextColor="#C5CADB"
                  keyboardType="email-address" autoCapitalize="none"
                />
              </View>

              {/* Password */}
              <Text style={styles.fieldLbl}>Password</Text>
              <View style={styles.fieldRow}>
                <Ionicons name="lock-closed-outline" size={15} color="#C5CADB" style={styles.fieldIco} />
                <TextInput
                  style={[styles.fieldInput, { paddingRight: 44 }]}
                  value={password} onChangeText={setPassword}
                  placeholder="••••••••" placeholderTextColor="#C5CADB"
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color="#C5CADB" />
                </TouchableOpacity>
              </View>

              {/* Forgot */}
              <TouchableOpacity style={styles.forgotWrap} onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Login button */}
              <TouchableOpacity
                style={[styles.loginBtn, loading && { opacity: 0.7 }]}
                onPress={handleLogin} disabled={loading} activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.loginBtnText}>Login</Text>
                }
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.divLine} />
                <Text style={styles.divText}>or continue with</Text>
                <View style={styles.divLine} />
              </View>

              {/* Social */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-google"   size={18} color="#EA4335" />
                  <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn}>
                  <Ionicons name="logo-facebook" size={18} color="#1877F2" />
                  <Text style={styles.socialText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              {/* Register */}
              <View style={styles.regRow}>
                <Text style={styles.regText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text style={styles.regLink}>Register</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureRecognizer>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#fff" },
  accentBar:    { height: 3, backgroundColor: "#FF6B00" },
  scrollContent:{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 36 },
  backBtn:      { paddingVertical: 10, alignSelf: "flex-start", marginTop: 4, marginBottom: 6 },
  brandBlock:   { alignItems: "center", marginBottom: 20, marginTop: 4 },
  lockCircle:   { width: 56, height: 56, borderRadius: 16, backgroundColor: "#FFF0E5", borderWidth: 1, borderColor: "#FFCFA0", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  brandTitle:   { fontSize: 28, fontWeight: "900", color: "#FF6B00", letterSpacing: 3, lineHeight: 32 },
  brandSub:     { fontSize: 11, fontWeight: "600", color: "#1A73E8", letterSpacing: 1.5, textTransform: "uppercase" },
  brandDivider: { height: 1, backgroundColor: "#F0F2F5", marginBottom: 20 },
  welcomeTitle: { fontSize: 19, fontWeight: "700", color: "#1A1D23", marginBottom: 3 },
  welcomeSub:   { fontSize: 13, color: "#9CA3AF", marginBottom: 20 },
  msgBox:       { padding: 12, borderRadius: 10, marginBottom: 16, borderLeftWidth: 4 },
  msgText:      { fontSize: 13, fontWeight: "500", textAlign: "center" },
  successBox:   { backgroundColor: "#E6F4EA", borderLeftColor: "#34A853" },
  successText:  { color: "#188038" },
  errorBox:     { backgroundColor: "#FDECEA", borderLeftColor: "#EA4335" },
  errorText:    { color: "#D93025" },
  fieldLbl:     { fontSize: 11, fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6, marginTop: 4 },
  fieldRow:     { position: "relative", flexDirection: "row", alignItems: "center", marginBottom: 14 },
  fieldIco:     { position: "absolute", left: 13, zIndex: 1 },
  fieldInput:   { flex: 1, height: 48, backgroundColor: "#F9FAFB", borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingLeft: 38, fontSize: 14, color: "#1A1D23" },
  eyeBtn:       { position: "absolute", right: 12, padding: 4 },
  forgotWrap:   { alignSelf: "flex-end", marginTop: -6, marginBottom: 20 },
  forgotText:   { fontSize: 12, fontWeight: "600", color: "#1A73E8" },
  loginBtn:     { height: 52, backgroundColor: "#FF6B00", borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  loginBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  divider:      { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  divLine:      { flex: 1, height: 1, backgroundColor: "#F0F2F5" },
  divText:      { fontSize: 11, color: "#C5CADB", fontWeight: "500" },
  socialRow:    { flexDirection: "row", gap: 10, marginBottom: 22 },
  socialBtn:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "#F9FAFB", borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 12, paddingVertical: 12 },
  socialText:   { fontSize: 13, fontWeight: "500", color: "#374151" },
  regRow:       { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  regText:      { fontSize: 13, color: "#9CA3AF" },
  regLink:      { fontSize: 13, fontWeight: "700", color: "#FF6B00" },
});