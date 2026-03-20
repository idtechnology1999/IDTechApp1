import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  Image,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 83 : 56;
const HEADER_HEIGHT = 240; // Header + Search + Tabs
const CONTENT_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - HEADER_HEIGHT;

export default function CoursesScreen() {
  const isDark = useColorScheme() === "dark";
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (!email) return;

        const response = await axios.post(
          `${apiUrl}/api/mobile/profile`,
          { email }
        );

        if (response.data.status) {
          const userData = response.data.data;

          // New API returns courses as array of { name, certificate, image }
          const userCourses: { name: string; certificate: string; image: string | null }[] =
            Array.isArray(userData.courses) ? userData.courses : [];

          const updatedCourses = userCourses.map((c) => ({
            id: Math.random().toString(36).substr(2, 9),
            title: c.name,
            certificate: c.certificate,
            status: c.certificate === "Completed" ? "Completed" : "Ongoing",
            image: c.image || null,
          }));

          setCourses(updatedCourses);
        }
      } catch (error) {
        console.log("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Navigate to video screen with course name
  const handleCourseClick = (courseName: string) => {
    router.push({
      pathname: "/Video",
      params: { course: courseName },
    });
  };

  // Filter courses based on tab and search
  const filteredCourses = courses.filter((course) => {
    if (activeTab !== "All" && course.status !== activeTab) return false;
    return course.title.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading courses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#101010" : "#F9FBFF" }]}>
      {/* Sticky Header */}
      <View
        style={[
          styles.stickyHeader,
          {
            paddingTop:
              Platform.OS === "ios"
                ? 60
                : (StatusBar.currentHeight ?? 24) + 20,
          },
        ]}
      >
        <View style={styles.topSection}>
          <Text style={styles.pageTitle}>My Courses</Text>
          <Text style={styles.subText}>{courses.length} courses enrolled</Text>

          {/* Search */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              placeholder="Search courses..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {["All", "Ongoing", "Completed"].map((tab) => (
              <View key={tab} style={{ marginRight: 12 }}>
                <Text
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tabText, activeTab === tab && styles.activeTabText]}
                >
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.activeIndicator} />}
              </View>
            ))}
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
          {filteredCourses.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="book-off-outline"
                size={60}
                color="#ccc"
              />
              <Text style={styles.emptyText}>No courses found</Text>
              <Text style={styles.emptySubtext}>
                {search ? "Try a different search term" : "You haven't enrolled in any courses yet"}
              </Text>
            </View>
          ) : (
            filteredCourses.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => handleCourseClick(item.title)}
              >
                <Card style={styles.courseCard}>
                  <View style={styles.cardImageWrapper}>
                    <Image source={{ uri: item.image }} style={styles.image} />
                  </View>

                  <View style={{ padding: 16 }}>
                    <Text style={styles.courseTitle}>{item.title}</Text>

                    <View style={styles.row}>
                      <MaterialCommunityIcons
                        name={item.certificate === "Completed" ? "certificate" : "book-clock-outline"}
                        size={18}
                        color={item.certificate === "Completed" ? "#2ECC71" : "#FF6A00"}
                      />
                      <Text style={[styles.metaText, { color: item.certificate === "Completed" ? "#2ECC71" : "#FF6A00", fontWeight: "600" }]}>
                        {item.certificate === "Completed" ? "Certificate Earned" : "In Progress"}
                      </Text>
                    </View>

                    <View style={styles.progressFooter}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: item.certificate === "Completed" ? "#e6f9f0" : "#fff3e0" },
                        ]}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: item.certificate === "Completed" ? "#1a9e5a" : "#e65100" }}>
                          {item.status}
                        </Text>
                      </View>
                      <View style={styles.playBtn}>
                        <Ionicons name="play" size={22} color="#fff" />
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    height: HEADER_HEIGHT,
    backgroundColor: "#F9FBFF",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  topSection: {
    // No extra padding needed - handled by stickyHeader
  },
  scrollContainer: {
    paddingHorizontal: 16,
    backgroundColor: "#F9FBFF",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 5,
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: "#667085",
    marginBottom: 15,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  tabsRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  tabText: {
    fontSize: 15,
    color: "#8A8A8A",
    paddingBottom: 4,
  },
  activeTabText: {
    color: "#FF6A00",
    fontWeight: "700",
  },
  activeIndicator: {
    height: 3,
    backgroundColor: "#FF6A00",
    marginTop: 3,
    borderRadius: 20,
  },
  courseCard: {
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cardImageWrapper: {
    height: 150,
    backgroundColor: "#ccc",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF6A00",
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});