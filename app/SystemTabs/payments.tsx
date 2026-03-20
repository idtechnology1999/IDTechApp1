import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity, Share, Platform, StatusBar, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 83 : 56;
const HEADER_HEIGHT  = 300;
const CONTENT_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - HEADER_HEIGHT;
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("All");

  useEffect(() => {
    const fetch = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (!email) { setLoading(false); return; }
        const res = await axios.post(`${apiUrl}/api/mobile/payments`, { email });
        if (res.data.status) setPayments(res.data.data ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleShare = async (p: any) => {
    await Share.share({
      message: `💰 Payment Receipt\n\nName: ${p.name}\nCourse: ${p.course}\nAmount Paid: ₦${Number(p.amountPaid).toLocaleString()}\nReceipt ID: ${p.receiptId}\nDate: ${formatDate(p.date)}\n\nIDTECH Real World Academy`,
      title: `Receipt - ${p.course}`,
    });
  };

  const totalPaid    = payments.reduce((s, p) => s + Number(p.amountPaid), 0);
  const totalCourses = payments.length;

  const filtered = tab === "All" ? payments
    : payments.filter((p) => (tab === "Paid" ? Number(p.amountPaid) > 0 : Number(p.amountPaid) === 0));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>

      {/* Sticky Header */}
      <View style={[styles.stickyHeader, {
        paddingTop: Platform.OS === "ios" ? 60 : (StatusBar.currentHeight ?? 24) + 20,
      }]}>
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.subtitle}>Your course payment history</Text>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: "#e8f5e9" }]}>
            <MaterialCommunityIcons name="cash-check" size={22} color="#16a34a" />
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={[styles.summaryAmount, { color: "#16a34a" }]}>₦{totalPaid.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#eff6ff" }]}>
            <MaterialCommunityIcons name="book-open-variant" size={22} color="#2563eb" />
            <Text style={styles.summaryLabel}>Courses</Text>
            <Text style={[styles.summaryAmount, { color: "#2563eb" }]}>{totalCourses}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {["All", "Paid", "Unpaid"].map((t) => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}
              style={[styles.tabBtn, tab === t && styles.tabActive]}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      <View style={{ height: CONTENT_HEIGHT, marginTop: HEADER_HEIGHT }}>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}>

          {loading && (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="cash-clock" size={52} color="#cbd5e1" />
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          )}

          {!loading && filtered.length === 0 && (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="cash-remove" size={52} color="#cbd5e1" />
              <Text style={styles.emptyText}>No payments found</Text>
            </View>
          )}

          {!loading && filtered.map((p, i) => (
            <View key={i} style={styles.card}>

              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.courseRow}>
                  <View style={styles.courseIcon}>
                    <MaterialCommunityIcons name="book-open-variant" size={18} color="#FF6A00" />
                  </View>
                  <Text style={styles.courseName} numberOfLines={1}>{p.course}</Text>
                </View>
                <View style={[styles.badge, Number(p.amountPaid) > 0 ? styles.badgePaid : styles.badgeUnpaid]}>
                  <Text style={styles.badgeText}>{Number(p.amountPaid) > 0 ? "PAID" : "UNPAID"}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Details */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Amount Paid</Text>
                  <Text style={[styles.detailValue, { color: "#16a34a", fontSize: 18, fontWeight: "700" }]}>
                    ₦{Number(p.amountPaid).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formatDate(p.date)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Receipt ID</Text>
                  <Text style={[styles.detailValue, { color: "#6366f1", fontSize: 12 }]}>{p.receiptId}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Student</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{p.name}</Text>
                </View>
              </View>

              {/* Share */}
              {Number(p.amountPaid) > 0 && (
                <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(p)} activeOpacity={0.8}>
                  <Ionicons name="share-social-outline" size={16} color="#fff" />
                  <Text style={styles.shareBtnText}>Share Receipt</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FBFF" },

  stickyHeader: {
    height: HEADER_HEIGHT, backgroundColor: "#F9FBFF",
    paddingHorizontal: 20, justifyContent: "center",
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
  },
  title:    { fontSize: 28, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#94a3b8", marginTop: 2, marginBottom: 16 },

  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  summaryCard: {
    flex: 1, borderRadius: 14, padding: 14,
    alignItems: "flex-start", gap: 4,
  },
  summaryLabel:  { fontSize: 12, color: "#64748b", marginTop: 4 },
  summaryAmount: { fontSize: 20, fontWeight: "700" },

  tabs: { flexDirection: "row", gap: 8 },
  tabBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    backgroundColor: "#fff", alignItems: "center",
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  tabActive:     { backgroundColor: "#FF6A00", borderColor: "#FF6A00" },
  tabText:       { fontSize: 13, fontWeight: "600", color: "#64748b" },
  tabTextActive: { color: "#fff" },

  scroll: { paddingHorizontal: 20, backgroundColor: "#F9FBFF" },

  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: "#94a3b8", marginTop: 12, fontWeight: "600" },

  card: {
    backgroundColor: "#fff", borderRadius: 16, marginBottom: 16,
    padding: 18, elevation: 2,
    shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8,
  },
  cardHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  courseRow:   { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  courseIcon:  { width: 36, height: 36, borderRadius: 10, backgroundColor: "#fff7ed", justifyContent: "center", alignItems: "center" },
  courseName:  { fontSize: 15, fontWeight: "700", color: "#0f172a", flex: 1 },

  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgePaid:    { backgroundColor: "#dcfce7" },
  badgeUnpaid:  { backgroundColor: "#fef3c7" },
  badgeText:    { fontSize: 10, fontWeight: "700", color: "#0f172a" },

  divider: { height: 1, backgroundColor: "#f8fafc", marginBottom: 14 },

  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  detailItem:  { width: "47%" },
  detailLabel: { fontSize: 11, color: "#94a3b8", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 },
  detailValue: { fontSize: 14, fontWeight: "600", color: "#0f172a" },

  shareBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#1A73E8", paddingVertical: 11, borderRadius: 10, gap: 6,
  },
  shareBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
