import { Platform, View, StyleSheet, StatusBar } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import WalletProvider from "./src/components/WalletProvider";

export default function App() {
  if (Platform.OS === "web") {
    return (
      <WalletProvider>
        <View style={styles.webWrapper}>
          <AppNavigator />
        </View>
      </WalletProvider>
    );
  }

  return (
    <WalletProvider>
      {/* Android status bar fix */}
      <ExpoStatusBar style="light" backgroundColor="#070820" />
      <StatusBar barStyle="light-content" backgroundColor="#070820" />

      <AppNavigator />
    </WalletProvider>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    width: 350,
    height: "100%",
    overflow: "hidden",
    backgroundColor: "transparent",
    backgroundImage: "linear-gradient(90deg, #1f5475, #1a7bb3)",
  },
});
