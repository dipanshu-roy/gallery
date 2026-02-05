import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Linking
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../config/api";
import { getToken } from "../storage/storage";
import { Video } from "expo-av";
import BackIcon from "../assets/icons/angle-left.svg";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";


export default function ProgrammeMediaScreen({ navigation, route }) {
  const { type, programme_id } = route.params;

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programme, setProgramme] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [event, setEvent] = useState(null);
  const [favourites, setFavourites] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const capitalize = (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });


  useEffect(() => {
    fetchMedia(1);
  }, []);
  const downloadMedia = async (item) => {
    try {
      const { status } = await MediaLibrary.getPermissionsAsync(true);

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please enable media access in settings",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const fileName = item.file_url.split("/").pop();
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResult = await FileSystem.downloadAsync(
        item.file_url,
        fileUri
      );
      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

      Alert.alert("Downloaded", "Saved to gallery");
    } catch (e) {
      console.log("DOWNLOAD ERROR", e);
      Alert.alert("Error", "Download failed");
    }
  };
  const goNext = () => {
    if (currentIndex < media.length - 1) {
      setPreviewLoading(true);
      setCurrentIndex(prev => prev + 1);
    }
  };
  const goPrev = () => {
    if (currentIndex > 0) {
      setPreviewLoading(true);
      setCurrentIndex(prev => prev - 1);
    }
  };
  const toggleFavourite = async (item) => {
    const previousValue = favourites[item.id] || false;

    setFavourites(prev => ({
      ...prev,
      [item.id]: !previousValue,
    }));

    try {
      const token = await getToken();

      const res = await axios.post(`${BASE_URL}media/favourite`, {
        access_token: token,
        media_id: item.id,
      });

      console.log("FAV API RESPONSE:", res.data);

      setFavourites(prev => ({
        ...prev,
        [item.id]: res.data.is_favourite,
      }));
      fetchMedia();
    } catch (error) {
      console.log("FAV API ERROR:", error.response?.data || error.message);

      setFavourites(prev => ({
        ...prev,
        [item.id]: previousValue,
      }));

      Alert.alert("Error", "Failed to update favourite");
    }
  };
  const deleteMedia = (item) => {
    Alert.alert(
      "Delete media?",
      "This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(item.id);
              const token = await getToken();

              await axios.post(`${BASE_URL}media/delete`, {
                access_token: token,
                media_id: item.id,
              });

              setMedia(prev => prev.filter(m => m.id !== item.id));
            } catch (e) {
              Alert.alert("Delete failed");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };


  const fetchMedia = async (pageNo = 1) => {
    if (loadingMore || (!hasMore && pageNo !== 1)) return;

    if (pageNo === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const token = await getToken();

    try {
      const res = await axios.post(`${BASE_URL}programme/media`, {
        access_token: token,
        programme_id,
        type,
        page: pageNo,
      });

      if (res.data.status === 200) {
        const mediaData = res.data.media.data;
        const pagination = res.data.media.pagination;

        setProgramme(res.data.programme.name);
        setEvent(res.data.programme.event_date);

        setMedia(prev =>
          pageNo === 1 ? mediaData : [...prev, ...mediaData]
        );

        // build favourites map
        const favMap = {};
        mediaData.forEach(item => {
          favMap[item.id] = !!item.is_favourite;
        });
        setFavourites(prev => ({ ...prev, ...favMap }));

        setPage(pagination.current_page);
        setHasMore(pagination.has_more);
      }
    } catch (e) {
      console.log("MEDIA FETCH ERROR", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };



  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <BackIcon width={22} height={22} fill="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>{programme}</Text>
        <View style={{ width: 36 }} />
      </View>
      <Text style={styles.subTitle}>
        {capitalize(type)} • {formatDate(event)}
      </Text>


      <FlatList
        data={media}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.mediaBox}
            activeOpacity={0.85}
            onPress={() => {
              const index = media.findIndex(m => m.id === item.id);
              setCurrentIndex(index);
              setPreview(true);
              setPreviewType(item.type);
              setPreviewLoading(true);
            }}
          >
            {/* IMAGE / VIDEO THUMB */}
            <Image
              source={{ uri: item.thumb_url }}
              style={styles.image}
              resizeMode="cover"
            />

            {/* VIDEO PLAY ICON */}
            {item.type === "video" && (
              <Ionicons
                name="play-circle"
                size={32}
                color="#fff"
                style={styles.playIcon}
              />
            )}

            {/* ACTION OVERLAY */}
            <View style={styles.overlayActions}>
              {/* HEART */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => toggleFavourite(item)}
              >
              </TouchableOpacity>

              {/* DELETE */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => deleteMedia(item)}
              >
                {deletingId === item.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="trash-2" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={() => {
          if (hasMore && !loadingMore) {
            fetchMedia(page + 1);
          }
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : null
        }
      />
      {preview && (
        <View style={styles.previewOverlay}>
          {/* CLOSE */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setPreview(null)}
          >
            <Text style={{ color: "#fff", fontSize: 22 }}>✕</Text>
          </TouchableOpacity>

          {/* FAV */}
          <View style={styles.previewActions}>
            {/* FAV */}
            <TouchableOpacity
              onPress={() => toggleFavourite(media[currentIndex])}
              style={styles.actionBtn}
            >
              <Ionicons
                name={
                  favourites[media[currentIndex].id]
                    ? "heart"
                    : "heart-outline"
                }
                size={26}
                color={
                  favourites[media[currentIndex].id] ? "#ef4444" : "#fff"
                }
              />
            </TouchableOpacity>

            {/* DOWNLOAD */}
            <TouchableOpacity
              onPress={() => downloadMedia(media[currentIndex])}
              style={styles.actionBtn}
            >
              <Ionicons name="download-outline" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          {previewLoading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          {/* MEDIA */}
          {media[currentIndex].type === "photo" ? (
            <Image
              source={{ uri: media[currentIndex].file_url }}
              style={styles.previewMedia}
              resizeMode="contain"
              onLoadStart={() => setPreviewLoading(true)}
              onLoadEnd={() => setPreviewLoading(false)}
            />
          ) : (
            <Video
              source={{ uri: media[currentIndex].file_url }}
              style={styles.previewMedia}
              useNativeControls
              resizeMode="contain"
              shouldPlay
              onLoadStart={() => setPreviewLoading(true)}
              onLoad={() => setPreviewLoading(false)}
            />
          )}

          {/* PREV */}
          {currentIndex > 0 && (
            <TouchableOpacity style={styles.prevBtn} onPress={goPrev}>
              <Ionicons name="chevron-back" size={40} color="#fff" />
            </TouchableOpacity>
          )}

          {/* NEXT */}
          {currentIndex < media.length - 1 && (
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <Ionicons name="chevron-forward" size={40} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebe2e2ff",
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  title: {
    color: "#1f98e0",
    fontSize: 22,
    fontWeight: "700",
  },
  topBar: {
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBtn: {
    padding: 6,
    backgroundColor: "#1f98e0",
    borderRadius: 8,
  },
  mediaBox: {
    flex: 1 / 3,
    margin: 4,
    aspectRatio: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  videoBox: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: 6,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoTag: {
    position: "absolute",
    top: "40%",
    left: "45%",
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  subTitle: {
    color: "#333",
    fontSize: 14,
    marginBottom: 10,
  },

  videoPlay: {
    position: "absolute",
    top: "40%",
    left: "45%",
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },

  previewOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  previewMedia: {
    width: "100%",
    height: "80%",
  },

  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 101,
  },
  overlayActions: {
    position: "absolute",
    top: 1,
    right: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 5,
    paddingVertical: 4,
  },
  actionBtn: {
    padding: 1,
  },
  playIcon: {
    position: "absolute",
    top: "40%",
    left: "40%",
  },
  previewFav: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 101,
  },

  prevBtn: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: [{ translateY: -20 }],
  },

  nextBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -20 }],
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 200,
  },
  previewActions: {
    position: "absolute",
    top: 40,
    left: 20,
    flexDirection: "row",
    zIndex: 101,
  },
  actionBtn: {
    marginRight: 16,
  },

});
