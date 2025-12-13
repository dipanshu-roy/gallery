import React, { useState,useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import WalletIcon from "../assets/icons/wallet.svg";
import CoinIcon from "../assets/icons/usd-circle.svg";
import ColorIcon from "../assets/icons/fill.svg";
import AviatorIcon from "../assets/icons/plane-prop.svg";
import CricketIcon from "../assets/icons/cricket.svg";

const { width } = Dimensions.get("window");

export default function SettingsScreen({ navigation }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchGames();
  }, []);
  const fetchGames = async () => {
    try {
      const res = await axios.get("https://sspl20.com/game");
      if (res.data.status === 200) {
        setGames(res.data.games);
      }
    } catch (err) {
      console.log("API Error:", err);
    } finally {
      setLoading(false);
    }
  };
  const sliderImages = [
    require("../assets/images/slide2.png"),
    require("../assets/images/slide1.png"),
    require("../assets/images/slide3.png"),
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  const handleGameNavigation = (code) => {
    switch (code) {
      case "flip":
        navigation.navigate("CoinFlip");
        break;
      case "color":
        navigation.navigate("ColorGame");
        break;
      case "aviator":
        alert("Aviator Coming Soon");
        break;
      case "cricket":
        alert("Cricket Coming Soon");
        break;
      default:
        alert("Game Not Found");
    }
  };

  return (
      <LinearGradient
        colors={["#06071C", "#0A0C2A", "#0E102F"]}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>        
        </ScrollView>
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
});
