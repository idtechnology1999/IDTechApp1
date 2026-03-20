import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native-paper";
import { Video as ExpoVideo, ResizeMode } from "expo-av";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";

// Import ScreenOrientation dynamically
let ScreenOrientation: any;

try {
  ScreenOrientation = require('expo-screen-orientation');
} catch (error) {
  console.warn('expo-screen-orientation not installed. Please run: npx expo install expo-screen-orientation');
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 83 : 56;
const HEADER_HEIGHT = Platform.OS === "ios" ? 70 : 60;
const VIDEO_PLAYER_HEIGHT = 250;
const VIDEO_INFO_HEIGHT = 200;
const STICKY_SECTION_HEIGHT = VIDEO_PLAYER_HEIGHT + VIDEO_INFO_HEIGHT;
const CONTENT_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - STICKY_SECTION_HEIGHT - HEADER_HEIGHT;

// PiP (Picture-in-Picture) constants
const PIP_WIDTH = 160;
const PIP_HEIGHT = 90;
const PIP_MARGIN = 16;

interface VideoLesson {
  id: string;
  title: string;
  course: string;
  duration: string;
  videoUrl: string;
  description: string;
  views: number;
  uploadDate: string;
  fileName: string;
}

export default function Video() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedCourse = params.course as string;

  const videoRef = useRef<ExpoVideo>(null);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoLesson | null>(null);
  const [courseImageMap, setCourseImageMap] = useState<Record<string, string | null>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState(selectedCourse || "All");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiPMode, setIsPiPMode] = useState(false); // Picture-in-Picture mode

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  // Fetch user and videos from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        if (!email) {
          setLoading(false);
          return;
        }

        const userResponse = await axios.post(
          `${apiUrl}/api/mobile/profile`,
          { email }
        );

        if (userResponse.data.status) {
          const userData = userResponse.data.data;
          setUser(userData);

          // Build course → image map from profile
          const imgMap: Record<string, string | null> = {};
          if (Array.isArray(userData.courses)) {
            userData.courses.forEach((c: any) => { imgMap[c.name] = c.image || null; });
          }
          setCourseImageMap(imgMap);

          const userCourses: string[] = userData.courseNames || [];

          let videosToFetch: VideoLesson[] = [];

          if (selectedCourse) {
            try {
              const courseResponse = await axios.get(
                `${apiUrl}/api/video/all?course=${encodeURIComponent(selectedCourse)}`
              );

              if (courseResponse.data.success) {
                videosToFetch = courseResponse.data.data.map((video: any) => ({
                  id: video._id,
                  title: video.title,
                  course: video.course,
                  duration: video.duration,
                  videoUrl: video.videoUrl,
                  description: video.description,
                  views: video.views || 0,
                  uploadDate: new Date(video.uploadDate || video.createdAt).toLocaleDateString(),
                  fileName: video.fileName,
                }));
              }
            } catch {
              const allVideosResponse = await axios.get(`${apiUrl}/api/video/all`);
              if (allVideosResponse.data.success) {
                videosToFetch = allVideosResponse.data.data
                  .filter((v: any) => v.course === selectedCourse)
                  .map((video: any) => ({
                    id: video._id,
                    title: video.title,
                    course: video.course,
                    duration: video.duration,
                    videoUrl: video.videoUrl,
                    description: video.description,
                    views: video.views || 0,
                    uploadDate: new Date(video.uploadDate || video.createdAt).toLocaleDateString(),
                    fileName: video.fileName,
                  }));
              }
            }
          } else {
            const allVideosResponse = await axios.get(`${apiUrl}/api/video/all`);
            if (allVideosResponse.data.success) {
              videosToFetch = allVideosResponse.data.data
                .filter((v: any) => userCourses.includes(v.course))
                .map((video: any) => ({
                  id: video._id,
                  title: video.title,
                  course: video.course,
                  duration: video.duration,
                  videoUrl: video.videoUrl,
                  description: video.description,
                  views: video.views || 0,
                  uploadDate: new Date(video.uploadDate || video.createdAt).toLocaleDateString(),
                  fileName: video.fileName,
                }));
            }
          }

          setVideos(videosToFetch);

          if (videosToFetch.length > 0) {
            setCurrentVideo(videosToFetch[0]);
          } else if (selectedCourse) {
            Alert.alert(
              "No Videos",
              `No videos available for ${selectedCourse} yet.`
            );
          }
        }
      } catch (error: any) {
        Alert.alert(
          "Error", 
          `Unable to load videos. ${error.message || 'Please check your connection.'}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCourse]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      const timeout = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showControls, isPlaying]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      setIsBuffering(status.isBuffering);
    }
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const onSliderValueChange = async (value: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = async () => {
    if (!ScreenOrientation) {
      Alert.alert("Feature Unavailable", "Please install expo-screen-orientation to use fullscreen mode");
      return;
    }

    try {
      if (isFullscreen) {
        // Exit fullscreen - return to portrait and unlock rotation
        await ScreenOrientation.unlockAsync();
        setIsFullscreen(false);
        setIsPiPMode(false);
      } else {
        // Enter fullscreen - lock to landscape
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
      }
    } catch (error) {
      console.log("Error toggling fullscreen:", error);
      Alert.alert("Error", "Could not toggle fullscreen mode");
    }
  };

  const togglePiPMode = () => {
    setIsPiPMode(!isPiPMode);
    setShowControls(false);
  };

  const exitPiPMode = () => {
    setIsPiPMode(false);
    setShowControls(true);
  };

  const selectVideo = async (video: VideoLesson) => {
    if (videoRef.current) {
      await videoRef.current.stopAsync();
    }
    setCurrentVideo(video);
    setIsPlaying(false);
    setPosition(0);
    setIsPiPMode(false); // Exit PiP when selecting new video

    try {
      await axios.get(`${apiUrl}/api/video/${video.id}`);
    } catch (error) {
      console.log("Error incrementing views:", error);
    }
  };

  const filteredVideos = selectedCourseFilter === "All"
    ? videos
    : videos.filter((v) => v.course === selectedCourseFilter);

  const availableCourses = Array.from(new Set(videos.map((v) => v.course)));
  const courses = ["All", ...availableCourses];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6A00" />
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Fullscreen mode with landscape lock
  if (isFullscreen && currentVideo) {
    return (
      <View style={styles.fullscreenContainer}>
        <StatusBar hidden />
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowControls(!showControls)}
          style={styles.fullscreenVideoWrapper}
        >
          <ExpoVideo
            ref={videoRef}
            source={{ uri: currentVideo.videoUrl }}
            style={styles.fullscreenVideo}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            shouldPlay={isPlaying}
          />

          {isBuffering && (
            <View style={styles.bufferingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          {showControls && (
            <View style={styles.fullscreenControlsOverlay}>
              <View style={styles.fullscreenTopBar}>
                <TouchableOpacity
                  style={styles.fullscreenBackButton}
                  onPress={toggleFullscreen}
                >
                  <Ionicons name="contract-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.fullscreenTitle} numberOfLines={1}>
                  {currentVideo.title}
                </Text>
                <TouchableOpacity
                  style={styles.pipButton}
                  onPress={togglePiPMode}
                >
                  <MaterialCommunityIcons name="picture-in-picture-bottom-right-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.playButton}
                onPress={togglePlayPause}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={60}
                  color="#fff"
                />
              </TouchableOpacity>

              <View style={styles.fullscreenBottomControls}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Slider
                  style={styles.fullscreenSlider}
                  minimumValue={0}
                  maximumValue={duration}
                  value={position}
                  onSlidingComplete={onSliderValueChange}
                  minimumTrackTintColor="#FF6A00"
                  maximumTrackTintColor="#fff"
                  thumbTintColor="#FF6A00"
                />
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={[
        styles.header,
        { 
          paddingTop: Platform.OS === "ios" ? 20 : (StatusBar.currentHeight || 0) + 15,
          height: HEADER_HEIGHT 
        }
      ]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0D1B2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Videos</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Picture-in-Picture Floating Video */}
      {isPiPMode && currentVideo && (
        <View style={styles.pipContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={exitPiPMode}
            style={styles.pipVideoWrapper}
          >
            <ExpoVideo
              ref={videoRef}
              source={{ uri: currentVideo.videoUrl }}
              style={styles.pipVideo}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              shouldPlay={isPlaying}
            />
            
            <TouchableOpacity
              style={styles.pipCloseButton}
              onPress={exitPiPMode}
            >
              <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pipPlayButton}
              onPress={togglePlayPause}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pipExpandButton}
              onPress={() => {
                setIsPiPMode(false);
                setShowControls(true);
              }}
            >
              <Ionicons name="expand-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.stickySection}>
        {!isPiPMode && (
          <View style={styles.videoContainer}>
            {currentVideo ? (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setShowControls(!showControls)}
                style={styles.videoWrapper}
              >
                <ExpoVideo
                  ref={videoRef}
                  source={{ uri: currentVideo.videoUrl }}
                  style={styles.video}
                  useNativeControls={false}
                  resizeMode={ResizeMode.CONTAIN}
                  onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                  shouldPlay={false}
                />

                {isBuffering && (
                  <View style={styles.bufferingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                  </View>
                )}

                {showControls && (
                  <View style={styles.controlsOverlay}>
                    <View style={styles.topControls}>
                      <TouchableOpacity
                        style={styles.pipIconButton}
                        onPress={togglePiPMode}
                      >
                        <MaterialCommunityIcons 
                          name="picture-in-picture-bottom-right-outline" 
                          size={24} 
                          color="#fff" 
                        />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={togglePlayPause}
                    >
                      <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={50}
                        color="#fff"
                      />
                    </TouchableOpacity>

                    <View style={styles.bottomControls}>
                      <Text style={styles.timeText}>{formatTime(position)}</Text>
                      <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        onSlidingComplete={onSliderValueChange}
                        minimumTrackTintColor="#FF6A00"
                        maximumTrackTintColor="#fff"
                        thumbTintColor="#FF6A00"
                      />
                      <Text style={styles.timeText}>{formatTime(duration)}</Text>
                      <TouchableOpacity
                        style={styles.fullscreenButton}
                        onPress={toggleFullscreen}
                      >
                        <Ionicons name="expand-outline" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.noVideoContainer}>
                <MaterialCommunityIcons name="video-off" size={60} color="#ccc" />
                <Text style={styles.noVideoText}>No video available</Text>
              </View>
            )}
          </View>
        )}

        {currentVideo && !isPiPMode && (
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {currentVideo.title}
            </Text>
            <View style={styles.videoMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.metaText}>{currentVideo.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="book-outline" size={14} color="#666" />
                <Text style={styles.metaText}>{currentVideo.course}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="eye-outline" size={14} color="#666" />
                <Text style={styles.metaText}>{currentVideo.views} views</Text>
              </View>
            </View>
            <Text style={styles.videoDescription} numberOfLines={2}>
              {currentVideo.description}
            </Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {courses.map((course) => (
            <TouchableOpacity
              key={course}
              style={[
                styles.filterBtn,
                selectedCourseFilter === course && styles.filterBtnActive,
              ]}
              onPress={() => setSelectedCourseFilter(course)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCourseFilter === course && styles.filterTextActive,
                ]}
              >
                {course}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.scrollableSection, { height: isPiPMode ? SCREEN_HEIGHT - TAB_BAR_HEIGHT - 100 : CONTENT_HEIGHT }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filteredVideos.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="video-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No videos found</Text>
            </View>
          ) : (
            filteredVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                style={[
                  styles.videoCard,
                  currentVideo?.id === video.id && styles.videoCardActive,
                ]}
                onPress={() => selectVideo(video)}
              >
                <View style={styles.thumbnailContainer}>
                  {courseImageMap[video.course] ? (
                    <Image
                      source={{ uri: courseImageMap[video.course]! }}
                      style={styles.thumbnailImage}
                    />
                  ) : (
                    <View style={styles.thumbnail}>
                      <Ionicons name="play-circle" size={40} color="#FF6A00" />
                    </View>
                  )}
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{video.duration}</Text>
                  </View>
                </View>

                <View style={styles.videoCardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <Text style={styles.cardCourse}>{video.course}</Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.viewsContainer}>
                      <Ionicons name="eye-outline" size={12} color="#667085" />
                      <Text style={styles.viewsText}>{video.views} views</Text>
                    </View>
                    <Text style={styles.uploadDate}>{video.uploadDate}</Text>
                  </View>
                </View>

                {currentVideo?.id === video.id && (
                  <View style={styles.playingIndicator}>
                    <MaterialCommunityIcons
                      name="equalizer"
                      size={20}
                      color="#FF6A00"
                    />
                  </View>
                )}
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
    backgroundColor: "#F9FBFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#F9FBFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D1B2A",
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  stickySection: {
    backgroundColor: "#F9FBFF",
    zIndex: 10,
  },
  videoContainer: {
    width: "100%",
    height: 250,
    backgroundColor: "#000",
  },
  videoWrapper: {
    width: "100%",
    height: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noVideoText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  bufferingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  topControls: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    padding: 12,
  },
  pipIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,106,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,106,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  fullscreenButton: {
    marginLeft: 8,
    padding: 4,
  },
  videoInfo: {
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 6,
  },
  videoMeta: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
  videoDescription: {
    fontSize: 13,
    color: "#667085",
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: "#FF6A00",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  scrollableSection: {
    paddingHorizontal: 16,
    backgroundColor: "#F9FBFF",
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 20,
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
  videoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  videoCardActive: {
    borderWidth: 2,
    borderColor: "#FF6A00",
  },
  thumbnailContainer: {
    width: 120,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  durationBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  videoCardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0D1B2A",
    marginBottom: 4,
  },
  cardCourse: {
    fontSize: 12,
    color: "#667085",
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewsText: {
    fontSize: 11,
    color: "#667085",
  },
  uploadDate: {
    fontSize: 10,
    color: "#98A2B3",
  },
  playingIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullscreenVideoWrapper: {
    flex: 1,
  },
  fullscreenVideo: {
    flex: 1,
  },
  fullscreenControlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
  },
  fullscreenBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,106,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenTitle: {
    flex: 1,
    marginHorizontal: 12,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  pipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,106,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenBottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  fullscreenSlider: {
    flex: 1,
    marginHorizontal: 12,
  },
  // Picture-in-Picture styles
  pipContainer: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT + PIP_MARGIN,
    right: PIP_MARGIN,
    width: PIP_WIDTH,
    height: PIP_HEIGHT,
    zIndex: 1000,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  pipVideoWrapper: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 8,
    overflow: "hidden",
  },
  pipVideo: {
    width: "100%",
    height: "100%",
  },
  pipCloseButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  pipPlayButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,106,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  pipExpandButton: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});