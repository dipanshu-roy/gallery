import React, { useState, useCallback } from "react";
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
    InteractionManager
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

import { BASE_URL } from "../config/api";
import { getToken, removeToken } from "../storage/storage";
import DateTimePicker from "@react-native-community/datetimepicker";


import BackIcon from "../assets/icons/angle-left.svg";
import AddIcon from "../assets/icons/apps-add.svg";


import CardTable from "../components/CardTable";
import ConfirmAlert from "../components/ConfirmAlert";
import TopAlert from "../components/TopAlert";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";



export default function ProgrammeScreen({ navigation }) {
    /* ---------------- STATE ---------------- */
    const [rows, setRows] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [locations, setLocations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [programmeName, setProgrammeName] = useState("");
    const [districtId, setDistrictId] = useState(null);
    const [locationId, setLocationId] = useState(null);
    const [eventDate, setEventDate] = useState("");
    const [description, setDescription] = useState("");
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("error");
    const [showDistrictSelect, setShowDistrictSelect] = useState(false);
    const [showLocationSelect, setShowLocationSelect] = useState(false);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingProgrammeId, setUploadingProgrammeId] = useState(null);

    const CHUNK_SIZE = 5 * 1024 * 1024;
    const PARALLEL_UPLOADS = 3;

    const closeAllModals = () => {
        setShowModal(false);
        setShowDistrictSelect(false);
        setShowLocationSelect(false);
    };

    /* ---------------- ALERT ---------------- */
    const showAlert = (msg, type = "error") => {
        setAlertMessage(msg);
        setAlertType(type);
        setAlertVisible(true);
    };

    /* ---------------- LOAD ---------------- */
    useFocusEffect(
        useCallback(() => {
            fetchDistricts();
            fetchProgrammes();
        }, [])
    );
    const handleUpload = async (row) => {
        const programmeId = row.data[0].value;

        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        console.log("Permission:", permission.status);

        if (permission.status !== "granted") {
            showAlert("Permission required");
            return;
        }

        // 🔴 BREAK THE CALL STACK
        InteractionManager.runAfterInteractions(async () => {
            try {
                console.log("Opening picker...");

                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.All,
                    allowsMultipleSelection: false,
                    quality: 1,
                });

                console.log("Picker result:", result);

                if (result.canceled) return;

                const file = result.assets[0];

                if (file.fileSize > 50 * 1024 * 1024) {
                    uploadFileInChunks(file, programmeId);
                } else {
                    uploadFullFile(file, programmeId);
                }
            } catch (err) {
                console.log("Picker error:", err);
            }
        });
    };



    const uploadFullFile = async (file, programmeId) => {

        const token = await getToken();

        const formData = new FormData();
        formData.append("file", {
            uri: file.uri,
            name: file.uri.split("/").pop(),
            type: file.mimeType,
        });
        formData.append("programme_id", programmeId);
        formData.append("access_token", token);

        try {
            setUploadingProgrammeId(programmeId);
            setUploadProgress(0);

            await axios.post(`${BASE_URL}media/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (e) => {

                    if (!e.total) return;
                    console.log(e.total);
                    const percent = Math.min(
                        100,
                        Math.round((e.loaded * 100) / e.total)
                    );

                    setUploadProgress(percent);
                },


            });

            showAlert("Upload completed", "success");
        } catch (e) {
            console.log(e);
            showAlert("Upload failed");
        } finally {
            setUploadingProgrammeId(null);
            setUploadProgress(0);
        }
    };





    const uploadFileInChunks = async (file, programmeId) => {
        const token = await getToken();
        const uploadId = Date.now().toString();

        const fileInfo = await FileSystem.getInfoAsync(file.uri);
        const totalChunks = Math.ceil(fileInfo.size / CHUNK_SIZE);

        setUploadingProgrammeId(programmeId);
        setUploadProgress(0);

        let uploaded = 0;

        const uploadChunk = async (i) => {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, fileInfo.size) - 1;

            await FileSystem.uploadAsync(
                `${BASE_URL}upload/chunk`,
                file.uri,
                {
                    httpMethod: "POST",
                    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
                    headers: {
                        "Content-Range": `bytes ${start}-${end}/${fileInfo.size}`,
                        "Content-Type": file.mimeType,
                        "X-Upload-Id": uploadId,
                        "X-Chunk-Index": i.toString(),
                        "X-Total-Chunks": totalChunks.toString(),
                        "X-Programme-Id": programmeId.toString(),
                        "X-Access-Token": token,
                    },
                }
            );

            uploaded++;
            setUploadProgress(Math.round((uploaded / totalChunks) * 100));
        };

        // queue
        const queue = [];
        for (let i = 0; i < totalChunks; i++) {
            queue.push(() => uploadChunk(i));
        }

        // workers
        const workers = Array(PARALLEL_UPLOADS)
            .fill(0)
            .map(async () => {
                while (queue.length) {
                    const task = queue.shift();
                    if (task) await task();
                }
            });

        await Promise.all(workers);

        // finalize
        await axios.post(`${BASE_URL}upload/finalize`, {
            upload_id: uploadId,
            programme_id: programmeId,
            total_chunks: totalChunks,
            file_name: file.fileName,
            mime_type: file.mimeType,
            access_token: token,
        });

        setUploadingProgrammeId(null);
        setUploadProgress(100);
        showAlert("Upload completed", "success");
    };






    const fetchDistricts = async () => {
        try {
            const token = await getToken();
            const res = await axios.post(`${BASE_URL}district`, {
                access_token: token,
            });
            if (res.data.status === 200) setDistricts(res.data.data);
        } catch {
            navigation.replace("Login");
        }
    };

    const fetchLocationsByDistrict = async (id) => {
        const token = await getToken();
        const res = await axios.post(`${BASE_URL}location`, {
            access_token: token,
            district_id: id,
        });
        if (res.data.status === 200) setLocations(res.data.data);
    };

    const fetchProgrammes = async () => {
        try {
            setLoading(true);
            const token = await getToken();

            const res = await axios.post(`${BASE_URL}programme`, {
                access_token: token,
            });

            if (res.data.status === 200) {
                setRows(
                    res.data.data.map((p) => ({
                        title: p.programme_name,
                        data: [
                            { label: "ID", value: p.id },
                            { label: "District", value: p.district_name },
                            { label: "Location", value: p.location_name },
                            { label: "Event Date", value: p.event_date },
                        ],
                    }))
                );
            }
        } catch {
            await removeToken();
            navigation.replace("Login");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /* ---------------- ADD / EDIT ---------------- */
    const openAdd = () => {
        setEditId(null);
        setProgrammeName("");
        setDistrictId(null);
        setLocationId(null);
        setEventDate("");
        setDescription("");
        setLocations([]);
        setShowModal(true);
    };

    const openEdit = (row) => {
        setEditId(row.data[0].value);
        setProgrammeName(row.title);
        setEventDate(row.data[3].value);
        setShowModal(true);
    };

    /* ---------------- SAVE ---------------- */
    const saveProgramme = async () => {
        if (!programmeName || !districtId || !locationId || !eventDate) {
            showAlert("All fields are required");
            return;
        }
        const token = await getToken();

        try {
            setSaving(true);


            const res = await axios.post(`${BASE_URL}programme/save`, {
                access_token: token,
                id: editId,
                district_id: districtId,
                location_id: locationId,
                programme_name: programmeName,
                event_date: eventDate,
                // description,
            });


            showAlert(res.data.message, "success");
            setShowModal(false);
            fetchProgrammes();
        } catch (e) {
            console.log(e);
            showAlert("Save failed");
        } finally {
            setSaving(false);
        }
    };

    /* ---------------- DELETE ---------------- */
    const confirmDelete = async () => {
        try {
            const token = await getToken();
            await axios.post(`${BASE_URL}programme/delete`, {
                access_token: token,
                id: selectedRow.data[0].value,
            });
            showAlert("Deleted successfully", "success");
            fetchProgrammes();
        } catch {
            showAlert("Delete failed");
        } finally {
            setShowDeleteAlert(false);
        }
    };

    /* ---------------- UI ---------------- */
    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#1f98e0" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                    <BackIcon width={22} height={22} fill="#fff" />
                </TouchableOpacity>

                <Text style={styles.title}>Programme</Text>

                <TouchableOpacity style={styles.iconBtn} onPress={openAdd}>
                    <AddIcon width={22} height={22} fill="#fff" />
                </TouchableOpacity>
            </View>
            {uploadingProgrammeId && (
                <View style={styles.progressBox}>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        Uploading… {uploadProgress}%
                    </Text>
                </View>
            )}


            <FlatList
                data={rows}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item }) => (
                    <CardTable
                        rows={[item]}
                        onEdit={openEdit}
                        onDelete={(r) => {
                            setSelectedRow(r);
                            setShowDeleteAlert(true);
                        }}
                        onUpload={handleUpload}
                    />
                )}
                refreshing={refreshing}
                onRefresh={fetchProgrammes}
            />

            {/* DELETE */}
            <ConfirmAlert
                visible={showDeleteAlert}
                title="Delete Programme"
                message="Are you sure?"
                onCancel={() => setShowDeleteAlert(false)}
                onConfirm={confirmDelete}
            />

            <TopAlert
                visible={alertVisible}
                message={alertMessage}
                type={alertType}
                onHide={() => setAlertVisible(false)}
            />

            {/* MODAL */}
            {/* ================= MAIN MODAL ================= */}
            {showModal && (
                <Modal visible={showModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalBox}>

                            <Text style={styles.modalTitle}>
                                {editId ? "Edit Programme" : "Add Programme"}
                            </Text>

                            {/* Programme Name */}
                            <TextInput
                                placeholder="Programme Name"
                                value={programmeName}
                                onChangeText={setProgrammeName}
                                style={styles.input}
                            />

                            {/* Event Date */}
                            <TouchableOpacity
                                style={styles.selectInput}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={eventDate ? styles.selectText : styles.placeholder}>
                                    {eventDate || "Select Event Date"}
                                </Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={eventDate ? new Date(eventDate) : new Date()}
                                    mode="date"
                                    display="calendar"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) {
                                            setEventDate(selectedDate.toISOString().split("T")[0]);
                                        }
                                    }}
                                />
                            )}

                            {/* District Select */}
                            <TouchableOpacity
                                style={styles.selectInput}
                                onPress={() => setShowDistrictSelect(true)}
                            >
                                <Text style={districtId ? styles.selectText : styles.placeholder}>
                                    {districts.find(d => d.id === districtId)?.district_name || "Select District"}
                                </Text>
                            </TouchableOpacity>

                            {/* Location Select */}
                            <TouchableOpacity
                                style={styles.selectInput}
                                onPress={() => {
                                    if (!districtId) {
                                        alert("Please select district first");
                                        return;
                                    }
                                    setShowLocationSelect(true);
                                }}
                            >
                                <Text style={locationId ? styles.selectText : styles.placeholder}>
                                    {locations.find(l => l.id === locationId)?.location_name || "Select Location"}
                                </Text>
                            </TouchableOpacity>

                            {/* ACTION BUTTONS */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setShowModal(false)}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.saveBtn}
                                    onPress={saveProgramme}
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
                </Modal>
            )}
            <Modal visible={showDistrictSelect} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.selectModalBox}>
                        <ScrollView>
                            {districts.map(d => (
                                <TouchableOpacity
                                    key={d.id}
                                    style={styles.selectItem}
                                    onPress={() => {
                                        setDistrictId(d.id);
                                        fetchLocationsByDistrict(d.id);
                                        setShowDistrictSelect(false);
                                    }}
                                >
                                    <Text style={styles.selectItemText}>{d.district_name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={showLocationSelect} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.selectModalBox}>
                        <ScrollView>
                            {locations.map(l => (
                                <TouchableOpacity
                                    key={l.id}
                                    style={styles.selectItem}
                                    onPress={() => {
                                        setLocationId(l.id);
                                        setShowLocationSelect(false);
                                    }}
                                >
                                    <Text style={styles.selectItemText}>{l.location_name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#ebe2e2ff" },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
    topBar: {
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    iconBtn: { padding: 6, backgroundColor: "#1f98e0", borderRadius: 8 },
    title: { fontSize: 22, fontWeight: "700", color: "#1f98e0" },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "90%",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    label: { fontWeight: "600", marginTop: 10 },
    selectBox: {
        maxHeight: 120,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 10,
    },
    selectItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 20,
    },
    selectInput: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 12,
        backgroundColor: "#fff",
    },

    placeholder: {
        color: "#9ca3af",
        fontSize: 15,
    },

    selectText: {
        color: "#111827",
        fontSize: 15,
        fontWeight: "600",
    },

    selectModalBox: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 10,
    },

    selectItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },

    selectItemText: {
        fontSize: 16,
        color: "#111827",
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
    progressBox: {
        marginHorizontal: 20,
        marginBottom: 14,
        backgroundColor: "#f1f5f9",
        borderRadius: 10,
        padding: 6,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 1,
    },

    progressTrack: {
        height: 8,
        backgroundColor: "#e5e7eb",
        borderRadius: 6,
        overflow: "hidden",
    },

    progressBar: {
        height: "100%",
        backgroundColor: "#1f98e0",
        borderRadius: 6,
    },

    progressText: {
        marginTop: 6,
        textAlign: "center",
        fontSize: 11,
        fontWeight: "600",
        color: "#1f98e0",
    },
});
