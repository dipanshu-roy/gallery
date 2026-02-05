import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Linking,
  Alert
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../config/api";
import TopAlert from "../components/TopAlert";
import { getToken, removeToken } from "../storage/storage";
import ProgrammeListItem from "../components/ProgrammeListItem";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function DashboardScreen({ navigation }) {

  const [loading, setLoading] = useState(true);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [refreshing, setRefreshing] = useState(false);
  const [programmes, setProgrammes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);


  const filteredProgrammes = programmes.filter(item => {
    const matchesName = item.programme_name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesDate = selectedDate
      ? new Date(item.event_date).toDateString() ===
      new Date(selectedDate).toDateString()
      : true;

    return matchesName && matchesDate;
  });


  const showAlert = (msg, type = "error") => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProgrammes();
    }, [])
  );
  const shareProgrammeZip = async (programme) => {
    try {
      setZipLoading(true);

      const token = await getToken();

      const res = await axios.post(`${BASE_URL}programme/zip`, {
        access_token: token,
        programme_id: programme.id,
      });

      const zipUrl = res.data?.zip_url;

      if (!zipUrl) {
        Alert.alert("Error", "ZIP generation failed");
        return;
      }

      // 📤 Share via WhatsApp
      const message = `Download ZIP for "${programme.programme_name}":\n${zipUrl}`;
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);

      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // fallback: system share or browser
        Alert.alert(
          "WhatsApp not installed",
          "Copy link instead?",
          [
            {
              text: "Copy Link",
              onPress: () => Linking.openURL(zipUrl),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
      }
    } catch (e) {
      console.log("ZIP SHARE ERROR", e);
      Alert.alert("Error", "Unable to share ZIP link");
    } finally {
      setZipLoading(false);
    }
  };


  


  


  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const res = await axios.post(`${BASE_URL}programme`, {
        access_token: token,
      });

      if (res.data.status === 200) {
        setProgrammes(res.data.data);
      }
    } catch {
      await removeToken();
      navigation.replace("Login");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1f98e0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title_head}>Dashboard</Text>

      {zipLoading && (
        <View style={styles.zipLoader}>
          <ActivityIndicator size="large" color="#1f98e0" />
          <Text style={{ marginTop: 8 }}>Preparing ZIP…</Text>
        </View>
      )}
      <View style={styles.filterBar}>
        {/* SEARCH BY NAME */}
        <TextInput
          placeholder="Search programme name"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />

        {/* DATE FILTER */}
        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {selectedDate
              ? new Date(selectedDate).toLocaleDateString("en-GB")
              : "Filter by date"}
          </Text>
        </TouchableOpacity>

        {/* CLEAR */}
        {(searchText || selectedDate) && (
          <TouchableOpacity
            onPress={() => {
              setSearchText("");
              setSelectedDate(null);
            }}
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate ? new Date(selectedDate) : new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
      <FlatList
        data={filteredProgrammes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProgrammeListItem
            item={item}
            onPress={() =>
              navigation.navigate("MediaOverview", {
                programmeId: item.id,
              })
            }
            onDownloadZip={shareProgrammeZip}
          />
        )}
      />
      <TopAlert
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onHide={() => setAlertVisible(false)}
      />
    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebe2e2ff",
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 18,
    color: "#0f172a",
    letterSpacing: 0.3,
  },
  title_head: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.3,

    borderBottomWidth: 1,
    borderBottomColor: "#1f98e0",
    paddingBottom: 8,
    marginBottom: 16,
  },

  boxCount: {
    fontSize: 25,
    fontWeight: "800",
    color: "#1f98e0",
    lineHeight: 34,
  },

  boxTitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    letterSpacing: 0.3,
  },
  filterBar: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
  },

  dateBtn: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 6,
  },

  dateText: {
    color: "#475569",
    fontSize: 14,
  },

  clearText: {
    textAlign: "right",
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },
  zipLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },

});

