import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import WalletContext from "../components/WalletContext";

const COLOR= [
  { name: "Red", value: "red" },
  { name: "Yellow", value: "yellow" },
  { name: "Green", value: "green" },
  { name: "Blue", value: "blue" },
  { name: "Pink", value: "pink" },
  { name: "Teal", value: "teal" },
];

const BETS = [10, 20, 50, 100, 500];

export default function ColorGameScreen() {
  const { wallet, setWallet } = useContext(WalletContext);

  const [selectedColor, setSelectedColor] = useState(null);
  const [amount, setAmount] = useState(100);
  const [locked, setLocked] = useState(false);
  const [resultColor, setResultColor] = useState(null);
  const [lastBets, setLastBets] = useState([]);

  const playGame = () => {
    if (!selectedColor || locked) return;

    if (wallet < amount) {
      alert("Insufficient balance");
      return;
    }

    setLocked(true);
    setWallet(prev => prev - amount);

    setTimeout(() => {
      const random =
        COLORS[Math.floor(Math.random() * COLORS.length)].value;
      setResultColor(random);

      let winAmount = 0;

      if (random === selectedColor) {
        winAmount = amount * 1.96;
        setWallet(prev => prev + winAmount);
      }

      setLastBets(prev => [
        {
          id: Date.now(),
          color: selectedColor,
          amount,
          result: random === selectedColor ? `+₹${winAmount}` : `-₹${amount}`,
        },
        ...prev,
      ]);

      setLocked(false);
      setSelectedColor(null);
    }, 2000);
  };

  const resetGame = () => {
    setSelectedColor(null);
    setResultColor(null);
  };

  return (
    <LinearGradient colors={["#b993ff", "#e6d9ff"]} style={styles.container}>
      {/* RESULT BOX */}
      <View style={styles.resultBox}>
        <View
          style={[
            styles.resultColor,
            { backgroundColor: resultColor || "#ddd" },
          ]}
        />
        <View style={styles.roadmap}>
          <Text style={styles.roadTitle}>ROADMAP</Text>
          <Text>🔴 22%</Text>
          <Text>🟡 20%</Text>
          <Text>🟢 27%</Text>
        </View>
      </View>

      {/* COLOR GRID */}
      <View style={styles.grid}>
        {COLORS.map(item => (
          <TouchableOpacity
            key={item.value}
            disabled={locked}
            onPress={() => setSelectedColor(item.value)}
            style={[
              styles.colorBox,
              { backgroundColor: item.value },
              selectedColor === item.value && styles.active,
            ]}
          >
            <Text style={styles.colorText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BET AMOUNTS */}
      <View style={styles.betRow}>
        {BETS.map(b => (
          <TouchableOpacity
            key={b}
            onPress={() => setAmount(b)}
            style={[
              styles.betBtn,
              amount === b && styles.betActive,
            ]}
          >
            <Text style={amount === b && { color: "#fff" }}>{b}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ACTION BUTTON */}
      <TouchableOpacity
        style={styles.lockBtn}
        onPress={playGame}
        disabled={locked}
      >
        <Text style={styles.lockText}>
          {locked ? "PLAYING..." : `LOCK & DROP (₹${amount})`}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resetGame} style={styles.resetBtn}>
        <Text>Reset</Text>
      </TouchableOpacity>

      {/* LAST BETS */}
      <Text style={styles.lastTitle}>Last Bets</Text>
      <FlatList
        data={lastBets}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.betItem}>
            <Text>Bet ₹{item.amount} · {item.color}</Text>
            <Text
              style={{
                color: item.result.startsWith("+") ? "green" : "red",
              }}
            >
              {item.result}
            </Text>
          </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  resultBox: {
    backgroundColor: "#f7f7f7",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultColor: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  roadmap: { alignItems: "flex-end" },
  roadTitle: { fontWeight: "bold" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 15,
    justifyContent: "space-between",
  },
  colorBox: {
    width: "32%",
    height: 70,
    borderRadius: 10,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  active: {
    borderWidth: 3,
    borderColor: "#000",
  },
  colorText: {
    color: "#fff",
    fontWeight: "bold",
  },

  betRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  betBtn: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 20,
    width: 60,
    alignItems: "center",
  },
  betActive: {
    backgroundColor: "#000",
  },

  lockBtn: {
    backgroundColor: "#ffb703",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 10,
  },
  lockText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  resetBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
  },
  lastTitle: {
    fontWeight: "bold",
    marginTop: 15,
  },
  betItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
});
