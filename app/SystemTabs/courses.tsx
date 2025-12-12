import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, ProgressBar } from "react-native-paper";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function CoursesScreen() {
  const isDark = useColorScheme() === "dark";

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const courses = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      duration: "12 weeks",
      modules: "18/24 modules",
      progress: 0.75,
      image: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg",
      status: "Ongoing",
    },
    {
      id: 2,
      title: "Graphic Design Essentials",
      duration: "8 weeks",
      modules: "24/24 modules",
      progress: 1,
      image: "https://images.pexels.com/photos/6175/art-colorful-colors-colours.jpg",
      status: "Completed",
    },
  ];

  const filteredCourses = courses.filter((course) => {
    if (activeTab !== "All" && course.status !== activeTab) return false;
    return course.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#101010" : "#F9FBFF" },
      ]}
    >
      {/* ---------- STICKY HEADER AREA ---------- */}
      <View style={styles.topSection}>
        <Text style={styles.pageTitle}>My Courses</Text>
        <Text style={styles.subText}>5 courses enrolled</Text>

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
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>

              {activeTab === tab && <View style={styles.activeIndicator} />}
            </View>
          ))}
        </View>


        
      </View>

      {/* ---------- CONTENT BELOW ---------- */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 16 }}
      >
        {filteredCourses.map((item) => (
          <Card key={item.id} style={styles.courseCard}>
            <View style={styles.cardImageWrapper}>
              <View style={styles.image} />
            </View>

            <View style={{ padding: 16 }}>
              <Text style={styles.courseTitle}>{item.title}</Text>

              {/* Row */}
              <View style={styles.row}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={18}
                  color="#555"
                />
                <Text style={styles.metaText}>{item.duration}</Text>

                <MaterialCommunityIcons
                  name="book-outline"
                  size={18}
                  color="#555"
                  style={{ marginLeft: 12 }}
                />
                <Text style={styles.metaText}>{item.modules}</Text>
              </View>

              <ProgressBar
                progress={item.progress}
                color="#1A73E8"
                style={styles.progressBar}
              />

              <View style={styles.progressFooter}>
                <Text style={styles.progressPercent}>
                  {Math.round(item.progress * 100)}%
                </Text>

                <View style={styles.playBtn}>
                  <Ionicons name="play" size={22} color="#fff" />
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* --------------------- Sticky Top Panel --------------------- */
  topSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#F9FBFF",
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 5,
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
    color: "#1A73E8",
    fontWeight: "700",
  },

  activeIndicator: {
    height: 3,
    backgroundColor: "#1A73E8",
    marginTop: 3,
    borderRadius: 20,
  },

  /* --------------------- Course Card --------------------- */

  courseCard: {
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 20,
    overflow: "hidden",
    elevation: 1,
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

  progressBar: {
    height: 6,
    borderRadius: 10,
    marginTop: 4,
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
    color: "#1A73E8",
  },

  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "#1A73E8",
    alignItems: "center",
    justifyContent: "center",
  },
});
