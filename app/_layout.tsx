import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold 
} from '@expo-google-fonts/plus-jakarta-sans';
import { colors } from '../src/theme/colors';
import { TimerProvider } from '../src/context/TimerContext';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '../src/db';
import migrations from '../drizzle/migrations';
import AnimatedSplashScreen from '../src/components/AnimatedSplashScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
  });

  const { success, error } = useMigrations(db, migrations);
  const [appReady, setAppReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  useEffect(() => {
    if (loaded && success) {
      setAppReady(true);
      // Hide native splash screen immediately, since our AnimatedSplashScreen takes over
      SplashScreen.hideAsync();
    }
  }, [loaded, success]);

  if (!loaded || !success) {
    if (error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Migration error: {error.message}</Text>
        </View>
      );
    }
    return null;
  }

  return (
    <TimerProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Light theme status bar since background is light grey */}
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
        </Stack>
        
        {appReady && !splashAnimationComplete && (
          <AnimatedSplashScreen onAnimationComplete={() => setSplashAnimationComplete(true)} />
        )}
      </View>
    </TimerProvider>
  );
}
