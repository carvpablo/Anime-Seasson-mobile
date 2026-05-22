import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

// ─── Constants ───────────────────────────────────────────────────────────────
const ACTIVE_COLOR = colors.accent;              // #E94560
const INACTIVE_COLOR = 'rgba(255,255,255,0.4)';

/** Height of the pill (excluding safe-area inset). Screens use this for paddingBottom. */
export const TAB_BAR_HEIGHT = 70;

const TABS_CONFIG = [
  {
    routeName: 'Inicio',
    label: 'Home',
    icon: 'home',
    iconOutline: 'home-outline',
  },
  {
    routeName: 'Favorites',
    label: 'Bookmarks',
    icon: 'bookmark',
    iconOutline: 'bookmark-outline',
  },
  {
    routeName: 'Grade',
    label: 'Schedule',
    icon: 'calendar',
    iconOutline: 'calendar-outline',
  },
  {
    routeName: 'Perfil',
    label: 'Profile',
    icon: 'person',
    iconOutline: 'person-outline',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 14);

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPad }]} pointerEvents="box-none">
      {/* ── Glass pill centralizada ───────────────────── */}
      <BlurView
        intensity={72}
        tint="dark"
        style={styles.pill}
      >
        {/* Camada de tint semi-transparente por cima do blur */}
        <View style={styles.pillOverlay}>
          {state.routes.map((route, index) => {
            const tabConfig = TABS_CONFIG.find((t) => t.routeName === route.name);
            if (!tabConfig) return null;

            const isFocused = state.index === index;
            const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
            const iconName = isFocused ? tabConfig.icon : tabConfig.iconOutline;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.65}
                accessibilityRole="button"
                accessibilityLabel={tabConfig.label}
                accessibilityState={{ selected: isFocused }}
              >
                <Ionicons name={iconName} size={24} color={color} />
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: 'transparent',
  },

  // ── Glass pill ────────────────────────────────────
  pill: {
    borderRadius: 50,
    overflow: 'hidden',
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 18,
  },

  // Camada de cor escura sobre o blur (dá o efeito glass dark)
  pillOverlay: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 20,
    gap: 4,
    backgroundColor: 'rgba(12,12,18,0.45)',
    // Borda glass sutil
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 50,
  },

  tab: {
    width: 68,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
