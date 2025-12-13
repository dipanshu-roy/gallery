import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomAlert from "../components/BottomAlert";
import CustomButton from '../components/CustomButton';
import colors from '../styles/colors';
import theme from '../styles/theme';
import Glow from '../assets/images/bg_image.png';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const [loading, setLoading] = useState(false);

  const showAlert = (msg, type = "error") => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertVisible(true);
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const isEmailValid = validateEmail(email);
  const isPhoneValid = phone.length === 10;


  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus(null);
      return;
    }
    const timeout = setTimeout(() => checkUsername(), 500);
    return () => clearTimeout(timeout);
  }, [username]);

  const checkUsername = async () => {
    try {
      const res = await fetch("http://43.205.125.181/api/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.available) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus("taken");
      }
    } catch (err) {
      console.log("Username check error:", err);
    }
  };

  const handleRegister = async () => {
    if (loading) return; // 🔒 prevent double submit

    if (!username) {
      showAlert("Username is required!", "error");
      return;
    }
    if (!validateEmail(email)) {
      showAlert("Enter a valid email address!", "error");
      return;
    }
    if (usernameStatus === "taken") {
      showAlert("Username is already taken!", "error");
      return;
    }
    if (!phone || !password || !cpassword) {
      showAlert("Phone, password & confirm password are required!", "error");
      return;
    }
    if (password !== cpassword) {
      showAlert("Passwords do not match!", "error");
      return;
    }

    try {
      setLoading(true); // 🔥 START LOADER

      const res = await fetch("http://43.205.125.181/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          confirm_password: cpassword,
          mobile: phone,
          email,
        }),
      });

      const data = await res.json();

      if (data.status === 200) {
        navigation.navigate("OtpScreen", { token: data.token });
      } else {
        showAlert(data.message || "Registration failed!", "error");
      }
    } catch (err) {
      showAlert("Something went wrong!", "error");
    } finally {
      setLoading(false); // 🔥 STOP LOADER
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

        <Text style={styles.headerTitle}>Register</Text>
        <Text style={styles.subtitle}>Create your account to continue</Text>

        {/* Username */}
        <Text style={styles.label}>Username</Text>
        <TextInput
          placeholder="Enter username"
          maxLength={8}
          placeholderTextColor={colors.gray}
          value={username}
          onChangeText={(text) => setUsername(text.toUpperCase())}
          style={styles.input}
        />
        {usernameStatus === "available" && (
          <Text style={{ color: "#198754", marginBottom: 10 }}>
            ✔ Username available
          </Text>
        )}
        {usernameStatus === "taken" && (
          <Text style={{ color: "#a52834", marginBottom: 10 }}>
            ✖ Username already taken
          </Text>
        )}

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          placeholder="Enter phone number"
          placeholderTextColor={colors.gray}
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, "");
            setPhone(cleaned);
          }}
          style={styles.input}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor={colors.gray}
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase())}
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.gray}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          placeholder="Confirm password"
          placeholderTextColor={colors.gray}
          secureTextEntry
          value={cpassword}
          onChangeText={setCpassword}
          style={styles.input}
        />

        <CustomButton
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          disabled={loading || !isPhoneValid || !isEmailValid}
        />
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.switchText}>
            Already have an account? Login
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
  logo: { width: 160, height: 60, resizeMode: "contain" },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    color: '#ffffffcc',
    marginBottom: 30,
    fontSize: 13,
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
  },
});
