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
} from "react-native";

import { Audio } from "expo-av";
import BackIcon from "../assets/icons/angle-left.svg";
import SoundOnIcon from "../assets/icons/volume-up.svg";
import SoundOffIcon from "../assets/icons/volume-down.svg";

export default function CoinScreen() {
  const navigation = useNavigation();
  const { wallet, setWallet } = useContext(WalletContext);

  // betting states
  const [amount, setAmount] = useState("");
  const [choice, setChoice] = useState(null);
  const [coinFace, setCoinFace] = useState("Heads");
  const [history, setHistory] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [soundOn, setSoundOn] = useState(true);

  // sound
  const flipSoundRef = useRef(null);
  const [soundReady, setSoundReady] = useState(false);

  // countdown & queue (Mode B)
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const countdownRef = useRef(null);
  const [pendingBet, setPendingBet] = useState(null);

  // animations
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
  const [customAmount, setCustomAmount] = useState(50);
  const [sliderWidth, setSliderWidth] = useState(1);
  const sliderX = useRef(new Animated.Value(0)).current;
  const panStart = useRef(0);

  const headsImg = require("../assets/images/coinflip/heads.png");
  const tailsImg = require("../assets/images/coinflip/tails.png");

  // sync slider pos
  useEffect(() => {
    if (sliderWidth > 0) {
      sliderX.setValue((customAmount / SLIDER_MAX) * sliderWidth);
    }
  }, [sliderWidth, customAmount]);

  // cleanup countdown on unmount
  useEffect(() => {
    if (flipSoundRef.current) {
      flipSoundRef.current.setVolumeAsync(soundOn ? 1 : 0);
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
          // if component unmounted early, unload
          sound.unloadAsync();
          return;
        }
        flipSoundRef.current = sound;
        setSoundReady(true);
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
    onPanResponderMove: (evt, gesture) => {
      let newX = panStart.current + gesture.dx;
      if (newX < 0) newX = 0;
      if (newX > sliderWidth) newX = sliderWidth;

      sliderX.setValue(newX);
      const newAmount = Math.round((newX / sliderWidth) * SLIDER_MAX);
      setCustomAmount(newAmount);
    },
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
    // clear previous if any
    if (countdownRef.current) clearInterval(countdownRef.current);

    setSecondsLeft(sec);
    setIsCounting(true);

    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        // small animation when ticking
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
          // countdown finished
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setIsCounting(false);
          timerOpacity.setValue(1);
          timerScale.setValue(1);

          // If there's a pending bet, execute it now
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
  // performBet uses passed amt & pick (not outer states)
  const performBet = (amt, pick) => {
    // lock during flip
    setBetLocked(true);

    // play sound (respects mute inside)
    playFlipSound();

    // start coin animation
    startFlip();
    Vibration.vibrate(150);

    // resolve after animation
    setTimeout(() => {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      setTimeout(() => setCoinFace(result), 450);

      // wallet adjust
      setWallet((prev) => prev - Number(amt));
      let winAmount = 0;
      let status = "LOSE";

      if (result === pick) {
        winAmount = Number((amt * DINAMIC_AMT).toFixed(2));
        setWallet((prev) => prev + winAmount);
        status = "WIN";
      }

      addHistory(amt, pick, result, winAmount, status);
      showPopup(status === "WIN" ? `🎉 You Win! (${result})` : `😢 You Lose (${result})`);

      // unlock
      setBetLocked(false);

      startCountdown(10);
    }, 900);
  };

  const playFlipSound = async () => {
    if (!soundReady || !flipSoundRef.current) return;
    try {
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

    setHistory((h) => [
      {
        sr: h.length + 1,
        amount: amountVal,
        choice: choiceVal,
        result: resultVal,
        winAmount: winAmountVal,
        status: statusVal,
        createdAt: now.replace(",", ""),
      },
      ...h,
    ].slice(0, 5));
  };

  // -------------------------- PLACE BET (Mode B: queue behaviour) --------------------------
  const placeBet = () => {
    if (betLocked) return;
    if (!amount) return showPopup("Please select amount");
    if (!choice) return showPopup("Please choose Heads or Tails");
    if (wallet < amount) return showPopup("Not enough balance");

    // If a round is currently counting down, queue this bet (only one pending allowed)
    if (isCounting) {
      if (pendingBet) {
        showPopup("You already have a queued bet.");
        return;
      }
      setPendingBet({ amount, choice });
      showPopup("Bet queued for next round!");
      return;
    }

    // If not counting (i.e. idle), perform immediately
    setBetLocked(true);
    performBet(amount, choice);
  };

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
            width: 160,
            height: 160,
            resizeMode: "contain",
            marginTop: 90,
            opacity: handOpacity,
            left:25,
            transform: [{ rotateZ: handShake.interpolate({ inputRange: [0, 1], outputRange: ["-5deg", "25deg"] }) }],
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
            <Image
              source={require("../assets/images/coinflip/head_small.png")}
              style={styles.choiceIcon}
            />
            <Text style={styles.choiceText}>Heads</Text>
          </TouchableOpacity>

          {/* TAILS BUTTON */}
          <TouchableOpacity
            style={[styles.choiceBtn, choice === "Tails" && styles.tailsSelected]}
            onPress={() => setChoice("Tails")}
          >
            <Image
              source={require("../assets/images/coinflip/tails_small.png")}
              style={styles.choiceIcon}
            />
            <Text style={styles.choiceText}>Tails</Text>
          </TouchableOpacity>

        </View>


        <CustomButton
          title={amount > 0 ? `Place Bet ₹${amount}` : "Place Bet"}
          style={styles.betBtn}
          onPress={placeBet}
          disabled={betLocked || (isCounting && pendingBet !== null)}
        />

        {/* HISTORY */}
        <View style={styles.historyWrap}>
          <Text style={styles.historyTitle}>Last 5 Bets</Text>

          <ScrollView style={{ maxHeight: 200 }}>
            {history.map((item, idx) => (
              <View key={idx} style={styles.historyItem}>
                <Text style={styles.fontWeight700}>#{item.sr}</Text>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.historyText}>Bet: ₹{item.amount}</Text>
                  <Text style={styles.historyText}>Choice: {item.choice}</Text>
                  <Text style={styles.historyText}>Result: {item.result}</Text>
                  <Text style={styles.historyText}>Date: {item.createdAt}</Text>
                </View>

                <Text style={[styles.fontWeight700, { color: item.status === "WIN" ? "#22c55e" : "#ef4444" }]}>
                  {item.status === "WIN" ? `+₹${item.winAmount}` : `-₹${item.amount}`}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
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
    width: 130,
    height: 130,
    resizeMode: "contain",
  },

  rowBox: {
    width: "90%",
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
    marginBottom: 8,
  },

  sliderBox: {
    width: "90%",
    marginBottom: 12,
  },

  sliderTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#1e1e2e",
    borderRadius: 10,
  },

  sliderFill: {
    height: "100%",
    backgroundColor: "#7d4cff",
    borderRadius: 10,
    position: "absolute",
    left: 0,
    top: 0,
  },

  sliderKnob: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#6b4ce0",
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
    width: "35%",
    paddingVertical: 5,
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

  historyWrap: {
    width: "90%",
    marginTop: 14,
  },

  historyTitle: { color: "#fff", fontWeight: "700", marginBottom: 6 },

  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ffffff15",
  },

  historyText: { color: "#cbd5e1", fontSize: 12 },

  fontWeight700: { fontWeight: "700", color: "#fff" },
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
