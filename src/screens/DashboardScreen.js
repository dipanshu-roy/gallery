import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
// import { Storage } from "expo-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import WalletContext from "../components/WalletContext";
import axios from "axios";
import TopAlert from "../components/TopAlert";
import WalletIcon from "../assets/icons/wallet.svg";
import CoinIcon from "../assets/icons/usd-circle.svg";
import ColorIcon from "../assets/icons/fill.svg";
import AviatorIcon from "../assets/icons/plane-prop.svg";
import CricketIcon from "../assets/icons/cricket.svg";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ navigation }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({});
  const PLACEHOLDERS = Array.from({ length: 4 });
  const { refreshWallet } = useContext(WalletContext);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("error");
  const showAlert = (msg, type = "error") => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertVisible(true);
  };
  useFocusEffect(
    React.useCallback(() => {
      refreshWallet();
    }, [])
  );
  useEffect(() => {
    fetchGames();
  }, []);
  const fetchGames = async () => {
    try {
      const res = await axios.get("https://sspl20.com/game");
      if (res.data.status === 200) {
        setGames(res.data.games);
        const loadingMap = {};
        res.data.games.forEach((g) => {
          loadingMap[g.id] = true;
        });
        setImageLoading(loadingMap);
      }
    } catch (err) {
      console.log("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fixImageUrl = (url) => {
    if (!url) return null;
    let clean = url.replace(/\\/g, "/");
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      return clean;
    }
    clean = clean.replace(/^\/+/, "");
    return `https://sspl20.com/${clean}`;
  };
  const sliderImages = [
    require("../assets/images/slide2.png"),
    require("../assets/images/slide1.png"),
    require("../assets/images/slide3.png"),
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  const handleGameNavigation = async (code) => {
    // const token = await Storage.getItem({ key: "AUTH_TOKEN" });
    const token = await AsyncStorage.getItem("AUTH_TOKEN");
    if (!token) {
      navigation.navigate("Login");
      return;
    }
    switch (code) {
      case "flip":
        navigation.navigate("CoinFlip");
        break;
      case "color":
        navigation.navigate("ColorGame");
        break;
      case "aviator":
        showAlert("Aviator Coming Soon","info");
        break;
      case "cricket":
        showAlert("Cricket Coming Soon","info");
        break;
      default:
        showAlert("Game Not Found","info");
    }
  };

  function BetsLeaderboard() {

    const DUMMY = [
      { id: "1", name: "Rajeev K.", avatar: require("../assets/images/users.jpg"), amount: 100, multiplier: "x1.94", profit: 200 },
      { id: "2", name: "Tecno Gamer", avatar: require("../assets/images/users.jpg"), amount: 100, multiplier: "x1.94", profit: -100 },
      { id: "3", name: "Tarun singh", avatar: require("../assets/images/users.jpg"), amount: 1050, multiplier: "x1.94", profit: 2050 },
      { id: "4", name: "Gamer zone", avatar: require("../assets/images/users.jpg"), amount: 2000, multiplier: "x1.94", profit: 5000 },
      { id: "5", name: "Gamer zone", avatar: require("../assets/images/users.jpg"), amount: 2000, multiplier: "x1.94", profit: 5000 },
      { id: "6", name: "Gamer zone", avatar: require("../assets/images/users.jpg"), amount: 2000, multiplier: "x1.94", profit: 5000 },
      { id: "7", name: "Gamer zone", avatar: require("../assets/images/users.jpg"), amount: 2000, multiplier: "x1.94", profit: 5000 },
      { id: "8", name: "Gamer zone", avatar: require("../assets/images/users.jpg"), amount: 2000, multiplier: "x1.94", profit: 5000 },
      { id: "9", name: "Gamer zone", avatar: require("../assets/images/users.jpg"), amount: 2000, multiplier: "x1.94", profit: 5000 },
      { id: "10", name: "Gamer zone", avatar: require("../assets/images/users.jpg"), amount: 2000, multiplier: "x1.94", profit: 5000 },
      { id: "4", name: "Gamer zone", avatar: require("../assets/images/users.jpg"), amount: 2000, multiplier: "x1.94", profit: 5000 },
      { id: "11", name: "Gamer zone", avatar: require("../assets/images/users.jpg"), amount: 2000, multiplier: "x1.94", profit: 5000 },
    ];

    const myRank = DUMMY.filter((item) =>
      item.name.toLowerCase().includes("you")
    );

    return (
      <View style={styles.lbCard}>
        <View style={styles.leaderboardTitleWrap}>
          <Image
            source={require("../assets/images/ellipse.png")}
            style={styles.ellipseBg}
          />
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
        </View>
        <View style={styles.leaderboardInsideBox}>
          {DUMMY.map((item, index) => {
            const positive = item.profit >= 0;
            return (
              <View key={index} style={styles.lbRow}>
                <View style={styles.lbLeft}>
                  <Image source={item.avatar} style={styles.lbAvatar} />

                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.lbName}>{item.name}</Text>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Image
                        source={
                          positive
                            ? require("../assets/images/coinflip/head_small.png")
                            : require("../assets/images/coinflip/tails_small.png")
                        }
                        style={styles.lbCoinIcon}
                      />
                      <Text style={styles.meta}>
                        {positive
                          ? Math.round(item.amount * parseFloat(item.multiplier.replace("x", "")))
                          : item.amount}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* PROFIT PILL */}
                <View style={styles.right}>
                  <View style={styles.multiplier}>
                    <Text style={styles.multiplierText}>{item.multiplier}</Text>
                  </View>

                  <View style={[styles.lbProfitPill, positive ? styles.lbProfitPos : styles.lbProfitNeg]}>
                    <Text style={[styles.lbProfitText, positive ? styles.lbProfitTextPos : styles.lbProfitTextNeg]}>
                      {positive ? `+₹${item.profit}` : `-₹${Math.abs(item.profit)}`}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#06071C", "#0A0C2A", "#0E102F"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#0c1f4b", "#102a63"]}
          style={styles.dailyCard}
        >
          <View style={{ width: "60%" }}>
            <Text style={styles.dailyTitle}>Daily Reward</Text>
            <Text style={styles.dailySubtitle}>
              Claim your daily reward and collect more coins each day.
            </Text>
          </View>

          <Image
            source={require("../assets/images/logo.png")}
            style={styles.dailyImage}
            resizeMode="contain"
          />

          <View style={styles.rewardFooter}>
            <Text style={styles.rewardPoints}>7,200</Text>
            <Text style={styles.rewardLabel}>Reward Points</Text>
          </View>
        </LinearGradient>
        <View style={styles.grid}>
          {loading
            ? PLACEHOLDERS.map((_, index) => (
              <View key={index} style={styles.gameBox}>
                <View style={styles.skeletonCard}>
                  <ActivityIndicator size="small" color="#FFD54A" />
                </View>
              </View>
            ))
            : games.map((item) => {
              const isLoading = imageLoading[item.id] !== false;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.gameBox}
                  onPress={() => handleGameNavigation(item.code)}
                  activeOpacity={0.8}
                >
                  <View style={styles.imageWrapper}>
                    {isLoading && (
                      <View style={styles.imageLoader}>
                        <ActivityIndicator size="small" color="#FFD54A" />
                      </View>
                    )}

                    <Image
                      source={{ uri: fixImageUrl(item.image) }}
                      style={styles.gameImage}
                      resizeMode="contain"
                      onLoadEnd={() =>
                        setImageLoading((prev) => ({
                          ...prev,
                          [item.id]: false,
                        }))
                      }
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>


        <BetsLeaderboard />
      </ScrollView>
      <TopAlert
        visible={alertVisible}
        message={alertMessage}
        type={alertType}
        onHide={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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

  /* ----------- GRID ----------- */
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
  ///*********** */
  lbCard: {
    width: "100%",
    backgroundColor: "#081821",
    borderRadius: 18,
    padding: 14,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 183, 255, 0.15)",
    overflow: "hidden",

    shadowColor: "#00C8FF",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },

  lbTabRow: {
    flexDirection: "row",
    backgroundColor: "#07141B",
    borderRadius: 14,
    padding: 3,
    marginBottom: 5,
    justifyContent: "space-between",
  },

  lbTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  lbTabActive: {
    backgroundColor: "rgba(0, 194, 255, 0.18)",
  },

  lbTabTxt: {
    color: "#8FAAB7",
    fontWeight: "700",
    fontSize: 14,
  },

  lbTabTxtActive: {
    color: "#E6FAFF",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  /* Row */
  lbRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },

  lbLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  lbAvatar: {
    width: 25,
    height: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  lbName: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    maxWidth: width * 0.4,
  },

  lbCoinIcon: {
    width: 12,
    height: 12,
    tintColor: "#FFD54A",
    marginRight: 2,
  },

  meta: {
    color: "#C0CEDA",
    fontSize: 12,
    marginLeft: 4,
  },
  multiplier: {
    backgroundColor: "#0E2B33",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  multiplierText: {
    color: "#CFF4FF",
    fontWeight: "700",
    fontSize: 13,
  },
  leaderboardTitleWrap: {
    position: "relative",
    justifyContent: "center",
  },

  ellipseBg: {
    position: "absolute",
    width: 160,
    height: 60,
    top: -5,
    left: -20,
    resizeMode: "stretch",
    opacity: 0.7,
  },

  leaderboardTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
    zIndex: 10,
    paddingBottom: 10,
    marginLeft: 15
  },

  /* Profit pill */
  lbProfitPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },

  lbProfitPos: {
    backgroundColor: "rgba(34,197,94,0.20)",
  },

  lbProfitNeg: {
    backgroundColor: "rgba(239,68,68,0.20)",
  },

  lbProfitText: {
    fontWeight: "700",
    fontSize: 13,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ffffff15",
  },
  leaderboardInsideBox: {
    backgroundColor: "#05131B",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 183, 255, 0.25)",
    shadowColor: "#00C8FF",
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
    shadowColor: "#00C8FF",
  },

  lbProfitTextPos: { color: "#22c55e" },
  lbProfitTextNeg: { color: "#ef4444" },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: 190, // ✅ MUST MATCH IMAGE HEIGHT
  },


  imageLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 10,
    elevation: 10, // ✅ ANDROID FIX
    borderRadius: 12,
  },


});
