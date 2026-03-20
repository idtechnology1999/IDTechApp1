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
  const [certificates, setCertificates] = useState<any[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const swipeConfig = {
    velocityThreshold: 0.25,
    directionalOffsetThreshold: 70,
  };

  useEffect(() => {
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
    const months   = item.isUnlimited ? 12 : (item.durationMonths || 1);
    const start    = new Date(item.startDate || Date.now());
    const end      = new Date(start);
    end.setMonth(end.getMonth() + months);
    const duration = item.isUnlimited
      ? "Unlimited Access (12 Months)"
      : `${months} Month${months > 1 ? "s" : ""}`;
    const issued   = start.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const expires  = end.toLocaleDateString("en-GB",   { day: "2-digit", month: "long", year: "numeric" });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@700&family=Inter:wght@400;600&display=swap');
    @page { size: A4 landscape; margin: 0; }
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:297mm; height:210mm; background:#fff; font-family:'Inter',sans-serif; overflow:hidden; }
    .cert {
      width:297mm; height:210mm; position:relative; background:#fff;
      background-image:radial-gradient(circle,#d4d4d4 1px,transparent 1px);
      background-size:22px 22px; border:3px solid #c9a84c; overflow:hidden;
    }
    .corner-tl{position:absolute;top:0;left:0;width:280px;height:280px;background:linear-gradient(135deg,#0a3d2e 60%,transparent 60%);z-index:2}
    .corner-br{position:absolute;bottom:0;right:0;width:200px;height:200px;background:linear-gradient(315deg,#0a3d2e 60%,transparent 60%);z-index:2}
    .stripe{position:absolute;z-index:3}
    .stripe-1{top:30px;left:-20px;width:340px;height:14px;background:linear-gradient(90deg,#c9a84c,#f5e17a,#c9a84c);transform:rotate(45deg);transform-origin:left center}
    .stripe-2{top:50px;left:-20px;width:340px;height:8px;background:linear-gradient(90deg,#c9a84c,#f5e17a,#c9a84c);transform:rotate(45deg);transform-origin:left center}
    .stripe-3{top:65px;left:-20px;width:340px;height:4px;background:linear-gradient(90deg,#c9a84c,#f5e17a,#c9a84c);transform:rotate(45deg);transform-origin:left center}
    .stripe-4{bottom:30px;right:-20px;width:280px;height:14px;background:linear-gradient(90deg,#c9a84c,#f5e17a,#c9a84c);transform:rotate(45deg);transform-origin:right center}
    .stripe-5{bottom:50px;right:-20px;width:280px;height:8px;background:linear-gradient(90deg,#c9a84c,#f5e17a,#c9a84c);transform:rotate(45deg);transform-origin:right center}
    .tick{position:absolute;z-index:4}
    .tick-tr{top:16px;right:16px;width:2px;height:30px;background:#c9a84c}
    .tick-tr2{top:16px;right:16px;width:30px;height:2px;background:#c9a84c}
    .tick-bl{bottom:16px;left:16px;width:2px;height:30px;background:#c9a84c}
    .tick-bl2{bottom:16px;left:16px;width:30px;height:2px;background:#c9a84c}
    .badge{position:absolute;top:28px;left:28px;z-index:10;width:90px;height:90px;background:radial-gradient(circle,#f5e17a 30%,#c9a84c 100%);border-radius:50%;border:3px solid #a07830;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 0 4px #0a3d2e,0 0 0 6px #c9a84c}
    .badge-year{font-size:9px;font-weight:700;color:#0a3d2e;letter-spacing:1px}
    .badge-award{font-size:13px;font-weight:800;color:#0a3d2e}
    .badge-stars{font-size:8px;color:#0a3d2e;letter-spacing:2px}
    .content{position:absolute;top:0;left:0;right:0;bottom:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 80px 20px 200px;text-align:center}
    .cert-label{font-family:'Cinzel',serif;font-size:36px;font-weight:700;color:#0a3d2e;letter-spacing:6px;margin-bottom:2px}
    .cert-sub{background:#0a3d2e;color:#fff;font-size:11px;letter-spacing:4px;text-transform:uppercase;padding:4px 18px;margin-bottom:20px}
    .student-name{font-family:'Great Vibes',cursive;font-size:58px;color:#0a3d2e;line-height:1.1;margin-bottom:6px}
    .name-line{width:60%;height:1.5px;background:#0a3d2e;margin:0 auto 18px}
    .body-text{font-size:13px;color:#444;line-height:1.8;max-width:480px}
    .course-name{font-weight:700;color:#0a3d2e}
    .footer{position:absolute;bottom:36px;left:0;right:0;z-index:6;display:flex;justify-content:space-around;align-items:flex-end;padding:0 120px 0 200px}
    .sig-block{text-align:center}
    .sig-line-f{width:140px;border-top:1.5px solid #0a3d2e;margin:0 auto 4px}
    .sig-label{font-size:10px;font-weight:700;color:#0a3d2e;letter-spacing:1px;text-transform:uppercase}
    .date-val{font-size:14px;font-weight:600;color:#0a3d2e;margin-bottom:4px}
    .company{position:absolute;top:20px;right:24px;z-index:6;text-align:right}
    .company-name{font-family:'Cinzel',serif;font-size:11px;color:#0a3d2e;font-weight:700;letter-spacing:1px}
  </style>
</head>
<body>
  <div class="cert">
    <div class="corner-tl"></div><div class="corner-br"></div>
    <div class="stripe stripe-1"></div><div class="stripe stripe-2"></div>
    <div class="stripe stripe-3"></div><div class="stripe stripe-4"></div>
    <div class="stripe stripe-5"></div>
    <div class="tick tick-tr"></div><div class="tick tick-tr2"></div>
    <div class="tick tick-bl"></div><div class="tick tick-bl2"></div>
    <div class="badge">
      <div class="badge-stars">★ ★ ★</div>
      <div class="badge-year">${new Date().getFullYear()}</div>
      <div class="badge-award">AWARD</div>
      <div class="badge-stars">★ ★ ★</div>
    </div>
    <div class="company"><div class="company-name">IDTECH REAL WORLD INNOVATIONS</div></div>
    <div class="content">
      <div class="cert-label">CERTIFICATE</div>
      <div class="cert-sub">OF COMPLETION</div>
      <div class="student-name">${userName}</div>
      <div class="name-line"></div>
      <div class="body-text">
        has successfully completed the course<br/>
        <span class="course-name">${item.course}</span><br/><br/>
        Duration: ${duration} &nbsp;|&nbsp; Issued: ${issued} &nbsp;|&nbsp; Expires: ${expires}
      </div>
    </div>
    <div class="footer">
      <div class="sig-block">
        <div class="sig-line-f"></div>
        <div class="sig-label">Director's Signature</div>
      </div>
      <div class="sig-block">
        <div class="date-val">${issued}</div>
        <div class="sig-line-f"></div>
        <div class="sig-label">Date</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  // ── WEB download: open new tab → auto-trigger browser Print → Save as PDF ─
  const handleDownloadWeb = (item: any) => {
    const userName =
      (typeof localStorage !== "undefined" ? localStorage.getItem("userName") : null) ?? "Student";

    const html = buildCertHTML(item, userName);

    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-ups for this site so the certificate can open.");
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();

    // Wait for fonts/layout, then show print dialog (Ctrl+P → Save as PDF)
    setTimeout(() => {
      win.focus();
      win.print();
    }, 900);
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
    <GestureRecognizer style={{ flex: 1 }} config={swipeConfig}>
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
    </GestureRecognizer>
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