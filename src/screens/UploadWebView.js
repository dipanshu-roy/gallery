import React from "react";
import { WebView } from "react-native-webview";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import BackIcon from "../assets/icons/angle-left.svg";
import AddIcon from "../assets/icons/apps-add.svg";

export default function UploadWebView({ route, navigation }) {
    const { programmeId, token,programmeName } = route.params;

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                    <BackIcon width={22} height={22} fill="#fff" />
                </TouchableOpacity>

                <Text style={styles.title}>{programmeName}</Text>
            </View>
            <WebView
                source={{
                    uri: `https://gallery.polidesk.in/web/upload?programme_id=${programmeId}&token=${token}`,
                }}
                onMessage={(event) => {
                    if (event.nativeEvent.data === "UPLOAD_DONE") {
                        navigation.goBack();
                    }
                }}
            />
        </View>
    );
}
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
});