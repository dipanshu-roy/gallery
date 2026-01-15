import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function AppTable({ columns = [], data = [] }) {
  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* HEADER */}
          <View style={styles.headerRow}>
            {columns.map((col, index) => (
              <Text key={index} style={[styles.headerCell, { width: col.width || 120 }]}>
                {col.label}
              </Text>
            ))}
          </View>

          {/* ROWS */}
          {data.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          ) : (
            data.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={[
                  styles.dataRow,
                  rowIndex % 2 === 0 && styles.altRow,
                ]}
              >
                {columns.map((col, colIndex) => (
                  <Text
                    key={colIndex}
                    style={[styles.dataCell, { width: col.width || 120 }]}
                    numberOfLines={1}
                  >
                    {row[col.key] ?? "-"}
                  </Text>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginTop: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  /* HEADER */
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#e8f4ff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f98e0",
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },

  /* ROWS */
  dataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  altRow: {
    backgroundColor: "#f8fafc",
  },

  dataCell: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 13,
    color: "#475569",
  },

  /* EMPTY */
  emptyRow: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
});
