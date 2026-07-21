// React-native imports
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Expo imports
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
// Theme imports
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
// Store imports
import { useToastStore } from '../../src/store/useToastStore';
// Component imports
import Header from '../../src/components/Header';

export default function AboutScreen() {
  const showToast = useToastStore((state) => state.showToast);

  const handleLinkPress = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown error';
      showToast(`Couldn't open URL: ${errorMessage}`, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Header title="About" iconName="information-circle-outline" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info Section */}
        <View style={styles.brandingSection}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.appIcon}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.appName}>Tracker</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            A beautiful, intuitive time tracking app to help you stay focused, manage your tasks,
            and boost your daily productivity.
          </Text>
        </View>

        {/* Features Section */}
        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.card}>
          <View style={styles.featureItem}>
            <View style={[styles.iconBox, { backgroundColor: colors.categoryOrange }]}>
              <Ionicons name="heart" size={20} color={colors.onCategoryOrange} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Simple & Friendly UI</Text>
              <Text style={styles.featureDesc}>
                Enjoy a clean, distraction-free interface that makes tracking time a breeze.
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureItem}>
            <View style={[styles.iconBox, { backgroundColor: colors.categoryBlue }]}>
              <Ionicons name="stopwatch" size={20} color={colors.onCategoryBlue} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Live Time Tracking</Text>
              <Text style={styles.featureDesc}>
                Start a stopwatch or set a strict timer for any task.
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.featureItem}>
            <View style={[styles.iconBox, { backgroundColor: colors.categoryPurple }]}>
              <Ionicons name="pie-chart" size={20} color={colors.onCategoryPurple} />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Categorized Tasks</Text>
              <Text style={styles.featureDesc}>
                Organize your day with beautiful custom categories and colors.
              </Text>
            </View>
          </View>
        </View>

        {/* Code Section */}
        <Text style={styles.sectionTitle}>Code</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://github.com/kailash34Dev/Tracker')}
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.categoryTeal }]}>
                <Ionicons name="logo-github" size={20} color={colors.onCategoryTeal} />
              </View>
              <Text style={styles.linkText}>View Source Code</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Support & Feedback</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() =>
              handleLinkPress('mailto:kailashphukan34@gmail.com?subject=Time Tracker Support')
            }
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.categoryBlue }]}>
                <Ionicons name="mail" size={20} color={colors.onCategoryBlue} />
              </View>
              <Text style={styles.linkText}>Contact Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() =>
              handleLinkPress('mailto:kailashphukan34@gmail.com?subject=Time Tracker Feedback')
            }
            activeOpacity={0.7}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.categoryPink }]}>
                <Ionicons name="chatbubbles" size={20} color={colors.onCategoryPink} />
              </View>
              <Text style={styles.linkText}>Send Feedback</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>Made with ❤️ by Ozion</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xxl,
    color: colors.onBackground,
  },
  content: {
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: spacing.xl * 4,
  },
  brandingSection: {
    alignItems: 'center',
    marginVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  appName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.xl,
    color: colors.onBackground,
    marginBottom: 4,
  },
  appVersion: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  appDescription: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.lg,
    color: colors.onBackground,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  featureTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.sizes.md,
    color: colors.onSurface,
    marginBottom: 2,
  },
  featureDesc: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.sm,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
    opacity: 0.5,
    marginVertical: spacing.md,
    marginLeft: 40 + spacing.md,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.md,
    color: colors.onSurface,
  },
  footerText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.xs,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xl,
    opacity: 0.6,
  },
});
