import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import DashboardScreen from "../screens/DashboardScreen";
import WithdrawScreen from "../screens/WithdrawScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import SettingsScreen from "../screens/SettingsScreen";

import HomeIcon from "../assets/icons/home.svg";
import WithdrawIcon from "../assets/icons/deposit.svg";
import ListIcon from "../assets/icons/list.svg";
import SettingsIcon from "../assets/icons/settings.svg";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <LinearGradient
            colors={["#0A244A", "#0E354F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 10 }}
          />
        ),
      }}
    >
      {/* HOME */}
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabButton
              icon={<HomeIcon width={24} height={24} fill={focused ? "#fff" : "#c8d4e8"} />}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />

      {/* Withdraw */}
      <Tab.Screen
        name="Withdraw"
        component={WithdrawScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabButton
              icon={<WithdrawIcon width={24} height={24} fill={focused ? "#fff" : "#c8d4e8"} />}
              label="Withdraw"
              focused={focused}
            />
          ),
        }}
      />

      {/* Transactions */}
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabButton
              icon={<ListIcon width={24} height={24} fill={focused ? "#fff" : "#c8d4e8"} />}
              label="Transactions"
              focused={focused}
            />
          ),
        }}
      />

      {/* Settings */}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabButton
              icon={<SettingsIcon width={24} height={24} fill={focused ? "#fff" : "#c8d4e8"} />}
              label="Settings"
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
function TabButton({ icon, label, focused }) {
  return (
    <View style={styles.tabButtonWrapper}>
      {focused && <View style={styles.activeBg} />}
      <View style={[styles.iconContainer, focused && styles.iconActive]}>
        {icon}
      </View>
      <Text style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    position: "absolute",
    bottom: 20,
    left: "5%",
    right: "5%",
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "transparent",
    borderTopWidth: 0,
    elevation: 0,
  },
  tabButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 70,
    marginTop:40
  },

  iconContainer: {
    padding: 8,
    borderRadius: 14,
  },

  iconActive: {
    backgroundColor: "rgba(56, 180, 255, 0.18)",
    borderRadius: 10,
  },

  activeBg: {
    position: "absolute",
    bottom: 0,
    width: 70,
    height: 70,
    backgroundColor: "rgba(56, 180, 255, 0.18)",
    borderRadius: 15,
  },

  label: {
    fontSize: 12,
    marginTop: 2,
  },
  labelActive: {
    color: "#fff",
    fontWeight: "600",
  },
  labelInactive: {
    color: "#c8d4e8",
  },
});
