import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Glow from '../assets/images/bg_image.png';
console.log("RUNNING ON:", Platform.OS);
export default function Splash1({ navigation }) {
  return (
    <LinearGradient
      colors={["#06071C", "#0A0C2A", "#0E102F"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        
        {/* Glow background */}
        <Image source={Glow} style={styles.bottomGlowImage} resizeMode="contain" />

        {/* Logo */}
        <View style={styles.logoTab}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.headerTitle}>Play & Win Daily!</Text>
        <Text style={styles.subtitle}>
          Play exciting games and stand a chance to win ₹1 Crore every day!
        </Text>

        {/* Centered Button */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Splash2")}
          >
            <Text style={styles.buttonText}>Next ➜</Text>
          </TouchableOpacity>
        </View>

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
    width: 160,
    height: 60,
    resizeMode: "contain",
  },

  headerTitle: {
    fontSize: 30,
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
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: 'center',
  },
});
