import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import FolderIcon from "../assets/icons/folder-open.svg";

export default function ProgrammeListItem({ item, onPress, onDownloadZip }) {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
      >
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
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          hitSlop={10}
        >
          <Feather name="more-vertical" size={18} color="#6b7280" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* DROPDOWN */}
      {menuVisible && (
        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onDownloadZip(item);
              }}
            >
              <Feather name="download" size={16} color="#111827" />
              <Text style={styles.menuText}>Download as ZIP</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}
    </>
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

  /* DROPDOWN */
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  dropdown: {
    position: "absolute",
    right: 16,
    top: 52,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 13,
    fontWeight: "500",
    color: "#111827",
  },
});

