import React from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Card, ProgressBar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 83 : 56;
const HEADER_HEIGHT = 90;
const CONTENT_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - HEADER_HEIGHT;

export default function Dashboard() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FBFF" }}>
      
      {/* STICKY HEADER */}
      <View style={styles.stickyHeader}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.username}>John Doe 👋</Text>
      </View>

      {/* SCROLL CONTENT */}
      <View style={{ height: CONTENT_HEIGHT, marginTop: HEADER_HEIGHT }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Card */}
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Overall Progress</Text>
                <Text style={styles.progressPercent}>72%</Text>
              </View>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  name="book-open-page-variant"
                  size={32}
                  color="#1A73E8"
                />
              </View>
            </View>

            <ProgressBar
              progress={0.72}
              color="#1A73E8"
              style={styles.progressBar}
            />
            <Text style={styles.subText}>1 of 3 courses completed</Text>
          </Card>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <MaterialCommunityIcons name="certificate" size={28} color="#F4A300" />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Certificates</Text>
            </View>

            <View style={styles.statBox}>
              <MaterialCommunityIcons name="book-outline" size={28} color="#4E8DF5" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>

            <View style={styles.statBox}>
              <MaterialCommunityIcons name="cash" size={28} color="#FF5757" />
              <Text style={styles.statNumber}>$150</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          {/* Continue Learning */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <Text style={styles.link}>See All</Text>
          </View>

          {[1, 2].map((item) => (
            <Card key={item} style={styles.courseCard}>
              <Image
                source={{
                  uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfTUMvCduGx5eIWqGhh3GfCSAjLukd5w-6qw&s",
                }}
                style={styles.courseImage}
              />
              <View style={styles.courseDetails}>
                <Text style={styles.courseTitle}>Web Development Fundamentals</Text>
                <Text style={styles.courseDuration}>12 weeks</Text>
              </View>
            </Card>
          ))}

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** Sticky Header **/
  stickyHeader: {
    height: HEADER_HEIGHT,
    backgroundColor: "#F9FBFF",
    paddingHorizontal: 16,
    paddingTop: 18,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },

  welcomeText: {
    fontSize: 16,
    color: "#555",
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
  },

  /** Scroll container **/
  container: {
    paddingHorizontal: 16,
    backgroundColor: "#F9FBFF",
  },

  progressCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  progressTitle: {
    fontSize: 16,
    color: "#777",
  },

  progressPercent: {
    fontSize: 28,
    fontWeight: "bold",
  },

  iconBox: {
    backgroundColor: "#E6F0FF",
    padding: 12,
    borderRadius: 50,
  },

  progressBar: {
    height: 8,
    borderRadius: 12,
    marginVertical: 8,
  },

  subText: {
    color: "#777",
    fontSize: 13,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statBox: {
    width: "30%",
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 16,
    elevation: 2,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 6,
  },

  statLabel: {
    fontSize: 12,
    color: "#777",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  link: {
    fontSize: 14,
    color: "#1A73E8",
  },

  courseCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 20,
  },

  courseImage: {
    width: "100%",
    height: 140,
  },

  courseDetails: {
    padding: 12,
  },

  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  courseDuration: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
});
