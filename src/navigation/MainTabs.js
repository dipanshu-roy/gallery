import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import DashboardScreen from "../screens/DashboardScreen";
import DistrictScreen from "../screens/DistrictScreen";
import LocationScreen from "../screens/LocationScreen";
import ProgrammeScreen from "../screens/ProgrammeScreen";
import ProfileScreen from "../screens/ProfileScreen";

import HomeIcon from "../assets/icons/home.svg";
import DistrictIcon from "../assets/icons/qrcode-location.svg";
import LocationIcon from "../assets/icons/region-pin-alt.svg";
import ListIcon from "../assets/icons/list.svg";
import ProgrammeIcon from "../assets/icons/schedule.svg";
import SettingsIcon from "../assets/icons/profile.svg";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: "#000000",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          marginTop: 15,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={["#1982beff", "#56c1ffff"]}
            start={{ x: 1, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
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
      <Tab.Screen
        name="District"
        component={DistrictScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabButton
              icon={<DistrictIcon width={24} height={24} fill={focused ? "#fff" : "#c8d4e8"} />}
              label="District"
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Location"
        component={LocationScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabButton
              icon={<LocationIcon width={24} height={24} fill={focused ? "#fff" : "#c8d4e8"} />}
              label="Location"
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Programme"
        component={ProgrammeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabButton
              icon={<ProgrammeIcon width={24} height={24} fill={focused ? "#fff" : "#c8d4e8"} />}
              label="Programme"
              focused={focused}
            />
          ),
        }}
      />


      {/* Settings */}
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabButton
              icon={<SettingsIcon width={24} height={24} fill={focused ? "#fff" : "#c8d4e8"} />}
              label="Profile"
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
  tabBarItemStyle: {
    marginTop: 0,
  },
  tabButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 60,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 5,
  },
  iconActive: {
    backgroundColor: "rgba(29, 120, 176, 0.18)",
    borderRadius: 5,
  },
  activeBg: {
    position: "absolute",
    bottom: 0,
    width: 70,
    height: 64,
    backgroundColor: "rgba(107, 169, 236, 0.71)",
    borderRadius: 5,
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
