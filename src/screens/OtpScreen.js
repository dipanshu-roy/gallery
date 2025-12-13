import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Keyboard,
    Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import BottomAlert from "../components/BottomAlert";
import CustomButton from "../components/CustomButton";
import Glow from '../assets/images/bg_image.png';
import { saveToken } from "../storage/storage";


export default function OtpScreen({ route, navigation }) {
    const { token } = route.params;
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputs = useRef([]);

    const [timer, setTimer] = useState(30);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("error");
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);

    const showAlert = (msg, type = "error") => {
        setAlertMessage(msg);
        setAlertType(type);
        setAlertVisible(true);
    };
    useEffect(() => {
        if (timer === 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (text, index) => {
        if (!/^[0-9]?$/.test(text)) return;

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text !== "" && index < 5) {
            inputs.current[index + 1].focus();
        }

        // if (index === 5 && text !== "") {
        //     Keyboard.dismiss();
        //     verifyOtp(newOtp.join(""));
        // }
    };

    const verifyOtp = async (finalOtp) => {
  if (verifying) return;

  if (finalOtp.length < 6) {
    showAlert("Enter complete 6-digit OTP");
    return;
  }

  try {
    setVerifying(true);

    const res = await fetch("http://43.205.125.181/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token, // ✅ same as old working code
      },
      body: JSON.stringify({ otp: finalOtp }),
    });

    const data = await res.json();

    if (data.status === 200) {
      showAlert("OTP Verified Successfully!", "success");

      // ✅ SAVE SAME TOKEN (THIS IS THE KEY)
      await saveToken(token);

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        });
      }, 800);
    } else {
      showAlert(data.message || "Invalid OTP");
    }
  } catch (e) {
    showAlert("Something went wrong!");
  } finally {
    setVerifying(false);
  }
};



    const resendOtp = async () => {
        if (resending) return;

        setTimer(30);
        try {
            setResending(true);

            const res = await fetch("http://43.205.125.181/api/resend-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (data.status === 200) {
            showAlert("OTP Sent Again!", "success");
            } else {
            showAlert(data.message);
            }
        } catch (err) {
            showAlert("Could not resend OTP");
        } finally {
            setResending(false);
        }
        };

    return (
        <LinearGradient
            colors={["#06071C", "#0A0C2A", "#0E102F"]}
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
                <Text style={styles.title}>Verify OTP</Text>
                <Text style={styles.subtitle}>Enter the 4-digit code sent to you</Text>

                {/* OTP Boxes */}
                <View style={styles.otpRow}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputs.current[index] = ref)}
                            value={digit}
                            keyboardType="number-pad"
                            maxLength={1}
                            onChangeText={(text) => handleChange(text, index)}
                            style={styles.otpInput}
                        />
                    ))}
                </View>

                <Text style={styles.timerText}>
                    Resend OTP in {timer}s
                </Text>

                <TouchableOpacity
                    disabled={timer !== 0}
                    onPress={resendOtp}
                >
                    <Text
                        style={[
                            styles.resendText,
                            { opacity: timer === 0 ? 1 : 0.3 },
                        ]}
                    >
                        Resend OTP
                    </Text>
                </TouchableOpacity>

                <CustomButton
                    title="Verify OTP"
                    disabled={verifying}
                    onPress={() => verifyOtp(otp.join(""))}
                />
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
        padding: 25,
        justifyContent: "center",
    },
    logoTab: {
        width: "100%",
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        color: "#fff",
        fontSize: 26,
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle: {
        color: "#bfc0d4",
        textAlign: "center",
        fontSize: 14,
        marginBottom: 40,
    },
    otpRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 25,
    },
    otpInput: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: "#14162F",
        borderWidth: 1,
        borderColor: "#3C3E63",
        textAlign: "center",
        fontSize: 22,
        color: "#fff",
        fontWeight: "600",
    },
    timerText: {
        color: "#d4d4d4",
        textAlign: "center",
        marginBottom: 10,
    },
    resendText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        marginBottom: 30,
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
