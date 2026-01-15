import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../config/api";
import { getToken } from "../storage/storage";
import { Video } from "expo-av";

export default function ProgrammeMediaScreen({ route }) {
  const { programmeId, programmeName } = route.params;

  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    const token = await getToken();

    const res = await axios.post(`${BASE_URL}programme/media`, {
      access_token: token,
      programme_id: programmeId,
    });

    if (res.data.status === 200) {
      setMedia(res.data.media);
    }

    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{programmeName}</Text>

      <FlatList
        data={media}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.mediaBox}>
            {item.type === "photo" ? (
              <Image source={{ uri: item.thumb_url }} style={styles.image} />
            ) : (
              <View style={styles.videoBox}>
                <Video
                  source={{ uri: item.file_url }}
                  style={styles.video}
                  resizeMode="cover"
                  useNativeControls={false}
                />
                <Text style={styles.videoTag}>▶</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
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
});
