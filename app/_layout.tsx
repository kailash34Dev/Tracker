// React imports
import { useEffect, useState, useCallback } from 'react';
// React-native imports
import { View, Text } from 'react-native';
// Expo imports
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
// Theme imports
import { colors } from '../src/theme/colors';
// DB imports
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import migrations from '../drizzle/migrations';
// Components imports
import AnimatedSplashScreen from '../src/components/AnimatedSplashScreen';
import GlobalToast from '../src/components/GlobalToast';

SplashScreen.preventAutoHideAsync();

// Create a separate connection for migrations without enableChangeListener to prevent deadlock
const migrationDb = drizzle(SQLite.openDatabaseSync('tracker.db', { enableChangeListener: false }));

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
  });

  const { success, error: migrationError } = useMigrations(migrationDb, migrations);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  const handleAnimationComplete = useCallback(() => {
    setSplashAnimationComplete(true);
  }, []);

  useEffect(() => {
    if ((loaded && success) || fontError || migrationError) {
      SplashScreen.hideAsync();
    }
  }, [loaded, success, fontError, migrationError]);

  if (!loaded || !success) {
    if (migrationError || fontError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Error: {(migrationError || fontError)?.message}</Text>
        </View>
      );
    }
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

      {!splashAnimationComplete && (
        <AnimatedSplashScreen onAnimationComplete={handleAnimationComplete} />
      )}

      <GlobalToast />
    </View>
  );
}
