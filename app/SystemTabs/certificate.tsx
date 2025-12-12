import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  useColorScheme,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  useTheme,
} from "react-native-paper";
import {
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";

/* ------------------- HEIGHT CALCULATIONS ------------------- */
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 83 : 56;
const HEADER_HEIGHT = 260; // actual height of sticky header content
const CONTENT_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - HEADER_HEIGHT;

export default function CertificatesScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === "dark";

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const certificates = [
    { id: "CERT-2024-001", course: "Data Science Basics", date: "Nov 15, 2024" },
    { id: "CERT-2024-002", course: "Web Development Fundamentals", date: "Dec 1, 2024" },
    { id: "CERT-2024-003", course: "UI/UX Design Starter", date: "Oct 20, 2024" },
  ];

  const filtered = certificates.filter((c) =>
    c.course.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#101010" : "#F9FBFF",
      }}
    >
      {/* ---------- STICKY HEADER ---------- */}
      <View style={[styles.stickyHeader, { height: HEADER_HEIGHT }]}>
        <Text style={[styles.pageTitle, { color: theme.colors.onSurface }]}>
          Certificates
        </Text>

        <Text style={styles.smallText}>
          {certificates.length} certificates earned
        </Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            placeholder="Search certificates..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Orange Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="certificate" color="#fff" size={28} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.progressTitle}>Great Progress!</Text>
              <Text style={styles.progressSubtitle}>
                You have earned {certificates.length} certificates. Keep learning!
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* ---------- MAIN CONTENT WITH FIXED HEIGHT ---------- */}
      <View style={{ height: CONTENT_HEIGHT, marginTop: HEADER_HEIGHT }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 30,
          }}
        >
          {/* Skeleton Loader */}
          {loading &&
            [1, 2].map((i) => (
              <Card key={i} style={[styles.certificateCard, { opacity: 0.5 }]}>
                <ActivityIndicator animating={true} />
                <View style={{ height: 70 }} />
              </Card>
            ))}

          {/* Certificate list */}
          {!loading &&
            filtered.map((item) => (
              <Card key={item.id} style={styles.certificateCard}>
                <View style={styles.centerContent}>
                  <View style={styles.certificateCircle}>
                    <MaterialCommunityIcons
                      name="certificate"
                      size={32}
                      color="#fff"
                    />
                  </View>

                  <Text style={styles.certType}>
                    CERTIFICATE OF COMPLETION
                  </Text>
                  <Text style={styles.certCourse}>{item.course}</Text>

                  <Ionicons
                    name="open-outline"
                    size={22}
                    color="#1A73E8"
                    style={styles.topRight}
                  />
                </View>

                <View style={styles.details}>
                  <View style={styles.row}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={20}
                      color="#555"
                    />
                    <Text style={styles.detailsText}>
                      Completed {item.date}
                    </Text>
                  </View>
                  <Text style={styles.credential}>ID: {item.id}</Text>
                </View>

                <View style={styles.buttonRow}>
                  <Button
                    mode="contained"
                    style={styles.downloadBtn}
                    labelStyle={{ color: "#fff" }}
                  >
                    <Text>Download</Text>
                  </Button>
                  <Button
                    mode="outlined"
                    style={styles.shareBtn}
                    labelStyle={{ color: "#1A73E8" }}
                  >
                    <Text>Share</Text>
                  </Button>
                </View>
              </Card>
            ))}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <Text
              style={{
                marginTop: 20,
                textAlign: "center",
                color: "#888",
              }}
            >
              No certificates found.
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ---------- HEADER ---------- */
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: "#F9FBFF",
    paddingHorizontal: 16,
    paddingTop: 35,
    elevation: 5,
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
  },

  smallText: {
    fontSize: 14,
    marginBottom: 20,
    color: "#667085",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 20,
    elevation: 2,
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },

  progressCard: {
    backgroundColor: "#FF8A00",
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
  },

  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  progressSubtitle: {
    fontSize: 14,
    color: "#fff",
  },

  row: { flexDirection: "row", alignItems: "center" },

  /* ---------- CARDS ---------- */
  certificateCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
  },

  centerContent: {
    alignItems: "center",
    position: "relative",
  },

  certificateCircle: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "#FF8A00",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  topRight: {
    position: "absolute",
    right: 0,
    top: 0,
  },

  certType: {
    fontSize: 12,
    color: "#667085",
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  certCourse: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 20,
  },

  details: { marginTop: 10 },

  detailsText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 6,
  },

  credential: {
    fontSize: 13,
    marginTop: 4,
    color: "#667085",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  downloadBtn: {
    backgroundColor: "#1A73E8",
    width: "48%",
    borderRadius: 10,
  },

  shareBtn: {
    borderColor: "#1A73E8",
    width: "48%",
    borderRadius: 10,
  },
});
