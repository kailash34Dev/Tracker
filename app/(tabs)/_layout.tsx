import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          // Explicitly only show tasks and about tabs
          if (route.name !== 'tasks' && route.name !== 'about') return null;
          
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Determine icon based on route name
          let iconName = 'checkmark-circle-outline';
          let focusedIconName = 'checkmark-circle';
          let label = 'Tasks';

          if (route.name === 'about') {
            iconName = 'information-circle-outline';
            focusedIconName = 'information-circle';
            label = 'About';
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFocused ? focusedIconName : iconName as any}
                size={24}
                color={isFocused ? colors.primary : colors.onSurfaceVariant}
                style={{ marginBottom: 4 }}
              />
              <Text 
                style={[styles.tabText, { color: isFocused ? colors.primary : colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="about" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.screenMargin,
    zIndex: 100,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: spacing.xs,
    elevation: 20, 
    shadowColor: colors.secondary, // Tinted shadow with soft lavender
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    width: '100%',
    maxWidth: 180, // Reduced from 240 to make it even smaller for just 2 tabs
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 72,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: 11,
  }
});
