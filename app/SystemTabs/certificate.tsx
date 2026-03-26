import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  useColorScheme,
  Platform,
  Share,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import GestureRecognizer from "react-native-swipe-gestures";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 83 : 56;
const HEADER_HEIGHT = 310;
const CONTENT_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - HEADER_HEIGHT;

export default function CertificatesScreen() {
  const isDark = useColorScheme() === "dark";

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const fetchCertificates = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) { setLoading(false); return; }

      const response = await axios.post(`${apiUrl}/api/mobile/profile`, { email });

      if (response.data.status) {
        const userData = response.data.data;
        const userCourses: { name: string; certificate: string; image: string | null }[] =
          Array.isArray(userData.courses) ? userData.courses : [];

        const mapped = userCourses.map((c, index) => ({
          id: `CERT-${new Date().getFullYear()}-${String(index + 1).padStart(3, "0")}`,
          course:         c.name,
          status:         c.certificate === "Completed" ? "COMPLETED" : "PENDING",
          canDownload:    c.certificate === "Completed",
          canShare:       c.certificate === "Completed",
          image:          c.image || null,
          durationMonths: (c as any).durationMonths || 1,
          isUnlimited:    (c as any).isUnlimited || false,
          startDate:      (c as any).startDate || null,
        }));

        setCertificates(mapped);
      }
    } catch (error) {
      console.log("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCertificates();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filtered = certificates.filter((c) =>
    c.course.toLowerCase().includes(search.toLowerCase())
  );

  const completedCount = certificates.filter((c) => c.status === "COMPLETED").length;

  const handleShare = async (course: string, id: string) => {
    try {
      await Share.share({
        message: `🎓 I completed the "${course}" course at IDTECH Real World Academy!\n\nCertificate ID: ${id}\n\n#IDTECH #Certificate #Achievement`,
      });
    } catch (error) {
      console.log("Error sharing certificate:", error);
    }
  };

  // ── Shared HTML builder ────────────────────────────────────────────────────
  const buildCertHTML = (item: any, userName: string) => {
    const months  = item.isUnlimited ? 12 : (item.durationMonths || 1);
    const start   = new Date(item.startDate || Date.now());
    const end     = new Date(start);
    end.setMonth(end.getMonth() + months);
    const issued  = start.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const endDate = end.toLocaleDateString("en-GB",   { day: "2-digit", month: "long", year: "numeric" });
    const year    = new Date().getFullYear();

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Certificate of Completion</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;700&family=Great+Vibes&display=swap');
  @page { size: A4 landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 297mm; height: 210mm; overflow: hidden; }

  .page {
    width: 297mm;
    height: 210mm;
    background: #fff;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Lato', sans-serif;
  }

  /* Outer gold border */
  .border-outer {
    position: absolute;
    inset: 8mm;
    border: 3px solid #c9a84c;
  }
  /* Inner thin border */
  .border-inner {
    position: absolute;
    inset: 11mm;
    border: 1px solid #c9a84c;
  }

  /* Dark green header band */
  .header-band {
    position: absolute;
    top: 8mm;
    left: 8mm;
    right: 8mm;
    height: 22mm;
    background: #0a3d2e;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }
  .company-name {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 900;
    color: #c9a84c;
    letter-spacing: 4px;
    text-align: center;
    text-transform: uppercase;
  }
  .company-sub {
    font-size: 9px;
    color: rgba(255,255,255,0.7);
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  /* Gold divider line */
  .gold-line {
    width: 120mm;
    height: 2px;
    background: linear-gradient(90deg, transparent, #c9a84c, #f5e17a, #c9a84c, transparent);
    margin: 0 auto;
  }

  /* Main content area */
  .body {
    position: absolute;
    top: 30mm;
    left: 14mm;
    right: 14mm;
    bottom: 18mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 5px;
  }

  .cert-title {
    font-family: 'Playfair Display', serif;
    font-size: 13px;
    font-weight: 700;
    color: #888;
    letter-spacing: 6px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .cert-of {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 900;
    color: #0a3d2e;
    letter-spacing: 3px;
    text-transform: uppercase;
    line-height: 1;
  }
  .presented-to {
    font-size: 11px;
    color: #999;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 8px;
  }
  .student-name {
    font-family: 'Great Vibes', cursive;
    font-size: 54px;
    color: #0a3d2e;
    line-height: 1.1;
    margin: 2px 0;
  }
  .name-underline {
    width: 180px;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, #c9a84c, transparent);
    margin: 0 auto;
  }
  .desc {
    font-size: 12px;
    color: #555;
    line-height: 1.9;
    margin-top: 6px;
  }
  .course-name {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 700;
    color: #0a3d2e;
  }

  /* Footer row */
  .footer {
    position: absolute;
    bottom: 12mm;
    left: 18mm;
    right: 18mm;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .sig-block { text-align: center; }
  .sig-line  { width: 110px; height: 1px; background: #0a3d2e; margin: 0 auto 4px; }
  .sig-label { font-size: 9px; font-weight: 700; color: #0a3d2e; letter-spacing: 1.5px; text-transform: uppercase; }
  .sig-value { font-size: 11px; color: #444; margin-bottom: 4px; }

  /* Seal */
  .seal {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: radial-gradient(circle, #f5e17a 20%, #c9a84c 70%, #a07830 100%);
    border: 3px solid #0a3d2e;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 3px #c9a84c;
  }
  .seal-text  { font-size: 7px; font-weight: 900; color: #0a3d2e; letter-spacing: 1px; text-transform: uppercase; text-align: center; line-height: 1.4; }
  .seal-stars { font-size: 8px; color: #0a3d2e; }

  /* Corner ornaments */
  .orn { position: absolute; font-size: 22px; color: #c9a84c; z-index: 10; line-height: 1; }
  .orn-tl { top: 9.5mm;  left: 9.5mm;  }
  .orn-tr { top: 9.5mm;  right: 9.5mm; }
  .orn-bl { bottom: 9.5mm; left: 9.5mm;  }
  .orn-br { bottom: 9.5mm; right: 9.5mm; }
</style>
</head>
<body>
<div class="page">
  <div class="border-outer"></div>
  <div class="border-inner"></div>

  <span class="orn orn-tl">❧</span>
  <span class="orn orn-tr">❧</span>
  <span class="orn orn-bl">❧</span>
  <span class="orn orn-br">❧</span>

  <!-- Header band -->
  <div class="header-band">
    <div class="company-name">IDTECH Real World Innovations</div>
    <div class="company-sub">Excellence in Technology Education</div>
  </div>

  <!-- Body -->
  <div class="body">
    <div class="cert-title">This certificate is proudly presented to</div>
    <div class="cert-of">Certificate of Completion</div>
    <div class="presented-to">Presented To</div>
    <div class="student-name">${userName}</div>
    <div class="name-underline"></div>
    <div class="desc">
      In recognition of the successful completion of the course<br/>
      <span class="course-name">${item.course}</span>
    </div>
    <div class="gold-line" style="margin-top:8px;"></div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="sig-block">
      <div class="sig-value">${issued}</div>
      <div class="sig-line"></div>
      <div class="sig-label">Date Issued</div>
    </div>

    <div class="seal">
      <div class="seal-stars">★ ★ ★</div>
      <div class="seal-text">IDTECH\n${year}</div>
      <div class="seal-stars">★ ★ ★</div>
    </div>

    <div class="sig-block">
      <div class="sig-value">${endDate}</div>
      <div class="sig-line"></div>
      <div class="sig-label">End Date</div>
    </div>
  </div>
</div>
</body>
</html>`;
  };

  // ── WEB: write HTML into a blob URL (no about:blank) ──────────────────────
  const handleDownloadWeb = (item: any) => {
    const userName =
      (typeof localStorage !== "undefined" ? localStorage.getItem("userName") : null) ?? "Student";
    const html = buildCertHTML(item, userName);
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, "_blank");
    if (!win) { alert("Please allow pop-ups to open the certificate."); return; }
    setTimeout(() => { win.focus(); win.print(); }, 1200);
  };

  // ── NATIVE download: expo-print → MediaLibrary (Android) / Sharing (iOS) ─
  const handleDownloadNative = async (item: any) => {
    const userName = (await AsyncStorage.getItem("userName")) ?? "Student";
    const html = buildCertHTML(item, userName);
    const { uri } = await Print.printToFileAsync({ html, base64: false, width: 842, height: 595 });
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Save Certificate", UTI: "com.adobe.pdf" });
  };

  const handleDownload = async (item: any) => {
    setDownloading(item.id);
    try {
      if (Platform.OS === "web") {
        // Web is synchronous — clear spinner immediately after opening tab
        handleDownloadWeb(item);
      } else {
        await handleDownloadNative(item);
      }
    } catch (err) {
      console.log("Download error:", err);
      if (Platform.OS === "web") {
        alert("Failed to open certificate. Please try again.");
      } else {
        Alert.alert("Error", "Failed to generate certificate. Please try again.");
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? "#101010" : "#F9FBFF" }]}
    >
        {/* Sticky Header */}
        <View
          style={[
            styles.stickyHeader,
            { paddingTop: Platform.OS === "ios" ? 60 : (StatusBar.currentHeight ?? 24) + 20 },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Certificates</Text>
            <Text style={styles.smallText}>
              {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} enrolled
            </Text>
          </View>

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

          <View style={styles.progressCard}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="certificate" color="#fff" size={28} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Keep Learning!</Text>
              <Text style={styles.progressSubtitle}>
                {completedCount} of {certificates.length} completed
              </Text>
            </View>
          </View>
        </View>

        {/* Scrollable Content */}
        <View style={{ height: CONTENT_HEIGHT, marginTop: HEADER_HEIGHT }}>
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF6A00"]} tintColor="#FF6A00" />}
          >
            {loading && (
              <View style={styles.loadingContainer}>
                <MaterialCommunityIcons name="certificate" size={60} color="#ccc" />
                <Text style={styles.loadingText}>Loading certificates...</Text>
              </View>
            )}

            {!loading &&
              filtered.map((item) => (
                <View key={item.id} style={styles.certificateCard}>
                  <View style={styles.certificateImageWrapper}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.certificateImage} />
                    ) : (
                      <View style={[styles.certificateImage, { backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center" }]}>
                        <MaterialCommunityIcons name="image-off-outline" size={40} color="#ccc" />
                      </View>
                    )}
                    <View style={[styles.statusBadge, item.status === "COMPLETED" ? styles.statusCompleted : styles.statusPending]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.certCourse}>{item.course}</Text>

                  <View style={styles.details}>
                    <MaterialCommunityIcons name="certificate-outline" size={18} color="#666" />
                    <Text style={styles.detailsText}>
                      {item.status === "COMPLETED" ? "Certificate Awarded" : "Complete course to earn certificate"}
                    </Text>
                  </View>

                  <Text style={styles.credential}>ID: {item.id}</Text>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.downloadBtn, !item.canDownload && styles.btnDisabled]}
                      disabled={!item.canDownload || downloading === item.id}
                      onPress={() => handleDownload(item)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="download-outline" size={18} color="#fff" />
                      <Text style={styles.btnText}>
                        {downloading === item.id ? "Opening..." : "Download"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.shareBtn, !item.canShare && styles.btnDisabled]}
                      disabled={!item.canShare}
                      onPress={() => handleShare(item.course, item.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="share-social-outline"
                        size={18}
                        color={item.canShare ? "#FF6A00" : "#999"}
                      />
                      <Text style={[styles.shareBtnText, !item.canShare && { color: "#999" }]}>
                        Share
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

            {!loading && filtered.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="certificate-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>No certificates found</Text>
                <Text style={styles.emptySubtext}>
                  {search ? "Try a different search term" : "Complete courses to earn certificates"}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stickyHeader: {
    height: HEADER_HEIGHT, backgroundColor: "#F9FBFF", paddingHorizontal: 20,
    justifyContent: "center", borderBottomWidth: 1, borderBottomColor: "#eee",
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
  },
  header: { marginBottom: 16 },
  pageTitle: { fontSize: 32, fontWeight: "700", color: "#0D1B2A", marginBottom: 4 },
  smallText: { fontSize: 14, color: "#667085" },
  searchBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 12, paddingHorizontal: 16, height: 50, marginBottom: 16,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  searchInput: { marginLeft: 10, flex: 1, fontSize: 15, color: "#333" },
  progressCard: {
    backgroundColor: "#FF6A00", borderRadius: 16, padding: 20,
    flexDirection: "row", alignItems: "center",
    elevation: 4, shadowColor: "#FF6A00", shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8,
  },
  iconCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  progressInfo: { marginLeft: 16, flex: 1 },
  progressTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 4 },
  progressSubtitle: { fontSize: 14, color: "#fff", opacity: 0.9 },
  scrollContainer: { paddingHorizontal: 20, backgroundColor: "#F9FBFF" },
  loadingContainer: { alignItems: "center", paddingVertical: 60 },
  loadingText: { marginTop: 16, fontSize: 16, color: "#888" },
  certificateCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16,
    elevation: 3, shadowColor: "#000", shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 8,
  },
  certificateImageWrapper: {
    width: "100%", height: 160, borderRadius: 12, overflow: "hidden",
    marginBottom: 16, position: "relative", backgroundColor: "#f0f0f0",
  },
  certificateImage: { width: "100%", height: "100%", resizeMode: "cover" },
  statusBadge: { position: "absolute", top: 12, right: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusCompleted: { backgroundColor: "#34A853" },
  statusPending: { backgroundColor: "#FF9800" },
  statusText: { color: "#fff", fontWeight: "700", fontSize: 11, textTransform: "uppercase" },
  certCourse: { fontSize: 20, fontWeight: "700", color: "#0D1B2A", marginBottom: 12 },
  details: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailsText: { fontSize: 14, color: "#666", marginLeft: 8 },
  credential: { fontSize: 13, color: "#999", marginBottom: 16 },
  buttonRow: { flexDirection: "row", gap: 12 },
  downloadBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#1A73E8", paddingVertical: 12, borderRadius: 10, gap: 6,
  },
  shareBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#FF6A00",
    paddingVertical: 12, borderRadius: 10, gap: 6,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  shareBtnText: { color: "#FF6A00", fontSize: 14, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: "600", color: "#666", marginTop: 16 },
  emptySubtext: { fontSize: 14, color: "#999", marginTop: 8, textAlign: "center" },
});