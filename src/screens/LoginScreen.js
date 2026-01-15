import BottomAlert from "../components/BottomAlert";
import { saveToken } from "../storage/storage";
import { BASE_URL } from "../config/api";
import { Ionicons } from "@expo/vector-icons";

import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomButton from "../components/CustomButton";
import Glow from "../assets/images/bg_image.png";
import colors from "../styles/colors";
import theme from "../styles/theme";
import { Image } from "react-native";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showAlert = (msg, type = "error") => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (submitting) return;

    if (!email.includes("@") || !email.includes(".")) {
      showAlert("Enter a valid email address");
      return;
    }

    if (!password) {
      showAlert("Password is required");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`${BASE_URL}org-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password
        })
      });
      // console.log(`${BASE_URL}org-login`);
      const data = await res.json();
      console.log(data);
      if (data.status_code === 200) {
        await saveToken(data.access_token);
        console.log(data.access_token);
        showAlert("Login successful!", "success");
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }]
          });
        }, 500);
      } else {
        showAlert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      showAlert("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#fef1eb", "#d7c5bcff", "#737293ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    >
      <Image source={Glow} style={styles.bottomGlowImage} resizeMode="contain" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Logo */}
            <View style={styles.logoTab}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
              />
            </View>

            <Text style={styles.headerTitle}>Log in</Text>
            <Text style={styles.subtitle}>
              Please log in with your email and password
            </Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={colors.gray}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor={colors.gray}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.passwordInput}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline":"eye-off-outline"}
                  size={20}
                  color={colors.gray}
                />
              </TouchableOpacity>
            </View>

            <CustomButton
              title="Login"
              onPress={handleLogin}
              loading={submitting}
              disabled={submitting}
              style={styles.customButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    justifyContent: "center",
    padding: 20
  },
  logoTab: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40
  },
  logo: {
    width: 160,
    height: 60,
    resizeMode: "contain"
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    marginBottom: 6
  },
  subtitle: {
    textAlign: "center",
    color: "#ffffffff",
    marginBottom: 30,
    fontSize: 13
  },
  label: theme.text.label,
  input: theme.input,
  switchText: {
    marginTop: 20,
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500"
  },
  bottomGlowImage: {
    position: "absolute",
    bottom: -60,
    width: "140%",
    height: 220,
    left: "-20%",
    opacity: 0.9
  },
  customButton: {
    marginTop: 10
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    ...theme.input,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    height: "100%",
    top:-5,
    justifyContent: "center",
  },

});
