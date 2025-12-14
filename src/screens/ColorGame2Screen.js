import React, { useState, useEffect, useRef, useContext } from "react";
import { View, Text, Image, TouchableOpacity, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import WalletContext from "../components/WalletContext";
import ResultPopup from "../components/ResultPopup";
import CustomButton from "../components/CustomButton";
import BackIcon from "../assets/icons/angle-left.svg";
import SoundOnIcon from "../assets/icons/volume-up.svg";
import SoundOffIcon from "../assets/icons/volume-down.svg";

const COLORS = ["red", "green", "yellow", "blue"];
const { width } = Dimensions.get("window");

export default function ColorGameScreen({ navigation }) {
  const { setWallet } = useContext(WalletContext);

  const [cards, setCards] = useState([]);
  const [winningColor, setWinningColor] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [betPlaced, setBetPlaced] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isCounting, setIsCounting] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMsg, setPopupMsg] = useState({});
  const [amount, setAmount] = useState(100);
  const [soundOn, setSoundOn] = useState(true);

  const betAmounts = [10, 20, 40, 50, 100, 500];
  const flipRefs = useRef([]);

  /* ---------- START GAME ---------- */
  useEffect(() => {
    resetGame();
  }, []);

  /* ---------- TIMER ---------- */
  useEffect(() => {
    if (!isCounting) return;

    if (secondsLeft === 0) {
      setIsCounting(false);

      if (!betPlaced) {
        resetGame(); // ⛔ no bet → no win/lose
        return;
      }
    }

    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, isCounting]);

  /* ---------- RESET GAME ---------- */
  const resetGame = () => {
    const systemColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setWinningColor(systemColor);

    const winIndex = Math.floor(Math.random() * 4);
    const newCards = Array(4).fill(null).map((_, i) => {
      if (i === winIndex) return systemColor;
      return COLORS.filter(c => c !== systemColor)[Math.floor(Math.random() * 3)];
    });

    setCards(newCards);
    flipRefs.current = newCards.map(() => new Animated.Value(0));
    setSelectedCard(null);
    setBetPlaced(false);
    setSecondsLeft(10);
    setIsCounting(true);
  };

  /* ---------- SELECT CARD ---------- */
  const pickCard = (index) => {
    if (!isCounting || betPlaced) return;
    setSelectedCard(index);
  };

  /* ---------- PLACE BET ---------- */
  const placeBet = () => {
    if (selectedCard === null) {
        setPopupMsg({ type: "error", text: "Select a card first" });
        setPopupVisible(true);
        return;
    }

    setBetPlaced(true);
    setIsCounting(false);

    flipRefs.current.forEach(anim =>
        Animated.timing(anim, {
        toValue: 180,
        duration: 500,
        useNativeDriver: true,
        }).start()
    );

    const cardColor = cards[selectedCard];

    if (cardColor === winningColor) {
        setWallet(w => w + amount * 2);
        setPopupMsg({ type: "success", text: `You Won! Color: ${winningColor}` });
    } else {
        setWallet(w => w - amount);
        setPopupMsg({ type: "error", text: `You Lost! Color: ${winningColor}` });
    }

    setPopupVisible(true);
    setTimeout(resetGame, 3000);
  };


  /* ---------- CARD ---------- */
  const FlipCard = ({ index, color }) => {
    const anim = flipRefs.current[index];

    const frontRotate = anim.interpolate({
      inputRange: [0, 180],
      outputRange: ["0deg", "180deg"],
    });

    const backRotate = anim.interpolate({
      inputRange: [0, 180],
      outputRange: ["180deg", "360deg"],
    });

    const img = {
      red: require("../assets/images/color_game/red.png"),
      green: require("../assets/images/color_game/green.png"),
      yellow: require("../assets/images/color_game/yellow.png"),
      blue: require("../assets/images/color_game/blue.png"),
    }[color];

    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => pickCard(index)}
        activeOpacity={0.9}
      >
        <View
          style={[
            styles.card,
            selectedCard === index && styles.selectedCard,
          ]}
        >
          <Animated.View style={[styles.face, { transform: [{ rotateY: frontRotate }] }]}>
            <Image source={require("../assets/images/color_game/card.png")} style={styles.img} />
          </Animated.View>

          <Animated.View style={[styles.face, { transform: [{ rotateY: backRotate }] }]}>
            <Image source={img} style={styles.img} />
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  /* ---------- UI ---------- */
  return (
    <LinearGradient colors={["#06071C", "#0A0C2A", "#0E102F"]} style={{ flex: 1 }}>
      <ResultPopup visible={popupVisible} message={popupMsg} onHide={() => setPopupVisible(false)} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <BackIcon width={26} height={26} fill="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setSoundOn(!soundOn)}>
          {soundOn ? <SoundOnIcon width={26} height={26} fill="#fff" /> : <SoundOffIcon width={26} height={26} fill="#fff" />}
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Text style={styles.timerText}>
          {isCounting ? `Choose card in ${secondsLeft}s` : "Revealing..."}
        </Text>

        <View style={styles.systemColorBox}>
          <Text style={styles.systemText}>System Color</Text>
          <View style={[styles.colorIndicator, { backgroundColor: winningColor }]} />
        </View>

        <View style={styles.cardGrid}>
          {cards.map((c, i) => <FlipCard key={i} index={i} color={c} />)}
        </View>

        <View style={styles.amountRow}>
          {betAmounts.map(amt => (
            <TouchableOpacity
              key={amt}
              onPress={() => setAmount(amt)}
              style={[
                styles.amountBtn,
                amount === amt && styles.amountActive,
              ]}
            >
              <Text style={styles.amountText}>₹{amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton
        title={`Place Bet ₹${amount}`}
        onPress={placeBet}
        disabled={selectedCard === null}
        />

      </View>
    </LinearGradient>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  topBar: {
    position: "absolute",
    top: 15,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: "#0E2B33",
    borderRadius: 10,
  },
  timerText: {
    color: "#7ce3ff",
    fontSize: 20,
    marginBottom: 10,
  },
  systemColorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  systemText: { color: "#fff", fontSize: 16 },
  colorIndicator: {
    width: 30,
    height: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#fff",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "90%",
  },
  cardWrapper: { width: "48%", marginBottom: 15 },
  card: {
    aspectRatio: 0.72,
    borderRadius: 14,
    overflow: "hidden",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#00C8FF",
  },
  face: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  },
  img: { width: "100%", height: "100%" },
  amountRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  amountBtn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#1B2A34",
  },
  amountActive: { backgroundColor: "#00C8FF" },
  amountText: { color: "#fff", fontWeight: "700" },
};
