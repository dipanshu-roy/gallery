// CoinScreen.js
import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import ResultPopup from "../components/ResultPopup";
import CustomButton from "../components/CustomButton";
import WalletContext from "../components/WalletContext";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  PanResponder,
  Vibration,
  Easing,
  Image,
  FlatList,
  Dimensions,
} from "react-native";

import { Audio } from "expo-av";
import BackIcon from "../assets/icons/angle-left.svg";
import SoundOnIcon from "../assets/icons/volume-up.svg";
import SoundOffIcon from "../assets/icons/volume-down.svg";
import WinIcon from "../assets/icons/trophy-star.svg";
import LoseIcon from "../assets/icons/sad-tear.svg";
import RotateIcon from "../assets/icons/rotate-left.svg";

const { width } = Dimensions.get("window");

export default function CoinScreen() {
  const navigation = useNavigation();
  const { wallet, setWallet } = useContext(WalletContext);

  const [amount, setAmount] = useState(10);
  const [choice, setChoice] = useState(null);
  const [coinFace, setCoinFace] = useState("Heads");
  const [history, setHistory] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [betsTab, setBetsTab] = useState("all");

  const flipSoundRef = useRef(null);
  const [soundReady, setSoundReady] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const countdownRef = useRef(null);
  const [pendingBet, setPendingBet] = useState(null);

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const coinLift = useRef(new Animated.Value(0)).current;
  const handShake = useRef(new Animated.Value(0)).current;
  const handOpacity = useRef(new Animated.Value(1)).current;
  const timerOpacity = useRef(new Animated.Value(1)).current;
  const timerScale = useRef(new Animated.Value(1)).current;

  // prevents double press during flip
  const [betLocked, setBetLocked] = useState(false);

  // slider
  const SLIDER_MAX = 500;
  const DINAMIC_AMT = 1.96;
  const [customAmount, setCustomAmount] = useState(10);
  const [sliderWidth, setSliderWidth] = useState(1);
  const sliderX = useRef(new Animated.Value(0)).current;
  const panStart = useRef(0);

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

  const headsImg = require("../assets/images/coinflip/heads.png");
  const tailsImg = require("../assets/images/coinflip/tails.png");

  useEffect(() => {
    if (sliderWidth > 0) {
      sliderX.setValue((customAmount / SLIDER_MAX) * sliderWidth);
    }
  }, [sliderWidth, customAmount]);

  // ensure player-controlled volume toggles effect on loaded sound
  useEffect(() => {
    if (flipSoundRef.current && typeof flipSoundRef.current.setVolumeAsync === "function") {
      flipSoundRef.current.setVolumeAsync(soundOn ? 1 : 0).catch(() => {});
    }
  }, [soundOn]);

  // configure audio mode once
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // load flip sound once
  useEffect(() => {
    let mounted = true;
    const loadFlipSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/sounds/flip.mp3")
        );
        if (!mounted) {
          sound.unloadAsync();
          return;
        }
        flipSoundRef.current = sound;
        setSoundReady(true);
        // honour current soundOn
        if (sound) sound.setVolumeAsync(soundOn ? 1 : 0).catch(() => {});
      } catch (e) {
        console.log("Sound load error:", e);
      }
    };
    loadFlipSound();
    return () => { mounted = false; };
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const { locationX } = evt.nativeEvent;
      const knobX = sliderX._value + 14;
      return Math.abs(locationX - knobX) < 20;
    },
    onMoveShouldSetPanResponder: (evt, gesture) =>
      Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: () => {
      sliderX.stopAnimation((v) => (panStart.current = v));
    },
    onPanResponderMove: Animated.event(
      [null, { dx: sliderX }],
      {
        useNativeDriver: false,
        listener: (evt, gesture) => {
          let newX = panStart.current + gesture.dx;

          if (newX < 0) newX = 0;
          if (newX > sliderWidth) newX = sliderWidth;

          sliderX.setValue(newX);

          const val = Math.floor((newX / sliderWidth) * SLIDER_MAX);
          setCustomAmount(val);
        }
      }
    ),
    onPanResponderRelease: () => setAmount(customAmount),
  });

  // -------------------------- FLIP ANIMATION --------------------------
  const startFlip = () => {
    flipAnimation.setValue(0);
    coinLift.setValue(0);

    Animated.timing(handOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.sequence([
        Animated.timing(coinLift, {
          toValue: -170,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(coinLift, {
          toValue: 0,
          duration: 350,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(handShake, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(handShake, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]),
    ]).start(() => {
      Animated.timing(handOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };

  const rotateY = flipAnimation.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75],
    outputRange: ["0deg", "720deg", "1440deg", "2160deg"],
  });

  const coinOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [1, 0.4, 0.4, 1],
  });

  const wobble = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "10deg", "0deg"],
  });

  // -------------------------- COUNTDOWN (Mode B) --------------------------
  const startCountdown = (sec = 10) => {
    if (countdownRef.current) clearInterval(countdownRef.current);

    setSecondsLeft(sec);
    setIsCounting(true);

    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s > 1) {
          Animated.parallel([
            Animated.timing(timerOpacity, { toValue: 1.5, duration: 0, useNativeDriver: true }),
            Animated.timing(timerScale, { toValue: 2, duration: 500, useNativeDriver: true }),
          ]).start(() => {
            timerOpacity.setValue(1);
            timerScale.setValue(1);
          });
        }

        if (s <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setIsCounting(false);
          timerOpacity.setValue(1);
          timerScale.setValue(1);

          if (pendingBet) {
            const pb = pendingBet;
            setPendingBet(null);
            performBet(pb.amount, pb.choice);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  // -------------------------- BET PROCESSOR --------------------------
  const performBet = (amt, pick) => {
    setBetLocked(true);
    playFlipSound();
    startFlip();
    Vibration.vibrate(150);

    setTimeout(() => {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      setTimeout(() => setCoinFace(result), 450);

      setWallet((prev) => prev - Number(amt));
      let winAmount = 0;
      let status = "LOSE";

      if (result === pick) {
        winAmount = Number((amt * DINAMIC_AMT).toFixed(2));
        setWallet((prev) => prev + winAmount);
        status = "WIN";
      }

      addHistory(amt, pick, result, winAmount, status);
      showPopup({
        type: status === "WIN" ? "success" : "error",
        icon: status === "WIN" ? WinIcon : LoseIcon,
        text: status === "WIN" 
          ? `You Win! (${result})` 
          : `You Lose (${result})`,
      });

      setBetLocked(false);
      startCountdown(10);
    }, 900);
  };

  const playFlipSound = async () => {
    if (!soundReady || !flipSoundRef.current) return;
    try {
      // honour toggle via volume
      await flipSoundRef.current.replayAsync();
    } catch (e) {
      console.log("Sound error:", e);
    }
  };

  const showPopup = (msg) => {
    setPopupMsg(msg);
    setPopupVisible(true);
  };

  const addHistory = (amountVal, choiceVal, resultVal, winAmountVal, statusVal) => {
    const now = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const newItem = {
      id: `h-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      sr: history.length + 1,
      amount: amountVal,
      choice: choiceVal,
      result: resultVal,
      winAmount: winAmountVal,
      status: statusVal,
      createdAt: now.replace(",", ""),
    };
    setHistory((h) => [newItem, ...h].slice(0, 5));
  };
  // -------------------------- PLACE BET (Mode B) --------------------------
  const placeBet = () => {
    if (betLocked) return;
    if (!amount) return showPopup("Please select amount");
    if (!choice) return showPopup("Please choose Heads or Tails");
    if (wallet < amount) return showPopup("Not enough balance");

    if (isCounting) {
      if (pendingBet) {
        showPopup("You already have a queued bet.");
        return;
      }
      setPendingBet({ amount, choice });
      showPopup({
        type: "error",
        icon: RotateIcon,
        text: "Bet queued for next round!"
      });
      return;
    }

    setBetLocked(true);
    performBet(amount, choice);
  };

  // -------------------------- BetsListCard (inner component) --------------------------
  function BetsListCard({ dataSource, activeTab, setActiveTab }) {
    const allData = (dataSource && dataSource.length > 0)
      ? dataSource.map((it, idx) => ({
        id: it.sr ? String(it.sr) : String(idx + 1),
        name: it.name || `Player ${idx + 1}`,
        avatar: it.avatar || require("../assets/images/users.jpg"),
        amount: it.amount || it.bet || 100,
        multiplier: it.multiplier || "x1.94",
        profit: it.status === "WIN" ? (it.winAmount || 0) : -(it.amount || 0),
      }))
    : DUMMY;

    const myBets = allData.filter((d) => d.name && d.name.toLowerCase().includes("you"));
    const list = activeTab === "all" ? allData : myBets.length ? myBets : allData.slice(0, 5);
    const renderRow = ({ item }) => {
      const profitPositive = item.profit >= 0;
      return (
        <View style={styles.row}>
          <View style={styles.left}>
            <Image source={item.avatar} style={styles.avatar} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <Image source={
                    profitPositive ? require("../assets/images/coinflip/head_small.png") : require("../assets/images/coinflip/tails_small.png")
                  } style={styles.coinIcon}
                />
                <Text style={styles.meta}>
                  {profitPositive
                    ? Math.round(item.amount * parseFloat(item.multiplier.replace("x", "")))
                    : item.amount}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.right}>
            <View style={styles.multiplier}>
              <Text style={styles.multiplierText}>{item.multiplier}</Text>
            </View>

            <View style={[styles.profitPill, profitPositive ? styles.profitPos : styles.profitNeg]}>
              <Text style={[styles.profitText, profitPositive ? styles.profitTextPos : styles.profitTextNeg]}>
                {profitPositive ? `+₹${item.profit}` : `-₹${Math.abs(item.profit)}`}
              </Text>
            </View>
          </View>
        </View>
      );
    };

    return (
      <View style={styles.cardWrap}>
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, activeTab === "all" && styles.tabActive]} onPress={() => setActiveTab("all")}>
            <Text style={[styles.tabTxt, activeTab === "all" && styles.tabTxtActive]}>All Bets</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, activeTab === "mine" && styles.tabActive]} onPress={() => setActiveTab("mine")}>
            <Text style={[styles.tabTxt, activeTab === "mine" && styles.tabTxtActive]}>My Bets</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={list}
          keyExtractor={(i, idx) => i.id + "-" + idx}
          renderItem={renderRow}
          style={styles.list}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  // -------------------------- UI --------------------------
  return (
    <LinearGradient colors={["#06071C", "#0A0C2A", "#0E102F"]} style={styles.gradient}>
      <ResultPopup visible={popupVisible} message={popupMsg} onHide={() => setPopupVisible(false)} />

      <View style={styles.container}>
        <Image source={require("../assets/images/bg_image.png")} style={styles.bottomGlowImage} />

        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <BackIcon width={26} height={26} fill="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => setSoundOn((s) => !s)}>
            {soundOn ? <SoundOffIcon width={26} height={26} fill="#fff" /> : <SoundOnIcon width={26} height={26} fill="#fff" />}
          </TouchableOpacity>
        </View>

        <Animated.Image
          source={require("../assets/images/hand_image.png")}
          style={{
            width: 140,
            height: 140,
            resizeMode: "contain",
            marginTop: 90,
            opacity: handOpacity,
            left:25,
            transform: [{ rotateZ: handShake.interpolate({ inputRange: [0, 1], outputRange: ["-1deg", "25deg"] }) }],
          }}
        />

        {/* COIN ABOVE HAND */}
        <Animated.View style={[styles.coin, { position: "absolute", top:5, transform: [{ translateY: coinLift }, { rotateY }, { rotateX: wobble }] }]}>
          <Animated.Image source={coinFace === "Heads" ? headsImg : tailsImg} style={[styles.coinImg, { opacity: coinOpacity }]} />
        </Animated.View>

        <Animated.Text style={[isCounting ? styles.timerText : styles.timerReady, isCounting && { opacity: timerOpacity, transform: [{ scale: timerScale }] }]}>
          {isCounting ? `Next bet in ${secondsLeft}s` : "Place Your Bet"}
        </Animated.Text>

        {/* AMOUNT + IF WIN */}
        <View style={styles.rowBox}>
          <View style={styles.whiteBox}>
            <Text style={styles.boxLabel}>Bet Amount</Text>
            <Text style={styles.boxValue}>₹{customAmount}</Text>
          </View>

          <View style={styles.whiteBox}>
            <Text style={styles.boxLabel}>If Win: x{DINAMIC_AMT}</Text>
            <Text style={styles.boxValue}>₹{(customAmount * DINAMIC_AMT).toFixed(2)}</Text>
          </View>
        </View>

        {/* SLIDER */}
        <View style={styles.sliderBox}>
          <Text style={styles.sectionTitle}>Tap to choose amount</Text>
          <TouchableOpacity
            style={styles.sliderTrack}
            onPress={(e) => {
              let x = e.nativeEvent.locationX;
              if (x < 14) x = 14;
              if (x > sliderWidth - 14) x = sliderWidth - 14;
              const val = Math.round(((x - 14) / (sliderWidth - 28)) * SLIDER_MAX);
              setCustomAmount(val);
              setAmount(val);
              sliderX.setValue((val / SLIDER_MAX) * sliderWidth);
            }}
            onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View style={[styles.sliderFill, { width: sliderX }]} />
            <Animated.View style={[styles.sliderKnob, { transform: [{ translateX: sliderX }] }]} {...panResponder.panHandlers} />
          </TouchableOpacity>
        </View>

        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[styles.choiceBtn, choice === "Heads" && styles.headsSelected]}
            onPress={() => setChoice("Heads")}
          >
            <Image source={require("../assets/images/coinflip/head_small.png")} style={styles.choiceIcon} />
            <Text style={styles.choiceText}>Heads</Text>
          </TouchableOpacity>

          {/* TAILS BUTTON */}
          <TouchableOpacity
            style={[styles.choiceBtn, choice === "Tails" && styles.tailsSelected]}
            onPress={() => setChoice("Tails")}
          >
            <Image source={require("../assets/images/coinflip/tails_small.png")} style={styles.choiceIcon} />
            <Text style={styles.choiceText}>Tails</Text>
          </TouchableOpacity>

        </View>

        <CustomButton
          title={amount > 0 ? `Place Bet ₹${amount}` : "Place Bet"}
          style={styles.betBtn}
          onPress={placeBet}
          disabled={betLocked || (isCounting && pendingBet !== null)}
        />

        <BetsListCard 
          dataSource={history.length ? history : DUMMY}
          activeTab={betsTab}
          setActiveTab={setBetsTab}
        />

      </View>
    </LinearGradient>
  );
}

// --------------------- STYLES ---------------------
const styles = StyleSheet.create({
  gradient: { flex: 1 },

  container: {
    flex: 1,
    alignItems: "center",
    // paddingTop: 20,
  },

  bottomGlowImage: {
    position: "absolute",
    bottom: -60,
    width: "140%",
    height: 220,
    left: "-20%",
    opacity: 0.9,
  },

  timerText: {
    color: "#ffd166",
    // marginTop: 90,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
  },

  timerReady: {
    color: "#7ce3ff",
    // marginTop: 90,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
  },

  coin: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  coinImg: {
    width: 110,
    height: 110,
    resizeMode: "contain",
  },

  rowBox: {
    width: "80%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  whiteBox: {
    width: "48%",
    backgroundColor: "#ffffff06",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffffff15",
  },

  boxLabel: { fontSize: 12, color: "#bbb" },
  boxValue: { fontSize: 20, color: "#fff", fontWeight: "700" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
  },

  sliderBox: {
    width: "80%",
    marginBottom: 12,
  },

  sliderTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#1e1e2e",
    borderRadius: 10,
  },

  sliderFill: {
    height: "90%",
    backgroundColor: "#198754",
    borderRadius: 10,
    position: "absolute",
    left: 0,
    top: 0,
  },

  sliderKnob: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#198754",
    position: "absolute",
    top: -11,
  },

  choiceRow: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  choiceBtn: {
    width: "45%",
    paddingVertical: 8,
    backgroundColor: "#2b2f3a",
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  choiceIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  headsSelected: { backgroundColor: "#198754" },
  tailsSelected: { backgroundColor: "#dc3545" },

  choiceText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  betBtn: {
    width: "90%",
    marginTop: 10,
  },

  /* ---------- Updated Bets card styles (UI only) ---------- */
  cardWrap: {
    width: "100%",
    backgroundColor: "#0A1A22",
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
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#07141B",
    borderRadius: 14,
    padding: 3,
    marginBottom: 5,
    justifyContent: "space-between",
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "rgba(0, 194, 255, 0.18)",
  },

  tabTxt: {
    color: "#8FAAB7",
    fontWeight: "700",
    fontSize: 14,
  },

  tabTxtActive: {
    color: "#E6FAFF",
  },

  list: { width: "100%" },

  /* Row styling same as screenshot */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  avatar: {
    width: 25,
    height: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  name: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    maxWidth: width * 0.4,
  },

  meta: {
    color: "#C0CEDA",
    fontSize: 12,
    marginLeft: 4,
  },

  coinIcon: {
    width: 12,
    height: 12,
    tintColor: "#FFD54A",
    marginRight: 2,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  /* Multiplier pill */
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
  profitPill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
  },

  profitPos: {
    backgroundColor: "rgba(34,197,94,0.20)",
  },

  profitNeg: {
    backgroundColor: "rgba(239,68,68,0.20)",
  },

  profitText: {
    fontWeight: "700",
    fontSize: 13,
  },
  profitTextPos: { color: "#22c55e" },
  profitTextNeg: { color: "#ef4444" },
  sep: { height: 5 },

  /* ---------- other styles ---------- */
  topBar: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 10,
    zIndex: 100,
  },
  iconBtn: {
    padding: 6,
    backgroundColor: "#0E2B33",
    borderRadius: 8,
  },
  walletBtn: {
    backgroundColor: "#4f46e5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  walletBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  icon: {
    width: 28,
    height: 28,
    tintColor: "#ffffff",
    color: "#ffffff",
  },
});
