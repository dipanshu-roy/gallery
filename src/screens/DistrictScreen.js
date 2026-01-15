import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { Modal, TextInput, Alert } from "react-native";

import { BASE_URL } from "../config/api";
import { getToken, removeToken } from "../storage/storage";
import BackIcon from "../assets/icons/angle-left.svg";
import AddIcon from "../assets/icons/apps-add.svg";
import CardTable from "../components/CardTable";
import ConfirmAlert from "../components/ConfirmAlert";
import TopAlert from "../components/TopAlert";


export default function DistrictScreen({ navigation }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [districtName, setDistrictName] = useState("");
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("error");

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );
    const showAlert = (message, type = "error") => {
        setAlertMessage(message);
        setAlertType(type);
        setAlertVisible(true);
    };
    const deleteDistrict = (row) => {
        setSelectedRow(row);
        setShowDeleteAlert(true);
    };
    const confirmDelete = async () => {
        try {
            const token = await getToken();

            const res = await axios.post(`${BASE_URL}district/delete`, {
                access_token: token,
                id: selectedRow.data[0].value,
            });
            showAlert(
                res.data?.message || "District deleted successfully",
                "success"
            );
            setShowDeleteAlert(false);
            setSelectedRow(null);
            fetchData();

        } catch (err) {
            showAlert(
                err.response?.data?.message || err.message || "Delete failed",
                "error"
            );
        }
    };

    const openAdd = () => {
        setEditId(null);
        setDistrictName("");
        setShowModal(true);
    };

    const openEdit = (row) => {
        setEditId(row.data[0].value);
        setDistrictName(row.title);
        setShowModal(true);
    };
    const saveDistrict = async () => {
        if (!districtName.trim()) {
            showAlert("District name is required", "error");
            return;
        }

        try {
            setSaving(true);
            const token = await getToken();

            const res = await axios.post(`${BASE_URL}district/save`, {
                access_token: token,
                id: editId,
                district_name: districtName,
            });
            showAlert(
                res.data?.message || "Save successfully",
                "success"
            );
            setShowModal(false);
            fetchData();
        } catch (err) {
            showAlert(
                err.response?.data?.message || err.message || "Failed to save",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    /* ---------- API CALL ---------- */
    const fetchData = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);

            const token = await getToken();
            if (!token) {
                navigation.replace("Login");
                return;
            }

            const res = await axios.post(`${BASE_URL}district`, {
                access_token: token,
            });

            if (res.data?.status === 200) {
                const mapped = res.data.data.map((item) => ({
                    title: item.district_name,
                    data: [
                        { label: "District ID", value: item.id },
                        { label: "Created At", value: item.created_at },
                    ],
                }));
                setRows(mapped);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                await removeToken();
                navigation.replace("Login");
            } else {
                console.log("District error:", err.message);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    const onRefresh = () => {
        setRefreshing(true);
        fetchData(true);
    };

    /* ---------- LOADER ---------- */
    if (loading && !refreshing) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#1f98e0" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* ---------- TOP BAR ---------- */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => navigation.goBack()}
                >
                    <BackIcon width={22} height={22} fill="#fff" />
                </TouchableOpacity>

                <Text style={styles.title}>Districts</Text>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={openAdd}
                >
                    <AddIcon width={22} height={22} fill="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={rows}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item }) => (
                    <CardTable
                        rows={[item]}
                        onEdit={openEdit}
                        onDelete={deleteDistrict}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
            <ConfirmAlert
                visible={showDeleteAlert}
                title="Delete District"
                message="Are you sure you want to delete this district?"
                confirmText="Delete"
                cancelText="Cancel"
                onCancel={() => {
                    setShowDeleteAlert(false);
                    setSelectedRow(null);
                }}
                onConfirm={confirmDelete}
            />
            <TopAlert
                visible={alertVisible && !showModal}
                message={alertMessage}
                type={alertType}
                onHide={() => setAlertVisible(false)}
            />
            <Modal visible={showModal} transparent animationType="fade">
                <View style={styles.modalRoot}>

                    {/* Overlay */}
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>
                                {editId ? "Edit District" : "Add District"}
                            </Text>

                            <TextInput
                                placeholder="Enter district name"
                                value={districtName}
                                onChangeText={setDistrictName}
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
                                    onPress={saveDistrict}
                                    disabled={saving}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.saveText}>
                                        {saving ? "Saving..." : "Save"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                </View>
            </Modal>


        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ebe2e2ff",
        paddingTop: 15,
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    topBar: {
        paddingHorizontal: 20,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    iconBtn: {
        padding: 6,
        backgroundColor: "#1f98e0",
        borderRadius: 8,
    },

    title: {
        color: "#1f98e0",
        fontSize: 22,
        fontWeight: "700",
    },
    modalRoot: {
        flex: 1,
        position: "relative", // 🔥 anchor absolute alerts
    },
    modalOverlay: {
        position: "absolute",   // 🔥 REQUIRED
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,              // 🔥 LOWER than alert
    },


    modalBox: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
        color: "#111827",
    },

    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
    },

    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 16,
        gap: 20,
    },

    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "#f1f5f9",
    },

    cancelText: {
        color: "#6b7280",
        fontSize: 16,
        fontWeight: "600",
    },

    saveBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        backgroundColor: "#1f98e0",
    },

    saveText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
