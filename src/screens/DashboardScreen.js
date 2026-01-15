import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../config/api";
import TopAlert from "../components/TopAlert";
import ProgrammeIcon from "../assets/icons/schedule.svg";
import DistrictIcon from "../assets/icons/qrcode-location.svg";
import LocationIcon from "../assets/icons/region-pin-alt.svg";
import { getToken, removeToken } from "../storage/storage";
import ProgrammeListItem from "../components/ProgrammeListItem";


export default function DashboardScreen({ navigation }) {
  const [counts, setCounts] = useState({
    districts: 0,
    locations: 0,
    programmes: 0,
  });
  const [loading, setLoading] = useState(true);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [refreshing, setRefreshing] = useState(false);
  const [programmes, setProgrammes] = useState([]);

  const showAlert = (msg, type = "error") => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardCounts();
      fetchProgrammes();
    }, [])
  );

  const fetchDashboardCounts = async () => {
    try {
      const token = await getToken();

      if (!token) {
        navigation.replace("Login");
        return;
      }

      const res = await axios.post(`${BASE_URL}dashboard-counts`, {
        access_token: token,
      });

      if (res.data?.status === 200) {
        setCounts(res.data.data);
      } else {
        showAlert(res.data?.message || "Failed to load dashboard data");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        await removeToken();
        navigation.replace("Login");
      } else {
        console.log("Dashboard error:", err.message);
        showAlert("Server error");
      }
    } finally {
      setLoading(false);
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

      <View style={styles.grid}>
        <DashboardBox
          title="Districts"
          count={counts.districts}
          Icon={DistrictIcon}
          onPress={() => navigation.navigate("District")}
        />

        <DashboardBox
          title="Locations"
          count={counts.locations}
          Icon={LocationIcon}
          onPress={() => navigation.navigate("Location")}
        />

        <DashboardBox
          title="Programmes"
          count={counts.programmes}
          Icon={ProgrammeIcon}
        />
      </View>
      <FlatList
        data={programmes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProgrammeListItem
            item={item}
            onPress={() =>
              navigation.navigate("MediaOverview", {
                programmeId: item.id,
              })
            }
            onMenu={() => {
              console.log("Menu for", item.id);
            }}
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

function DashboardBox({ title, count, Icon, onPress }) {
  return (
    <TouchableOpacity style={styles.box} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.iconWrap}>
        <Icon width={28} height={28} fill="#1f98e0" />
      </View>

      <Text style={styles.boxCount}>{count}</Text>
      <Text style={styles.boxTitle}>{title}</Text>
    </TouchableOpacity>
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

  /* -------- GRID -------- */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  box: {
    width: "30%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 18,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  iconWrap: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: "#e8f4ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  /* -------- TEXT -------- */
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
});

