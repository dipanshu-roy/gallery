import "react-native-get-random-values";
import React, { useEffect, useState } from "react";
import { Platform, View, StyleSheet } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { isSplashShown } from "./src/storage/storage";
import * as IntentLauncher from "expo-intent-launcher";

export default function App() {

  const [initialRoute, setInitialRoute] = useState(null);
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);
  useEffect(() => {
    const init = async () => {
      try {
        const shown = await isSplashShown();
        setInitialRoute(shown ? "Dashboard" : "Splash1");
      } catch (e) {
        console.log("Splash check failed", e);
        setInitialRoute("Splash1");
      }
    };
    init();
  }, []);
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const getSharedImage = async () => {
      try {
        const intent = await IntentLauncher.getInitialIntentAsync();
        if (!intent) return;

        if (intent.action === "android.intent.action.SEND") {
          const uri = intent.extras?.["android.intent.extra.STREAM"];
          if (uri) {
            console.log("📸 Shared image:", uri);
            // TODO: store this uri or navigate to upload screen
          }
        }

        if (intent.action === "android.intent.action.SEND_MULTIPLE") {
          const uris = intent.extras?.["android.intent.extra.STREAM"];
          if (uris?.length) {
            console.log("📸 Shared images:", uris);
          }
        }
      } catch (e) {
        console.log("Share intent error", e);
      }
    };

    getSharedImage();
  }, []);


  if (!initialRoute) {
    return <View style={{ flex: 1, backgroundColor: "#1f98e0" }} />;
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.webWrapper}>
        <AppNavigator initialRoute={initialRoute} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#000000" />
      <AppNavigator initialRoute={initialRoute} />
    </View>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    width: 350,
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#1f98e0",
  },
});
