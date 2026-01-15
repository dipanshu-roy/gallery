import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import FolderIcon from "../assets/icons/folder-open.svg";

export default function ProgrammeListItem({ item, onPress, onMenu }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {/* Left icon */}
      <View style={styles.iconBox}>
        <FolderIcon width={30} height={30} fill="#f7c241" />
      </View>

      {/* Title + subtitle */}
      <View style={styles.textBox}>
        <Text style={styles.title} numberOfLines={1}>
          {item.programme_name}
        </Text>
        <Text style={styles.subtitle}>
          {item.event_date} • {item.district_name}
        </Text>
      </View>

      {/* 3-dot menu */}
      <TouchableOpacity onPress={onMenu} hitSlop={10}>
        <Feather name="more-vertical" size={18} color="#6b7280" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  iconBox: {
    width: 36,
    alignItems: "center",
    marginRight: 12,
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
});
