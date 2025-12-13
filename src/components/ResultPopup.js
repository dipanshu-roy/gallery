import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ResultPopup({ visible, message, onHide }) {
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  const Icon = message?.icon;
  const rawMessage =
    typeof message === "string" ? message : message?.text || "";

  const isWin = rawMessage.toLowerCase().includes("win");
  // Entrance animation
  useEffect(() => {
    if (visible) {
      slideAnim.setValue(-150);
      scaleAnim.setValue(0.6);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Auto close after 2s
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      handleClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [visible]);

  // Close animation
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onHide());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
      ]}
    >
      <LinearGradient
        colors={
          isWin
            ? ["#27ff89", "#0f7b4b"]
            : ["#ff4d6d", "#7b0f2a"]
        }
        style={styles.border}
      >
        <View style={styles.innerBox}>

          <Pressable style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <View style={styles.row}>
            {Icon && (
              <Icon
                width={message?.width || 23}
                height={message?.height || 23}
                fill={message?.color || (isWin ? "#27FF89" : "#FF4D6D")}
                style={{ marginRight: 10 }}
              />
            )}

            <Text
              style={[
                styles.message,
                { color: message?.color || (isWin ? "#27FF89" : "#FF4D6D") },
              ]}
            >
            {rawMessage}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// --------------------- STYLES ---------------------
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  border: {
    padding: 1,
    borderRadius: 10,
  },
  innerBox: {
    backgroundColor: "rgba(15, 15, 25, 0.92)",
    paddingVertical: 14,
    borderRadius: 10,
    paddingHorizontal: 12,
    position: "relative",
  },

  row: {
    flexDirection: "row",
    paddingRight: 0,
  },

  closeBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 26,
    height: 26,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  closeText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  message: {
    fontSize: 18,
    fontWeight: "500",
  },
});
