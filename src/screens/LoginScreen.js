import BottomAlert from "../components/BottomAlert";
import { saveToken } from "../storage/storage";
import WalletContext from "../components/WalletContext";
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../components/CustomButton';
import Glow from '../assets/images/bg_image.png';
import colors from '../styles/colors';
import theme from '../styles/theme';
import { Image } from 'react-native';


export default function LoginScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("phone"); // phone | email
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { refreshWallet } = useContext(WalletContext);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [submitting, setSubmitting] = useState(false);


  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setPhone(cleaned);
  };

  const showAlert = (msg, type = "error") => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertVisible(true);
  };
  const handleLogin = async () => {
  if (submitting) return; // prevent double click

  let username = "";

  if (activeTab === "phone") {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length !== 10) {
      showAlert("Enter valid 10-digit phone number");
      return;
    }
    username = cleaned;
  }

  if (activeTab === "email") {
    if (!email.includes("@") || !email.includes(".")) {
      showAlert("Enter a valid email address");
      return;
    }
    username = email.toLowerCase();
  }

  if (!password) {
    showAlert("Password is required");
    return;
  }

  try {
    setSubmitting(true); // 🔥 START LOADER

    const res = await fetch("http://43.205.125.181/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await res.json();
    console.log(data);

    if (data.status === 200) {
      await saveToken(data.token);

      await refreshWallet();

      showAlert("Login successful!", "success");

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        });
      }, 800);
    } else {
      showAlert(data.message || "Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
    showAlert("Something went wrong!");
  } finally {
    setSubmitting(false); // 🔥 STOP LOADER
  }
};




  return (
    <LinearGradient
      colors={["#06071C", "#0A0C2A", "#0E102F"]}
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
        <Text style={styles.headerTitle}>Log in</Text>
        <Text style={styles.subtitle}>
          Please log in with your phone number or email
        </Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "phone" && styles.activeTab]}
            onPress={() => setActiveTab("phone")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "phone" ? styles.activeTabText : styles.inactiveTabText
              ]}
            >
              Phone Number
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "email" && styles.activeTab]}
            onPress={() => setActiveTab("email")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "email" ? styles.activeTabText : styles.inactiveTabText
              ]}
            >
              Email Login
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "phone" && (
          <>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              placeholder="Enter phone number"
              placeholderTextColor={colors.gray}
              keyboardType="numeric"
              value={phone}
              onChangeText={handlePhoneChange}
              style={styles.input}
            />
          </>
        )}

        {/* Email Login */}
        {activeTab === "email" && (
          <>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={colors.gray}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />


          </>
        )}
        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.gray}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <CustomButton
          title="Login"
          onPress={handleLogin}
          loading={submitting}
          disabled={submitting}
        />


        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.switchText}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      </View>
      <BottomAlert
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onHide={() => setAlertVisible(false)}
      />

    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
    color: '#ffffffff',
    marginBottom: 30,
    fontSize: 13,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: "#0c1f4b"
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#feffffff',
  },
  inactiveTabText: {
    color: '#0c1f4b',
  },
  label: theme.text.label,
  input: theme.input,
  switchText: {
    marginTop: 20,
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomGlowImage: {
    position: "absolute",
    bottom: -60,
    width: "140%",
    height: 220,
    left: "-20%",
    opacity: 0.9
  }
});
