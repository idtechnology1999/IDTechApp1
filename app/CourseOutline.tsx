import React, { useEffect, useState } from "react";
import {
  View, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Platform, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";

interface OutlineItem {
  module: string;
  week: string;
  topic: string;
  details: string;
}

export default function CourseOutline() {
  const router = useRouter();
  const { course } = useLocalSearchParams<{ course: string }>();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${apiUrl}/api/mobile/courses/outline-by-title/${encodeURIComponent(course)}`)
      .then((res) => {
        if (res.data.success) setOutline(res.data.data.outline ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [course]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: Platform.OS === "ios" ? 20 : (StatusBar.currentHeight || 0) + 15,
      }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0D1B2A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Course Outline</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{course}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6A00" />
        </View>
      ) : outline.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="book-off-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No outline available yet</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.countText}>{outline.length} topics across {new Set(outline.map(i => i.module)).size} module(s)</Text>
          {Object.entries(
            outline.reduce((acc, item) => {
              const mod = item.module || "General";
              if (!acc[mod]) acc[mod] = [];
              acc[mod].push(item);
              return acc;
            }, {} as Record<string, OutlineItem[]>)
          ).map(([moduleName, items]) => (
            <View key={moduleName} style={styles.moduleSection}>
              {/* Module Header */}
              <View style={styles.moduleHeader}>
                <MaterialCommunityIcons name="layers-outline" size={18} color="#fff" />
                <Text style={styles.moduleTitle}>{moduleName}</Text>
                <View style={styles.moduleBadge}>
                  <Text style={styles.moduleBadgeText}>{items.length} topics</Text>
                </View>
              </View>

              {/* Items */}
              {items.map((item, index) => {
                const key = `${moduleName}-${index}`;
                const isOpen = expanded === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.card, isOpen && styles.cardActive]}
                    onPress={() => setExpanded(isOpen ? null : key)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardRow}>
                      <View style={styles.weekBadge}>
                        <Text style={styles.weekText}>{item.week}</Text>
                      </View>
                      <Text style={styles.topicText} numberOfLines={isOpen ? 0 : 1}>
                        {item.topic}
                      </Text>
                      <Ionicons
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#94a3b8"
                      />
                    </View>
                    {isOpen && item.details ? (
                      <Text style={styles.detailsText}>{item.details}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FBFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#f1f5f9",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0D1B2A" },
  headerSub:   { fontSize: 12, color: "#667085", marginTop: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#94a3b8", marginTop: 12, fontWeight: "600" },
  scroll: { padding: 16, paddingBottom: 40 },
  countText: { fontSize: 13, color: "#94a3b8", marginBottom: 12, fontWeight: "600" },
  moduleSection: { marginBottom: 20 },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1B2A",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 8,
  },
  moduleTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: "#fff" },
  moduleBadge: {
    backgroundColor: "rgba(255,106,0,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  moduleBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardActive: { borderWidth: 1.5, borderColor: "#FF6A00" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  weekBadge: {
    backgroundColor: "#fff3e0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexShrink: 0,
  },
  weekText:    { fontSize: 11, fontWeight: "700", color: "#FF6A00" },
  topicText:   { flex: 1, fontSize: 14, fontWeight: "600", color: "#0D1B2A" },
  detailsText: { fontSize: 13, color: "#667085", marginTop: 10, lineHeight: 20 },
});
