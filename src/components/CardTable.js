import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import EditIcon from "../assets/icons/edit.svg";
import TrashIcon from "../assets/icons/trash.svg";
import CloudUploadIcon from "../assets/icons/cloud-upload-alt.svg";

export default function CardTable({ rows = [], onEdit, onDelete, onUpload }) {
  if (!rows.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No data found</Text>
      </View>
    );
  }

  return (
    <>
      {rows.map((row, index) => (
        <View key={index} style={styles.card}>
          {/* HEADER */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{row.title}</Text>

            <View style={styles.actionWrap}>
              {onUpload && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onUpload(rows[0])}
                >
                  <CloudUploadIcon width={18} height={18} fill="#86a126ff" />
                </TouchableOpacity>
              )}

              {onEdit && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onEdit(row)}
                >
                  <EditIcon width={18} height={18} fill="#1b23ffff" />
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => onDelete(row)}
                >
                  <TrashIcon width={18} height={18} fill="#fd2929ff" />
                </TouchableOpacity>
              )}
              
            </View>
          </View>

          {/* BODY */}
          <View style={styles.rowWrap}>
            {row.data.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.row,
                  idx === row.data.length - 1 && styles.lastRow,
                ]}
              >
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#7f919aff",
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    padding: 14,
  },

  /* HEADER */
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "700",
    flex: 1,
  },

  actionWrap: {
    flexDirection: "row",
  },

  actionBtn: {
    marginLeft: 12,
    padding: 6,
    backgroundColor: "#ffffffff",
    borderRadius: 8,
  },

  /* BODY */
  rowWrap: {
    marginTop: 4,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ffffffff",
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  label: {
    color: "#ffffffff",
    fontSize: 15,
  },

  value: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  /* EMPTY */
  emptyWrap: {
    alignItems: "center",
    marginTop: 60,
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
  },
});
