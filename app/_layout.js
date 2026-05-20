import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'AnimeSeason',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="schedule"
          options={{
            title: 'Weekly Schedule',
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            title: 'Anime Discovery',
          }}
        />
        <Stack.Screen
          name="details/[id]"
          options={{
            title: '',
            headerTransparent: true,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
