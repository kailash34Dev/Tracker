import { View, Text } from 'react-native';
import { colors } from '../../src/theme/colors';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, color: colors.onBackground }}>Profile coming soon</Text>
    </View>
  );
}
