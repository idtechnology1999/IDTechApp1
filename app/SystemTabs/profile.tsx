import React, { useEffect, useState } from "react";
import {
  View, StyleSheet, ScrollView, Alert, TextInput,
  TouchableOpacity, ActivityIndicator, Platform, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileScreen() {
  const router = useRouter();

  const [email, setEmail]       = useState<string | null>(null);
  const [username, setUsername] = useState("Student");
  const [studentId, setStudentId] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedEmail = await AsyncStorage.getItem("userEmail");
      if (!storedEmail) {
        Alert.alert("Session expired", "Please log in again.");
        router.replace("/Login");
        return;
      }
      setEmail(storedEmail);
      const storedName = await AsyncStorage.getItem("userName");
      setUsername(storedName ?? storedEmail.split("@")[0]);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setStudentId(`STU-2026-${randomNum}`);
    };
    loadUser();
  }, []);

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwMsg({ text: "All password fields are required.", type: "error" }); return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ text: "New passwords do not match.", type: "error" }); return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ text: "New password must be at least 6 characters.", type: "error" }); return;
    }
    setChangingPassword(true);
    try {
      const res = await axios.patch(`${apiUrl}/api/mobile/change-password`, {
        email, currentPassword, newPassword,
      });
      if (res.data.status) {
        setPwMsg({ text: "Password changed successfully.", type: "success" });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        setPwMsg({ text: res.data.message, type: "error" });
      }
    } catch {
      setPwMsg({ text: "Failed to change password. Please try again.", type: "error" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/Login");
        },
      },
    ]);
  };

  const initials = username
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#D32F2F" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <Text style={styles.name}>{username}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>{studentId}</Text>
          </View>
        </View>

        {/* ── Personal Info ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#1A73E8" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="shield-account-outline" size={20} color="#1A73E8" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Account Status</Text>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Change Password ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Text style={styles.sectionSubtitle}>
            First-time users: your default password is{" "}
            <Text style={{ fontWeight: "700", color: "#FF6A00" }}>IDTECH</Text>
          </Text>

          <Text style={styles.fieldLabel}>Current Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#C5CADB"
              secureTextEntry={!showCurrent}
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={showCurrent ? "eye-off-outline" : "eye-outline"} size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>New Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-open-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#C5CADB"
              secureTextEntry={!showNew}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Confirm New Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#C5CADB"
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {pwMsg && (
            <View style={[
              styles.pwMsg,
              pwMsg.type === "success" ? styles.pwMsg__success : styles.pwMsg__error
            ]}>
              <Ionicons
                name={pwMsg.type === "success" ? "checkmark-circle" : "alert-circle"}
                size={16}
                color={pwMsg.type === "success" ? "#16a34a" : "#dc2626"}
              />
              <Text style={[
                styles.pwMsgText,
                { color: pwMsg.type === "success" ? "#16a34a" : "#dc2626" }
              ]}>{pwMsg.text}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.updateBtn, changingPassword && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            disabled={changingPassword}
            activeOpacity={0.85}
          >
            {changingPassword
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <Ionicons name="key-outline" size={18} color="#fff" />
                  <Text style={styles.updateBtnText}>Update Password</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F6FB" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: "#F4F6FB",
  },
  headerTitle: { fontSize: 26, fontWeight: "700", color: "#0D1B2A" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  logoutText: { fontSize: 13, fontWeight: "600", color: "#D32F2F" },

  scroll: { paddingHorizontal: 20, paddingBottom: 100 },

  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#1A73E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#1A73E8",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  initials: { fontSize: 30, fontWeight: "700", color: "#fff" },
  name: { fontSize: 20, fontWeight: "700", color: "#0D1B2A", marginBottom: 8 },
  idBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  idText: { fontSize: 12, color: "#4F46E5", fontWeight: "600" },

  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0D1B2A", marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, color: "#9CA3AF", marginBottom: 18 },

  infoRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 6 },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#0D1B2A" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 8 },
  activeBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#22C55E" },
  activeText: { fontSize: 13, fontWeight: "600", color: "#16A34A" },

  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 6, marginTop: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: "#1A1D23" },

  pwMsg: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 10, marginBottom: 12,
  },
  pwMsg__success: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0" },
  pwMsg__error:   { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  pwMsgText: { fontSize: 13, fontWeight: "600", flex: 1 },

  updateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF6A00",
    borderRadius: 12,
    height: 50,
    marginTop: 6,
  },
  updateBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
