import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Splash1 from "../screens/Splash1";
import LoginScreen from '../screens/LoginScreen';
import DistrictScreen from '../screens/DistrictScreen';
import LocationScreen from '../screens/LocationScreen';
import ProgrammeScreen from '../screens/ProgrammeScreen';
import UploadWebView from '../screens/UploadWebView';
import ProfileScreen from '../screens/ProfileScreen';
import ProgrammeMediaScreen from '../screens/ProgrammeMediaScreen';
import MediaOverviewScreen from '../screens/MediaOverviewScreen';
import MainTabs from './MainTabs';
import AppHeader from '../components/AppHeader';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ initialRoute }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Splash1" component={Splash1} options={{ headerShown: false }} />
        {/* <Stack.Screen name="OtpScreen" component={OtpScreen} options={{ headerShown: false }} /> */}
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ header: () => <AppHeader /> }} />
        <Stack.Screen name="UploadWebView" component={UploadWebView} options={{ header: () => <AppHeader /> }} />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={MainTabs}
          options={{ header: () => <AppHeader /> }}
        />
        <Stack.Screen
          name="District"
          component={DistrictScreen}
          options={{ header: () => <AppHeader /> }}
        />
        <Stack.Screen
          name="Programme"
          component={ProgrammeScreen}
          options={{ header: () => <AppHeader /> }}
        />
        <Stack.Screen
          name="Location"
          component={LocationScreen}
          options={{ header: () => <AppHeader /> }}
        />
        <Stack.Screen
          name="ProgrammeMedia"
          component={ProgrammeMediaScreen}
          options={{ header: () => <AppHeader /> }}
        />
        <Stack.Screen
          name="MediaOverview"
          component={MediaOverviewScreen}
          options={{ header: () => <AppHeader /> }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
