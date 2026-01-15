import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL } from "../config/api";
import { getToken, removeToken } from "../storage/storage";
import Glow from "../assets/images/bg_image.png";
import ConfirmAlert from "../components/ConfirmAlert";
import BackIcon from "../assets/icons/angle-left.svg";
import SignOut from "../assets/icons/exit.svg";
import profileRules from "../assets/profile.json";


export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [openRule, setOpenRule] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);
  const validateProfile = (data) => {
    if (!data || typeof data !== "object") return false;

    const { namr, email, mobile } = data;

    if (!namr || typeof namr !== "string") return false;
    if (!email || typeof email !== "string") return false;
    if (!mobile || typeof mobile !== "string") return false;

    return true;
  };


  const fetchProfile = async () => {
    try {
      const token = await getToken();
      if (!token) {
        navigation.replace("Login");
        return;
      }

      const res = await fetch(`${BASE_URL}profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: token,
        }),
      });

      if (res.status === 401) {
        await logout();
        return;
      }

      const data = await res.json();

      if (!validateProfile(data)) {
        console.log("Invalid profile data:", data);
        await logout();
        return;
      }

      setProfile(data);
    } catch (e) {
      console.log("Profile error:", e);
      await logout();
    } finally {
      setLoading(false);
    }
  };



  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await removeToken();
    navigation.replace("Login");
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00C8FF" />
      </View>
    );
  }
  if (!profile) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#fff" }}>Profile not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={Glow} style={styles.bottomGlowImage} resizeMode="contain" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
          >
            <BackIcon width={24} height={24} fill="#fff" />
          </TouchableOpacity>

          <Text style={styles.title}>Profile</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.box}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={require("../assets/images/users.jpg")}
                style={styles.avatar}
              />
            </View>

            <View style={styles.detailsWrapper}>
              <Text style={styles.namr}>{profile.namr}</Text>
              <Text style={styles.label}>
                Email: <Text style={styles.value}>{profile.email}</Text>
              </Text>
              <Text style={styles.label}>
                Mobile: <Text style={styles.value}>{profile.mobile}</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setShowLogoutAlert(true)}
            >
              <SignOut width={20} height={20} fill="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {profileRules.map((item) => {
          const isOpen = openRule === item.id;

          return (
            <View key={item.id} style={styles.rulesCard}>
              <TouchableOpacity
                style={styles.rulesHeader}
                onPress={() => setOpenRule(isOpen ? null : item.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.rulesTitle}>{item.title}</Text>
                <Text style={styles.rulesToggle}>{isOpen ? "−" : "+"}</Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.rulesBody}>
                  {item.rules.map((rule, index) => (
                    <Text key={index} style={styles.ruleText}>
                      • {rule}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}


      </ScrollView>

      {/* LOGOUT CONFIRM */}
      <ConfirmAlert
        visible={showLogoutAlert}
        title="Sign Out"
        message="Do you want to sign out?"
        confirmText="Yes"
        cancelText="Cancel"
        onCancel={() => setShowLogoutAlert(false)}
        onConfirm={() => {
          setShowLogoutAlert(false);
          logout();
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1f98e0",
  },
  container: {
    flex: 1,
    backgroundColor: "#ebe2e2ff",
    paddingTop: 10,
    alignItems: "center",
  },
  title: {
    color: "#1f98e0",
    fontSize: 22,
    fontWeight: "700",
  },
  topBar: {
    width: "100%",
    paddingHorizontal: 20,
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

  box: {
    backgroundColor: "#1f98e0",
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#BFA14A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  detailsWrapper: {
    flex: 1,
  },

  namr: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  label: {
    color: "#ffffffff",
    fontSize: 12,
  },

  value: {
    color: "#fff",
    fontWeight: "600",
  },

  bottomGlowImage: {
    position: "absolute",
    bottom: -60,
    width: "140%",
    height: 220,
    left: "-20%",
    opacity: 0.9,
    pointerEvents: "none",
  },
  rulesCard: {
    width: "90%",
    backgroundColor: "#1f98e0",
    borderRadius: 14,
    marginTop: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1f98e0",
  },

  rulesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },

  rulesTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  rulesToggle: {
    color: "#FFD54A",
    fontSize: 22,
    fontWeight: "700",
  },

  rulesBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  ruleText: {
    color: "#ffffffff",
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 18,
  },

});
