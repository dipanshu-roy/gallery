import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Glow from "../assets/images/bg_image.png";
import { getToken } from "../storage/storage";
import { BASE_URL } from "../config/api";

export default function Splash1({ navigation }) {

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getToken();
      if (!token) {
        navigation.replace("Login");
        return;
      }
      const res = await fetch(`${BASE_URL}check-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: token }),
      });

      const data = await res.json();

      if (data.status === 200) {
        navigation.replace("Dashboard");
      } else {
        navigation.replace("Login");
      }
    } catch (error) {
      console.log("Token check error:", error);
      navigation.replace("Login");
    }
  };

  return (
    <LinearGradient
      colors={["#fef1eb", "#d7c5bcff", "#737293ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Image source={Glow} style={styles.bottomGlowImage} resizeMode="contain" />

        <View style={styles.logoTab}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.headerTitle}>Play & Win Daily!</Text>
        <Text style={styles.subtitle}>
          Checking your session...
        </Text>
      </View>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  gradient: { flex: 1 },

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',     // <-- Ensures horizontal centering
  },

  logoTab: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    width:200,
    height: 50,
    resizeMode: "contain",
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 6,
  },

  subtitle: {
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 30,
    fontSize: 13,
  },

  bottomGlowImage: {
    position: "absolute",
    bottom: -60,
    width: "140%",
    height: 220,
    left: "-20%",
    opacity: 0.9
  },

  /** FIX: Button centered **/
  buttonWrapper: {
    width: "100%",
    alignItems: "center",      //<-- centers the button horizontally
  },

  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    backgroundColor: "#1f98e0",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: 'center',
  },
});
