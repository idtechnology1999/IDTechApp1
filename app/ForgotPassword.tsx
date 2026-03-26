import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, TextInput, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export default function ForgotPassword() {
  const router = useRouter();

  const [email,       setEmail]       = useState("");
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [msg,         setMsg]         = useState("");
  const [msgType,     setMsgType]     = useState<"success" | "error">("error");
  const [done,        setDone]        = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const barWidth  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
    Animated.timing(barWidth, { toValue: 1, duration: 800, useNativeDriver: false }).start();
  }, []);

  const handleReset = async () => {
    if (!email.trim())        { setMsgType("error"); setMsg("Please enter your email address."); return; }
    if (!newPass.trim())      { setMsgType("error"); setMsg("Please enter a new password."); return; }
    if (newPass.length < 6)   { setMsgType("error"); setMsg("Password must be at least 6 characters."); return; }
    if (newPass !== confirmPass) { setMsgType("error"); setMsg("Passwords do not match."); return; }

    setLoading(true);
    setMsg("");
    try {
      const res = await axios.patch(`${apiUrl}/api/mobile/reset-password`, {
        email: email.trim(),
        newPassword: newPass,
      });
      setMsgType(res.data.status ? "success" : "error");
      setMsg(res.data.message);
      if (res.data.status) setDone(true);
    } catch {
      setMsgType("error");
      setMsg("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.accentBar, { width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#FF6B00" />
          </TouchableOpacity>

          <Animated.View style={[styles.iconBlock, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={30} color="#FF6B00" />
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.sub}>Enter your email and choose a new password.</Text>

            {msg ? (
              <View style={[styles.msgBox, msgType === "success" ? styles.successBox : styles.errorBox]}>
                <Ionicons
                  name={msgType === "success" ? "checkmark-circle-outline" : "alert-circle-outline"}
                  size={16}
                  color={msgType === "success" ? "#188038" : "#D93025"}
                />
                <Text style={[styles.msgText, { color: msgType === "success" ? "#188038" : "#D93025" }]}>{msg}</Text>
              </View>
            ) : null}

            {!done ? (
              <>
                {/* Email */}
                <Text style={styles.fieldLbl}>Email Address</Text>
                <View style={styles.fieldRow}>
                  <Ionicons name="mail-outline" size={15} color="#C5CADB" style={styles.fieldIco} />
                  <TextInput
                    style={styles.fieldInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#C5CADB"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* New Password */}
                <Text style={styles.fieldLbl}>New Password</Text>
                <View style={styles.fieldRow}>
                  <Ionicons name="lock-closed-outline" size={15} color="#C5CADB" style={styles.fieldIco} />
                  <TextInput
                    style={[styles.fieldInput, { paddingRight: 44 }]}
                    value={newPass}
                    onChangeText={setNewPass}
                    placeholder="Min. 6 characters"
                    placeholderTextColor="#C5CADB"
                    secureTextEntry={!showNew}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(!showNew)}>
                    <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={18} color="#C5CADB" />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <Text style={styles.fieldLbl}>Confirm Password</Text>
                <View style={styles.fieldRow}>
                  <Ionicons name="lock-closed-outline" size={15} color="#C5CADB" style={styles.fieldIco} />
                  <TextInput
                    style={[styles.fieldInput, { paddingRight: 44 }]}
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                    placeholder="Re-enter new password"
                    placeholderTextColor="#C5CADB"
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(!showConfirm)}>
                    <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={18} color="#C5CADB" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.resetBtn, loading && { opacity: 0.7 }]}
                  onPress={handleReset}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.resetBtnText}>Reset Password</Text>
                  }
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.resetBtn} onPress={() => router.replace("/Login")} activeOpacity={0.85}>
                <Text style={styles.resetBtnText}>Back to Login</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.backToLogin} onPress={() => router.back()}>
              <Ionicons name="arrow-back-outline" size={14} color="#1A73E8" />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#fff" },
  accentBar:       { height: 3, backgroundColor: "#FF6B00" },
  scrollContent:   { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 36 },
  backBtn:         { paddingVertical: 10, alignSelf: "flex-start", marginTop: 4, marginBottom: 6 },
  iconBlock:       { alignItems: "center", marginTop: 20, marginBottom: 28 },
  iconCircle:      { width: 72, height: 72, borderRadius: 20, backgroundColor: "#FFF0E5", borderWidth: 1.5, borderColor: "#FFCFA0", justifyContent: "center", alignItems: "center" },
  title:           { fontSize: 24, fontWeight: "800", color: "#1A1D23", marginBottom: 10 },
  sub:             { fontSize: 14, color: "#6B7280", lineHeight: 22, marginBottom: 24 },
  msgBox:          { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, marginBottom: 16, borderLeftWidth: 4 },
  msgText:         { fontSize: 13, fontWeight: "500", flex: 1 },
  successBox:      { backgroundColor: "#E6F4EA", borderLeftColor: "#34A853" },
  errorBox:        { backgroundColor: "#FDECEA", borderLeftColor: "#EA4335" },
  fieldLbl:        { fontSize: 11, fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 },
  fieldRow:        { position: "relative", flexDirection: "row", alignItems: "center", marginBottom: 16 },
  fieldIco:        { position: "absolute", left: 13, zIndex: 1 },
  fieldInput:      { flex: 1, height: 48, backgroundColor: "#F9FAFB", borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingLeft: 38, fontSize: 14, color: "#1A1D23" },
  eyeBtn:          { position: "absolute", right: 12, padding: 4 },
  resetBtn:        { height: 52, backgroundColor: "#FF6B00", borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 20, marginTop: 4 },
  resetBtnText:    { fontSize: 15, fontWeight: "600", color: "#fff" },
  backToLogin:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 },
  backToLoginText: { fontSize: 13, fontWeight: "600", color: "#1A73E8" },
});
