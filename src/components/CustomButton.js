import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function CustomButton({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  loading,   // <-- NEW
}) {
  const isDisabled = disabled || loading;

  // When disabled → use dim colors
  const gradientColors = isDisabled
    ? ["#4a4a4a", "#6b6b6b"]
    : ["#1f98e0", "#1f98e0"];

  return (
    <TouchableOpacity
      onPress={!isDisabled ? onPress : null}
      activeOpacity={isDisabled ? 1 : 0.7}
      style={[styles.wrapper, style, isDisabled && styles.disabledWrapper]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btn, isDisabled && styles.disabledBtn]}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={[styles.txt, textStyle, isDisabled && styles.disabledTxt]}>
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingTop: 5,
  },
  btn: {
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  txt: {
    color: "#f8f8f8",
    fontSize: 22,
    fontWeight: "600",
  },
  disabledWrapper: {
    opacity: 0.7,
  },
  disabledTxt: {
    color: "#e0e0e0",
  },
});
