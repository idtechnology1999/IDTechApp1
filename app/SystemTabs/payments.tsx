import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PaymentsScreen() {
  const isDark = useColorScheme() === "dark";
  const [tab, setTab] = useState("All");

  const payments = [
    {
      id: "RCP-2024-001",
      title: "Web Development Fundamentals",
      date: "Nov 1, 2024",
      amount: 500,
      status: "Paid",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- PAGE HEADER ---------- */}
        <View style={styles.header}>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>Manage your course payments</Text>
        </View>

        {/* ---------- SUMMARY CARDS ---------- */}
        <View style={styles.row}>
          <View style={[styles.summaryCard, styles.greenCard]}>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={styles.summaryAmount}>$1250</Text>
          </View>
          <View style={[styles.summaryCard, styles.redCard]}>
            <Text style={styles.summaryLabel}>Outstanding</Text>
            <Text style={styles.summaryAmountRed}>$150</Text>
          </View>
        </View>

        {/* ---------- PAYMENT DUE ALERT ---------- */}
        <Card style={styles.dueCard}>
          <View style={styles.dueRow}>
            <Ionicons name="alert-circle" size={22} color="#D32F2F" />
            <View style={styles.dueTextContainer}>
              <Text style={styles.dueText}>Payment Due</Text>
              <Text style={styles.dueSub}>$150 due by Dec 15, 2024</Text>
            </View>
          </View>
          <Button mode="contained" style={styles.payNowBtn} labelStyle={{ color: "#fff" }}>
            <Text>Pay Now</Text>
          </Button>
        </Card>

        {/* ---------- TABS ---------- */}
        <View style={styles.tabsContainer}>
          {["All", "Paid", "Pending"].map((t) => (
            <Button
              key={t}
              mode={tab === t ? "contained" : "text"}
              onPress={() => setTab(t)}
              style={[styles.tabBtn, tab === t && styles.tabActive]}
              labelStyle={{ color: tab === t ? "#fff" : "#1A73E8" }}
            >
              {t}
            </Button>
          ))}
        </View>

        {/* ---------- PAYMENT HISTORY ---------- */}
        <Text style={styles.historyTitle}>Payment History</Text>
        {payments.map((p) => (
          <Card key={p.id} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.courseTitle}>{p.title}</Text>
              <Text style={styles.statusPaid}>${p.amount} Paid</Text>
            </View>
            <Text style={styles.dateText}>{p.date}</Text>
            <Text style={styles.receiptText}>Receipt: {p.id}</Text>
            <View style={styles.downloadRow}>
              <Ionicons name="download-outline" size={20} color="#1A73E8" />
              <Text style={styles.downloadText}>Download</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FBFF",
    minHeight: SCREEN_HEIGHT, // ensures full screen usage
  },
  scrollContainer: {
    paddingBottom: 20, // space at bottom
    minHeight: SCREEN_HEIGHT,
  },

  /* HEADER */
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#0D1B2A" },
  subtitle: { fontSize: 14, color: "#667085", marginTop: 4, marginBottom: 20 },

  /* SUMMARY CARDS */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  summaryCard: {
    width: "48%",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  greenCard: {
    backgroundColor: "#11C56B20",
    borderLeftWidth: 6,
    borderLeftColor: "#11C56B",
  },
  redCard: {
    backgroundColor: "#FF525220",
    borderLeftWidth: 6,
    borderLeftColor: "#FF5252",
  },
  summaryLabel: { fontSize: 14, color: "#555" },
  summaryAmount: { fontSize: 32, fontWeight: "700", color: "#0D1B2A" },
  summaryAmountRed: { fontSize: 32, fontWeight: "700", color: "#D32F2F" },

  /* DUE CARD */
  dueCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#FFE5E5",
    marginBottom: 20,
  },
  dueRow: { flexDirection: "row", alignItems: "center" },
  dueTextContainer: { marginLeft: 10 },
  dueText: { fontSize: 16, fontWeight: "700", color: "#D32F2F" },
  dueSub: { fontSize: 14, color: "#A33" },
  payNowBtn: { marginTop: 15, backgroundColor: "#D32F2F", borderRadius: 10 },

  /* TABS */
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 15,
  },
  tabBtn: {
    flex: 1,
    marginRight: 6,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: "#1A73E8",
  },

  /* HISTORY */
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 20,
    marginBottom: 10,
  },

  /* PAYMENT CARD */
  paymentCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  paymentHeader: { flexDirection: "row", justifyContent: "space-between" },
  courseTitle: { fontSize: 16, fontWeight: "700", color: "#0D1B2A" },
  statusPaid: { fontSize: 16, fontWeight: "700", color: "#11C56B" },
  dateText: { fontSize: 14, color: "#555", marginTop: 8 },
  receiptText: { fontSize: 14, color: "#667085", marginTop: 4 },
  downloadRow: { flexDirection: "row", alignItems: "center", marginTop: 15 },
  downloadText: { marginLeft: 6, color: "#1A73E8", fontSize: 15, fontWeight: "600" },
});
