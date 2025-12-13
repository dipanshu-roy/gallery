import React, { useContext,useState,useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import WalletContext from "./WalletContext";
import { getToken } from "../storage/storage";

import CoinIcon from "../assets/icons/usd-circle.svg";

export default function AppHeader() {
  const navigation = useNavigation();
  const { wallet } = useContext(WalletContext);
  const showBack = navigation.canGoBack();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);
  const checkLogin = async () => {
    const token = await getToken();
    setIsLoggedIn(!!token);
  };

  return (
    <LinearGradient
      colors={["#070820", "#070820", "#070820"]}
      style={styles.gradient}
    >
      <View style={{ width: "100%" }}>
        <ImageBackground
          source={require("../assets/images/header_image.png")}
          resizeMode="cover"
          style={styles.topBg}
        >
          <View style={styles.topRow}>
            <View style={styles.logoRow}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
              />
            </View>

            <TouchableOpacity
              style={styles.balanceCard}
              onPress={() => {
                if (isLoggedIn) {
                  navigation.navigate("Profile"); // ✅ logged in
                } else {
                  navigation.navigate("Login");   // ❌ not logged in
                }
              }}
            >

              <CoinIcon width={16} height={16} fill="#FFD54A" />
              <Text style={styles.balanceAmount}>{wallet ? wallet.toFixed(2) : "0.00"}</Text>

              <Image
                source={require("../assets/images/users.jpg")}
                style={styles.avatar}
              />
            </TouchableOpacity>

          </View>
        </ImageBackground>
      </View>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  // topBg: {
  //   width: "100%",
  //   paddingTop: 40,
  //   paddingBottom: 25,
  // },
  // headerRow: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingHorizontal: 20,
  //   marginTop: 10,
  //   marginBottom: 10,
  // },

  // leftArea: {
  //   width: 60,
  //   justifyContent: "center",
  // },

  // centerArea: {
  //   flex: 1,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },

  // rightArea: {
  //   width: 90,  // same width as left area → PERFECT CENTERING
  //   alignItems: "flex-end",
  //   justifyContent: "center",
  // },

  // logoRow: {
  //   flexDirection: "row",
  //   alignItems: "center",
  // },
  // logo: { height: 20 },
  // logoText: {
  //   color: "#fff",
  //   fontSize: 20,
  //   fontWeight: "700",
  // },

  // balanceCard: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   backgroundColor: "#1B2A52",
  //   paddingVertical: 8,
  //   paddingHorizontal: 14,
  //   borderRadius: 30,
  //   gap: 6,
  // },
  // balanceAmount: {
  //   color: "#FFD54A",
  //   fontSize: 14,
  //   fontWeight: "bold",
  // },
  // avatar: {
  //   width: 28,
  //   height: 28,
  //   borderRadius: 50,
  //   marginLeft: 4,
  // },
  topBg: {
    width: "100%",
    paddingTop: 40,
    paddingBottom: 25,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: { height: 25 },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  balanceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2A52",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 30,
    gap: 6,
  },
  balanceAmount: {
    color: "#FFD54A",
    fontSize: 14,
    fontWeight: "bold",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 50,
    marginLeft: 4,
  },

  /* ----------- DAILY CARD ----------- */
  dailyCard: {
    width: "90%",
    alignSelf: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 15,
  },
  dailyTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  dailySubtitle: {
    color: "#dbeafe",
    fontSize: 13,
    marginTop: 4,
  },
  dailyImage: {
    width: 140,
    height: 120,
    position: "absolute",
    right: 10,
    top: 10,
  },
  rewardFooter: {
    marginTop: 10,
  },
  rewardPoints: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  rewardLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  /* ----------- DAILY CARD ----------- */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },

  gameBox: {
    width: "50%",
    marginBottom: 20,
  },
  gameInner: {
    borderRadius: 18,
    paddingVertical: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  gameText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  gameImage: {
    width: "100%",
    height: 190,
  },
  backBtn: {
    padding: 5,
    color: "#fff",
  },
  logoText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  walletContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  walletText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
});
