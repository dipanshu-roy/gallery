import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";

export default function BottomAlert({ visible, message, type = "error", onHide }) {
  const slideAnim = useRef(new Animated.Value(50)).current;  
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideAlert();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideAlert = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(onHide);
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], opacity },
        type === "error" && styles.error,
        type === "success" && styles.success,
        type === "info" && styles.info,
      ]}
    >
      <Text style={styles.text}>{message}</Text>

      {/* ❌ CLOSE BUTTON */}
      <TouchableOpacity style={styles.closeBtn} onPress={hideAlert}>
        <Text style={styles.closeText}>✖</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 35,
    left: 15,
    right: 15,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    flex: 1,
  },

  closeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  closeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  error: {
    backgroundColor: "#D0342C",
    borderLeftWidth: 4,
    borderLeftColor: "#FF736A",
  },

  success: {
    backgroundColor: "#2ECC71",
    borderLeftWidth: 4,
    borderLeftColor: "#A3F7BF",
  },

  info: {
    backgroundColor: "#3498DB",
    borderLeftWidth: 4,
    borderLeftColor: "#A8D8FF",
  },
});
