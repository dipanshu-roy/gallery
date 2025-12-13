import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import WalletContext from "../components/WalletContext";
import BackIcon from "../assets/icons/angle-left.svg";

export default function WithdrawScreen({ navigation, route }) {
  const { wallet } = useContext(WalletContext);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const amounts = [100, 200, 500, 1000, 2000, 3000, 5000];

  return (
    <LinearGradient colors={["#06071C", "#0A0C2A", "#0E102F"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <BackIcon width={26} height={26} fill="#fff" />
          </TouchableOpacity>
        </View>

        {/* BALANCE SECTION */}
        <View style={styles.balanceRow}>
          <View style={[styles.balanceCard, { backgroundColor: "#0A772F" }]}>
            <Text style={styles.balanceTitle}>WALLET BALANCE</Text>
            <Text style={styles.balanceValue}>₹{wallet}.00</Text>
          </View>

          <View style={[styles.balanceCard, { backgroundColor: "#C53030" }]}>
            <Text style={styles.balanceTitle}>WITHDRAWALS</Text>
            <Text style={styles.balanceValue}>₹0.00</Text>
          </View>
        </View>

        {/* MIN/MAX INFO */}
        <Text style={styles.miniText}>Withdraw Amount: Min: ₹100 Max: ₹5000</Text>

        {/* INPUT BOX */}
        <View style={styles.inputBox}>
          <Image
            source={require("../assets/images/coinflip/head_small.png")}
            style={{ width: 20, height: 20, tintColor: "gold" }}
          />
          <TextInput
            style={styles.input}
            value={withdrawAmount}
            placeholder="₹ Amount"
            placeholderTextColor="#999"
            keyboardType="numeric"
            onChangeText={(v) => setWithdrawAmount(v)}
          />
          {withdrawAmount.length > 0 && (
            <TouchableOpacity onPress={() => setWithdrawAmount("")}>
              <Text style={{ color: "#fff", fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* BUTTON OPTIONS */}
        <View style={styles.amountGrid}>
          {amounts.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[styles.amountBtn, withdrawAmount == amt && styles.amountBtnActive]}
              onPress={() => setWithdrawAmount(String(amt))}
            >
              <Text style={[styles.amountBtnTxt, withdrawAmount == amt && styles.amountBtnTxtActive]}>
                ₹{amt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PAY BUTTON */}
        <TouchableOpacity style={styles.payBtn}>
          <Text style={styles.payBtnTxt}>Withdraw Now ₹{withdrawAmount || 0}</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 90,
  },

  topBar: {
    width: "100%",
    paddingHorizontal: 20,
    position: "absolute",
    top: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    zIndex: 100,
  },

  iconBtn: {
    padding: 6,
    backgroundColor: "#0E2B33",
    borderRadius: 8,
  },

  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 20,
  },

  balanceCard: {
    width: "48%",
    paddingVertical: 20,
    borderRadius: 12,
    paddingHorizontal: 10,
  },

  balanceTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  balanceValue: {
    color: "#fff",
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
  },

  miniText: {
    color: "#bbb",
    width: "90%",
    marginBottom: 10,
    fontSize: 12,
  },

  inputBox: {
    width: "90%",
    backgroundColor: "#0D1A22",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ffffff20",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  amountGrid: {
    width: "90%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 20,
  },

  amountBtn: {
    width: "30%",
    backgroundColor: "#0E2B33",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },

  amountBtnActive: {
    backgroundColor: "#3CB4FF",
  },

  amountBtnTxt: {
    color: "#8FBACF",
    fontWeight: "700",
  },

  amountBtnTxtActive: {
    color: "#fff",
  },

  payBtn: {
    width: "90%",
    backgroundColor: "#3CB4FF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  payBtnTxt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
