import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import axios from "axios";
import { BASE_URL } from "../config/api";
import { getToken } from "../storage/storage";
import BackIcon from "../assets/icons/angle-left.svg";
import { Feather, Ionicons } from "@expo/vector-icons";

export default function MediaOverviewScreen({ navigation, route }) {
    const { programmeId } = route.params;
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        const token = await getToken();
        const res = await axios.post(`${BASE_URL}media/overview`, {
            access_token: token,
            programme_id: programmeId,
        });
        if (res.data.status === 200) {
            setMedia(res.data.data);
        }
        setLoading(false);
    };
    const combinedMedia = [
        {
            type: "favourite",
            total_files: null,
            disk_size: null,
            db_size: null,
        },
        ...media,
    ];

    if (loading) {
        return <ActivityIndicator style={{ marginTop: 40 }} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => navigation.goBack()}
                >
                    <BackIcon width={22} height={22} fill="#fff" />
                </TouchableOpacity>

                <Text style={styles.title}>Media Storage</Text>
                <View style={{ width: 36 }} />
            </View>

            {combinedMedia.map((item) => (
                <TouchableOpacity
                    key={item.type}
                    style={styles.card}
                    onPress={() =>
                        navigation.navigate("ProgrammeMedia", {
                            type: item.type,
                            programme_id: programmeId,
                        })
                    }
                >
                    <View style={styles.iconBox}>
                        {item.type === "favourite" ? (
                            <Ionicons name="heart" size={22} color="#ef4444" />
                        ) : (
                            <Feather
                                name={item.type === "photo" ? "image" : "video"}
                                size={22}
                                color="#1f98e0"
                            />
                        )}
                    </View>

                    <View style={styles.info}>
                        <Text style={styles.type}>
                            {item.type === "photo"
                                ? "Images"
                                : item.type === "video"
                                    ? "Videos"
                                    : "Favourites"}
                        </Text>

                        {item.type === "favourite" ? (
                            <Text style={styles.meta}>Your favourite images & videos</Text>
                        ) : (
                            <>
                                <Text style={styles.meta}>
                                    {item.total_files} files • {item.disk_size}
                                </Text>
                                <Text style={styles.dbSize}>DB size: {item.db_size}</Text>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            ))}

        </View>
    );
}
const styles = StyleSheet.create({


    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#f8fafc",
        marginBottom: 12,
        paddingHorizontal: 10,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: "#e8f4ff",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    type: {
        fontSize: 15,
        fontWeight: "600",
    },
    meta: {
        fontSize: 12,
        color: "#475569",
        marginTop: 2,
    },
    dbSize: {
        fontSize: 11,
        color: "#64748b",
    },
    container: {
        flex: 1,
        backgroundColor: "#ebe2e2ff",
        paddingTop: 10,
        alignItems: "center",
        paddingHorizontal: 20,
    },
    title: {
        color: "#1f98e0",
        fontSize: 22,
        fontWeight: "700",
    },
    topBar: {
        width: "100%",
        paddingHorizontal: 0,
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
});
