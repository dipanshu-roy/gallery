// import React from "react";
// import { View, Image, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Glow from "../assets/images/bg_image.png";

// export default function Splash2({ navigation }) {
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <LinearGradient
//         colors={["#06071C", "#0A0C2A", "#0E102F"]}
//         style={StyleSheet.absoluteFillObject}
//       />

//       {/* Glow */}
//       <Image source={Glow} style={styles.glowBg} resizeMode="cover" />

//       {/* Content */}
//       <View style={styles.centerContent}>
//         <Text style={styles.title}>Splash 2</Text>

//         <Image
//           source={require("../assets/images/logo.png")}
//           style={styles.icon}
//         />

//         <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />

//         <View style={styles.row}>
//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.buttonText}>⬅ Prev</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.button}
//             onPress={() => navigation.replace("Dashboard")}
//           >
//             <Text style={styles.buttonText}>Next ➜</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   glowBg: {
//     ...StyleSheet.absoluteFillObject,
//     opacity: 0.35,
//   },

//   centerContent: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   title: {
//     fontSize: 26,
//     color: "#fff",
//     marginBottom: 20,
//     fontWeight: "600",
//   },

//   icon: {
//     width: 150,
//     height: 150,
//     resizeMode: "contain",
//     marginBottom: 20,
//   },

//   row: {
//     flexDirection: "row",
//     gap: 20,
//     marginTop: 35,
//   },

//   button: {
//     paddingVertical: 12,
//     paddingHorizontal: 25,
//     borderRadius: 30,
//     backgroundColor: "rgba(255,255,255,0.15)",
//   },

//   buttonText: {
//     color: "#fff",
//     fontSize: 18,
//   },
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Glow from '../assets/images/bg_image.png';

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

        <Text style={styles.headerTitle}>Play. Earn. Repeat.</Text>
        <Text style={styles.subtitle}>
          More you play, more you earn. Win huge prizes every day!
        </Text>

        {/* Centered Button */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <Text style={styles.buttonText}>Home ➜</Text>
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
