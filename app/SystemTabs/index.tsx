import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, ProgressBar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 83 : 56;
const HEADER_HEIGHT  = 120;
const CONTENT_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - HEADER_HEIGHT;

function getCourseProgress(course: any): number {
  const months = course.isUnlimited ? 12 : (course.durationMonths || 1);
  const start  = new Date(course.startDate || Date.now());
  const end    = new Date(start);
  end.setMonth(end.getMonth() + months);

  const total   = end.getTime() - start.getTime();
  const elapsed = Date.now() - start.getTime();
  return Math.min(Math.max(elapsed / total, 0), 1);
}

function getOverallProgress(courses: any[]): number {
  if (!courses?.length) return 0;
  const sum = courses.reduce((acc, c) => acc + getCourseProgress(c), 0);
  return sum / courses.length;
}

function progressColor(p: number): string {
  if (p >= 0.9) return "#ef4444";
  if (p >= 0.6) return "#f59e0b";
  return "#1A73E8";
}

export default function Dashboard() {
  const [user, setUser]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchUserAndPayments = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (!email) { setLoading(false); return; }

        const userResponse = await axios.post(`${apiUrl}/api/mobile/profile`, { email });

        if (userResponse.data.status) {
          const userData = userResponse.data.data;
          setUser(userData);

          try {
            const paymentsResponse = await axios.post(`${apiUrl}/api/mobile/payments`, { email });
            if (paymentsResponse.data.status && paymentsResponse.data.data) {
              const total = paymentsResponse.data.data.reduce(
                (sum: number, payment: any) => sum + (Number(payment.amountPaid) || 0), 0
              );
              setTotalAmount(total);
            } else {
              setTotalAmount(Number(userData?.amount) || 0);
            }
          } catch {
            setTotalAmount(Number(userData?.amount) || 0);
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPayments();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const courses        = user?.courses ?? [];
  const overallProgress = getOverallProgress(courses);
  const certCount      = courses.filter((c: any) => c.certificate === "Completed").length;
  const courseNames    = courses.map((c: any) => c.name).join(", ");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FBFF" }}>
      {/* Sticky Header */}
      <View style={[styles.stickyHeader, {
        paddingTop: Platform.OS === "ios" ? 60 : (StatusBar.currentHeight ?? 24) + 20,
      }]}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.username}>{user?.fullName || "Student"} 👋</Text>
      </View>

      {/* Scrollable Content */}
      <View style={{ height: CONTENT_HEIGHT, marginTop: HEADER_HEIGHT }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Overall Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Overall Progress</Text>
                <Text style={styles.progressPercent}>
                  {(overallProgress * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name="book-open-page-variant" size={32} color="#1A73E8" />
              </View>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.round(overallProgress * 100)}%` as any, backgroundColor: progressColor(overallProgress) }]} />
            </View>
            <Text style={styles.subText}>
              {courses.length} of {courses.length} course{courses.length !== 1 ? "s" : ""} enrolled{"\n"}
              <Text style={styles.courseNameList}>({courseNames})</Text>
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="cash" size={28} color="#FF5757" />
              <Text style={styles.statNumber}>₦{totalAmount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Paid</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="book-outline" size={28} color="#4E8DF5" />
              <Text style={styles.statNumber}>{courses.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="certificate" size={28} color="#F4A300" />
              <Text style={styles.statNumber}>{certCount}</Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </View>
          </View>

          {/* Continue Learning */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <Text style={styles.link}>See All</Text>
          </View>

          {courses.map((c: any, index: number) => {
            const p     = getCourseProgress(c);
            const color = progressColor(p);
            const months = c.isUnlimited ? 12 : (c.durationMonths || 1);
            const start  = new Date(c.startDate || Date.now());
            const end    = new Date(start);
            end.setMonth(end.getMonth() + months);
            const daysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));

            return (
              <Card key={index} style={styles.courseCard}>
                {c.image ? (
                  <Image source={{ uri: c.image }} style={styles.courseImage} />
                ) : (
                  <View style={[styles.courseImage, { backgroundColor: "#e8f0fe", justifyContent: "center", alignItems: "center" }]}>
                    <MaterialCommunityIcons name="book-open-variant" size={40} color="#1A73E8" />
                  </View>
                )}
                <View style={styles.courseDetails}>
                  <Text style={styles.courseTitle}>{c.name}</Text>

                  {/* Per-course progress */}
                  <View style={styles.courseProgressRow}>
                    <Text style={styles.courseProgressPct}>{(p * 100).toFixed(0)}%</Text>
                    <Text style={styles.courseProgressDays}>
                      {daysLeft > 0 ? `${daysLeft}d left` : "Ended"} ·{" "}
                      {c.isUnlimited ? "Unlimited" : `${c.durationMonths || 1} month${(c.durationMonths || 1) > 1 ? "s" : ""}`}
                    </Text>
                  </View>
                  <ProgressBar
                    progress={p}
                    color={color}
                    style={styles.courseProgressBar}
                  />
                </View>
              </Card>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stickyHeader: {
    height: HEADER_HEIGHT,
    backgroundColor: "#F9FBFF",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 100,
  },
  welcomeText: { fontSize: 16, color: "#555" },
  username:    { fontSize: 24, fontWeight: "bold", marginTop: 4 },
  container:   { paddingHorizontal: 16, backgroundColor: "#F9FBFF" },

  progressCard: {
    backgroundColor: "#fff", borderRadius: 16, marginBottom: 20,
    padding: 16, elevation: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  progressHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  progressTitle:   { fontSize: 16, color: "#777" },
  progressPercent: { fontSize: 28, fontWeight: "bold" },
  iconBox:         { backgroundColor: "#E6F0FF", padding: 12, borderRadius: 50 },
  progressBar:     { height: 8, borderRadius: 12, marginVertical: 8 },
  progressBarTrack: { height: 8, borderRadius: 12, backgroundColor: "#e8f0fe", marginVertical: 10, overflow: "hidden" },
  progressBarFill:  { height: 8, borderRadius: 12 },
  subText:         { color: "#777", fontSize: 13, marginTop: 4 },
  courseNameList:  { color: "#1A73E8", fontSize: 12, marginTop: 3, fontStyle: "italic" },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  statBox:  { width: "30%", backgroundColor: "#fff", borderRadius: 16, alignItems: "center", paddingVertical: 16, elevation: 2 },
  statNumber: { fontSize: 20, fontWeight: "bold", marginTop: 6 },
  statLabel:  { fontSize: 12, color: "#777" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle:  { fontSize: 18, fontWeight: "bold" },
  link:          { fontSize: 14, color: "#1A73E8" },

  courseCard:    { borderRadius: 16, overflow: "hidden", elevation: 3, marginBottom: 20 },
  courseImage:   { width: "100%", height: 140 },
  courseDetails: { padding: 12 },
  courseTitle:   { fontSize: 16, fontWeight: "bold", marginBottom: 8 },

  courseProgressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  courseProgressPct:  { fontSize: 13, fontWeight: "700", color: "#0f172a" },
  courseProgressDays: { fontSize: 12, color: "#94a3b8" },
  courseProgressBar:  { height: 6, borderRadius: 10 },
});
