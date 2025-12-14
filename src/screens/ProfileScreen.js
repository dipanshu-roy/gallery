import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getToken, removeToken } from "../storage/storage";
import Glow from '../assets/images/bg_image.png';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);
  

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      if (!token) return logout();

      const res = await fetch("http://3.110.147.202/api/profile-view/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token, // ✅ same auth style as your backend
        },
      });

      const data = await res.json();

      if (data.status === 200) {
        setProfile(data.data);
      } else {
        logout();
      }
    } catch (e) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
  if (loggingOut) return; // 🔒 BLOCK MULTIPLE CLICKS

  setLoggingOut(true);
  console.log("LOGOUT CLICKED");

  try {
    await removeToken();

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } catch (e) {
    console.log("Logout error", e);
    setLoggingOut(false); // fallback
  }
};


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00C8FF" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#06071C", "#0A0C2A", "#0E102F"]} style={{ flex: 1 }}>

  {/* 🌟 Background glow (screen-level) */}
  <Image source={Glow} style={styles.bottomGlowImage} resizeMode="contain" />

  {/* Content */}
  <View style={styles.container}>
    <Text style={styles.title}>My Profile</Text>

    <View style={styles.card}>
      <Text style={styles.label}>Username</Text>
      <Text style={styles.value}>{profile.username}</Text>

      <Text style={styles.label}>Email</Text>
      <Text style={styles.value}>{profile.email}</Text>

      <Text style={styles.label}>Mobile</Text>
      <Text style={styles.value}>{profile.mobile}</Text>
    </View>

    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  </View>

</LinearGradient>

  );
}
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#06071C",
  },
  container: {
    padding: 20,
    marginTop: 60,
    zIndex: 1, // 👆 content above
    },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#14162F",
    borderRadius: 14,
    padding: 20,
  },
  label: {
    color: "#8fa3bf",
    fontSize: 13,
    marginTop: 10,
  },
  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    // borderBottom:1
  },
  logoutBtn: {
    marginTop: 40,
    backgroundColor: "#a52834",
    paddingVertical: 14,
    borderRadius: 10,
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomGlowImage: {
    position: "absolute",
    bottom: -60,
    width: "140%",
    height: 220,
    left: "-20%",
    opacity: 0.9,
    pointerEvents: "none", // 🔑 THIS FIXES IT
  }
});
