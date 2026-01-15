import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "AUTH_TOKEN";
const SPLASH_KEY = "SPLASH_SHOWN";

export const saveToken = async (token) => {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  } else {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }
};

export const removeToken = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};


/* =========================
   SPLASH SCREEN (ONCE)
========================= */

export const setSplashShown = async () => {
  if (Platform.OS === "web") {
    localStorage.setItem(SPLASH_KEY, "true");
  } else {
    await AsyncStorage.setItem(SPLASH_KEY, "true");
  }
};

export const isSplashShown = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem(SPLASH_KEY) === "true";
  } else {
    const value = await AsyncStorage.getItem(SPLASH_KEY);
    return value === "true";
  }
};

export const resetSplash = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem(SPLASH_KEY);
  } else {
    await AsyncStorage.removeItem(SPLASH_KEY);
  }
};