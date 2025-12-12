import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, Button } from "react-native-paper";
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";

export default function ProfileScreen() {
  const user = {
    name: "John Doe",
    studentId: "STU-2024-001",
    email: "john.doe@student.edu",
    phone: "+1 (555) 123-4567",
    dob: "Jan 15, 1998",
    address: "123 University Ave, Campus City",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F7FA" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ---------- HEADER ---------- */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>

          <Feather name="edit-3" size={20} color="#1A73E8" style={styles.editIcon} />
        </View>

        {/* ---------- AVATAR + NAME ---------- */}
        <View style={styles.center}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={55} color="#fff" />
          </View>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.studentId}>{user.studentId}</Text>
        </View>

        {/* ---------- PERSONAL INFO CARD ---------- */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          {/* EMAIL */}
          <View style={styles.row}>
            <MaterialCommunityIcons
              name="email-outline"
              size={24}
              color="#1A73E8"
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
          </View>

          {/* PHONE */}
          <View style={styles.row}>
            <Ionicons name="call-outline" size={24} color="#1A73E8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{user.phone}</Text>
            </View>
          </View>

          {/* DOB */}
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={24} color="#1A73E8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>{user.dob}</Text>
            </View>
          </View>

          {/* ADDRESS */}
          <View style={styles.row}>
            <Ionicons name="location-outline" size={24} color="#1A73E8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{user.address}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 10,
    marginBottom: 10,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#0D1B2A" },
  editIcon: { paddingTop: 12 },

  /* AVATAR */
  center: { alignItems: "center", marginTop: 10 },
  avatar: {
    width: 95,
    height: 95,
    borderRadius: 70,
    backgroundColor: "#1A73E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#1A73E8",
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  name: { fontSize: 22, fontWeight: "700", color: "#0D1B2A" },
  studentId: { fontSize: 14, color: "#667085", marginBottom: 20 },

  /* INFO CARD */
  infoCard: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#fff",
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 18,
    color: "#0D1B2A",
  },

  /* INFO ROW */
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#667085",
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: "#0D1B2A",
    fontWeight: "500",
  },
});
