import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

import { BASE_URL } from "../config/api";
import { getToken, removeToken } from "../storage/storage";
import BackIcon from "../assets/icons/angle-left.svg";
import AddIcon from "../assets/icons/apps-add.svg";

import CardTable from "../components/CardTable";
import ConfirmAlert from "../components/ConfirmAlert";
import TopAlert from "../components/TopAlert";

export default function LocationScreen({ navigation }) {
  /* ---------------- STATES ---------------- */
  const [rows, setRows] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [districtId, setDistrictId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");

  /* ---------------- ALERT ---------------- */
  const showAlert = (message, type = "error") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  /* ---------------- LOAD DATA ---------------- */
  useFocusEffect(
    useCallback(() => {
      fetchLocations();
      fetchDistricts();
    }, [])
  );

  const fetchDistricts = async () => {
    try {
      const token = await getToken();
      const res = await axios.post(`${BASE_URL}district`, {
        access_token: token,
      });

      if (res.data?.status === 200) {
        setDistricts(res.data.data);
      }
    } catch (e) {
      console.log("District fetch error:", e.message);
    }
  };

  const fetchLocations = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const token = await getToken();
      if (!token) {
        navigation.replace("Login");
        return;
      }

      const res = await axios.post(`${BASE_URL}location`, {
        access_token: token,
      });

      if (res.data?.status === 200) {
        const mapped = res.data.data.map((item) => ({
          title: item.location_name,
          data: [
            { label: "Location ID", value: item.id },
            { label: "District", value: item.district_name },
            { label: "Created At", value: item.created_at },
          ],
        }));
        setRows(mapped);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        await removeToken();
        navigation.replace("Login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ---------------- ADD / EDIT ---------------- */
  const openAdd = () => {
    setEditId(null);
    setLocationName("");
    setDistrictId(null);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditId(row.data[0].value);
    setLocationName(row.title);
    setDistrictId(
      districts.find((d) => d.district_name === row.data[1].value)?.id || null
    );
    setShowModal(true);
  };

  const saveLocation = async () => {
    if (!districtId) {
      showAlert("Please select district", "error");
      return;
    }

    if (!locationName.trim()) {
      showAlert("Location name is required", "error");
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();

      const res = await axios.post(`${BASE_URL}location/save`, {
        access_token: token,
        id: editId,
        district_id: districtId,
        location_name: locationName,
      });

      showAlert(res.data?.message || "Saved successfully", "success");
      setShowModal(false);
      fetchLocations();
    } catch (err) {
      showAlert(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const deleteLocation = (row) => {
    setSelectedRow(row);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      const token = await getToken();

      const res = await axios.post(`${BASE_URL}location/delete`, {
        access_token: token,
        id: selectedRow.data[0].value,
      });

      showAlert(res.data?.message || "Deleted successfully", "success");
      setShowDeleteAlert(false);
      setSelectedRow(null);
      fetchLocations();
    } catch (err) {
      showAlert(err.message || "Delete failed", "error");
    }
  };

  /* ---------------- LOADER ---------------- */
  if (loading && !refreshing) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1f98e0" />
      </View>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <BackIcon width={22} height={22} fill="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Locations</Text>

        <TouchableOpacity style={styles.iconBtn} onPress={openAdd}>
          <AddIcon width={22} height={22} fill="#fff" />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={rows}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <CardTable
            rows={[item]}
            onEdit={openEdit}
            onDelete={deleteLocation}
          />
        )}
        refreshing={refreshing}
        onRefresh={() => fetchLocations(true)}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* DELETE CONFIRM */}
      <ConfirmAlert
        visible={showDeleteAlert}
        title="Delete Location"
        message="Are you sure you want to delete this location?"
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setShowDeleteAlert(false)}
        onConfirm={confirmDelete}
      />

      {/* ALERT (NON MODAL) */}
      <TopAlert
        visible={alertVisible && !showModal}
        message={alertMessage}
        type={alertType}
        onHide={() => setAlertVisible(false)}
      />

      {/* MODAL */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalRoot}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>
                {editId ? "Edit Location" : "Add Location"}
              </Text>

              <Text style={styles.label}>Select District</Text>
              <ScrollView style={styles.selectBox}>
                {districts.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={[
                      styles.selectItem,
                      districtId === d.id && styles.selectItemActive,
                    ]}
                    onPress={() => setDistrictId(d.id)}
                  >
                    <Text
                      style={[
                        styles.selectText,
                        districtId === d.id && styles.selectTextActive,
                      ]}
                    >
                      {d.district_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                placeholder="Enter location name"
                value={locationName}
                onChangeText={setLocationName}
                style={styles.input}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={saveLocation}
                  disabled={saving}
                >
                  <Text style={styles.saveText}>
                    {saving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* ALERT INSIDE MODAL */}
          <TopAlert
            visible={alertVisible && showModal}
            message={alertMessage}
            type={alertType}
            onHide={() => setAlertVisible(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ebe2e2ff", paddingTop: 15 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  topBar: {
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconBtn: { padding: 6, backgroundColor: "#1f98e0", borderRadius: 8 },
  title: { color: "#1f98e0", fontSize: 22, fontWeight: "700" },

  modalRoot: { flex: 1, position: "relative" },
  modalOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  label: { fontWeight: "600", marginBottom: 6 },

  selectBox: {
    maxHeight: 140,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    marginBottom: 12,
  },

  selectItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  selectItemActive: { backgroundColor: "#e0f2fe" },
  selectText: { color: "#111827" },
  selectTextActive: { fontWeight: "700", color: "#0284c7" },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },

  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },

  cancelText: { color: "#6b7280", fontWeight: "600" },

  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: "#1f98e0",
  },

  saveText: { color: "#fff", fontWeight: "700" },
});
