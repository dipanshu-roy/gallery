import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Splash1 from "../screens/Splash1";
import Splash2 from "../screens/Splash2";
import CoinScreen from "../screens/CoinScreen";
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ColorGameScreen from '../screens/ColorGames2Screen';
import WithdrawScreen from '../screens/WithdrawScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OtpScreen from '../screens/OtpScreen';
import MainTabs from './MainTabs';
import AppHeader from '../components/AppHeader';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Splash1" component={Splash1} options={{ headerShown: false }}/>
        <Stack.Screen name="Splash2" component={Splash2} options={{ headerShown: false }}/>
        <Stack.Screen name="OtpScreen" component={OtpScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>

        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="Dashboard" 
          component={MainTabs}
          options={{ header: () => <AppHeader/> }}
        />

        <Stack.Screen 
          name="CoinFlip" 
          component={CoinScreen}
          options={{
            header: () => <AppHeader />
          }}
        />
        <Stack.Screen 
          name="ColorGame" 
          component={ColorGameScreen}
          options={{
            header: () => <AppHeader />
          }}
        />
        <Stack.Screen 
          name="Withdraw" 
          component={WithdrawScreen}
          options={{ header: () => <AppHeader/> }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
