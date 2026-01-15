import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";

import { BASE_URL } from "../config/api";
import { getToken, removeToken } from "../storage/storage";

export default function AppHeader() {
  const navigation = useNavigation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest");

  /* ---------------- FETCH PROFILE ---------------- */
  const fetchProfile = async () => {
    try {
      const token = await getToken();

      if (!token) {
        setIsLoggedIn(false);
        setUserName("Guest");
        return;
      }

      setIsLoggedIn(true);

      const res = await axios.post(`${BASE_URL}profile`, {
        access_token: token,
      });
      if(res.data?.namr) {
        setUserName(res.data.namr);
      } else {
        setUserName("User");
      }
    } catch (err) {
      console.log("Profile fetch error:", err.message);
      setUserName("User");
    }
  };

  /* ---------------- REFRESH ON SCREEN FOCUS ---------------- */
  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  return (
    <View style={styles.header}>
      {/* LOGO */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          })
        }
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
      </TouchableOpacity>

      {/* PROFILE */}
      <TouchableOpacity
        style={styles.profileBox}
        onPress={() =>
          navigation.navigate(isLoggedIn ? "Profile" : "Login")
        }
        activeOpacity={0.8}
      >
        <Text style={styles.userName} numberOfLines={1}>
          {userName}
        </Text>
        <Image
          source={require("../assets/images/users.jpg")}
          style={styles.avatar}
        />
      </TouchableOpacity>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 80,
    paddingTop: 35,
    paddingHorizontal: 20,
    backgroundColor: "#fef1eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    width: 140,
    height: 30,
    resizeMode: "contain",
  },

  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: 160,
  },

  userName: {
    color: "#1f98e0",
    fontSize: 14,
    fontWeight: "600",
    maxWidth: 110,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#1f98e0",
  },
});
