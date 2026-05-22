import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

/**
 * Full-screen / section loading state with spinner and optional message.
 * @param {string} message - Optional custom message
 * @param {boolean} fullScreen - If true, fills the full screen
 */
const LoadingState = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

/**
 * Small inline spinner for "load more" scenarios.
 */
export const LoadingMore = () => (
  <View style={styles.loadMore}>
    <ActivityIndicator size="small" color={colors.accent} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
  },
  loadMore: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});

export default LoadingState;
