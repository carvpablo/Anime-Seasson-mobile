import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, typography, shadows } from '../constants/theme';

// ─── Avatar from initials ─────────────────────────────────────────────────────

const Avatar = ({ username, size = 80 }) => {
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : '?';
  return (
    <View
      style={[
        avatarStyles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[avatarStyles.text, { fontSize: size * 0.35 }]}>
        {initials}
      </Text>
    </View>
  );
};

const avatarStyles = StyleSheet.create({
  circle: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 2,
  },
});

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value }) => (
  <View style={infoStyles.row}>
    <View style={infoStyles.iconWrap}>
      <Ionicons name={icon} size={16} color={colors.accent} />
    </View>
    <View style={infoStyles.textWrap}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value || '—'}</Text>
    </View>
  </View>
);

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1, gap: 2 },
  label: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { user, signOut, getProfile } = useAuth();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    const { data } = await getProfile();
    setProfile(data);
    setProfileLoading(false);
  }, [getProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            await signOut();
            // AuthContext updates → AppNavigator redirects automatically
          },
        },
      ]
    );
  };

  const username = profile?.username || user?.user_metadata?.username || 'User';
  const email = user?.email || '';
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Background blob */}
      <View style={styles.blob} />

      {/* Page title */}
      <Text style={styles.pageTitle}>Profile</Text>

      {/* Avatar + Name card */}
      <View style={styles.heroCard}>
        {profileLoading ? (
          <ActivityIndicator color={colors.accent} size="large" />
        ) : (
          <>
            <Avatar username={username} size={84} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{username}</Text>
              <Text style={styles.heroEmail}>{email}</Text>
              <View style={styles.heroBadge}>
                <View style={styles.heroDot} />
                <Text style={styles.heroBadgeText}>Active account</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Info card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>ACCOUNT INFORMATION</Text>

        <InfoRow icon="person-outline" label="USERNAME" value={username} />
        <View style={styles.separator} />
        <InfoRow icon="mail-outline" label="E-MAIL" value={email} />
        {createdAt && (
          <>
            <View style={styles.separator} />
            <InfoRow icon="calendar-outline" label="MEMBER SINCE" value={createdAt} />
          </>
        )}
      </View>

      {/* Stats card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="tv-outline" size={24} color={colors.accent} />
          <Text style={styles.statNumber}>—</Text>
          <Text style={styles.statLabel}>Animes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="star-outline" size={24} color={colors.warning} />
          <Text style={styles.statNumber}>—</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={24} color={colors.info} />
          <Text style={styles.statNumber}>—</Text>
          <Text style={styles.statLabel}>Seasons</Text>
        </View>
      </View>

      {/* Danger zone */}
      <View style={styles.dangerCard}>
        <Text style={styles.cardLabel}>SESSION</Text>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleSignOut}
          disabled={signingOut}
          activeOpacity={0.8}
        >
          {signingOut ? (
            <ActivityIndicator color={colors.error} size="small" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color={colors.error} />
              <Text style={styles.logoutText}>Sign out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },

  blob: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(233,69,96,0.07)',
  },

  pageTitle: {
    ...typography.h1,
    color: colors.textPrimary,
  },

  // Hero card
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: 120,
    ...shadows.card,
  },
  heroInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  heroName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  heroEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  heroBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },

  // Info card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.card,
  },
  cardLabel: {
    ...typography.label,
    color: colors.textMuted,
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
  },

  // Stats card
  statsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.divider,
  },

  // Danger zone
  dangerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,82,82,0.08)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,82,82,0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  logoutText: {
    ...typography.h4,
    color: colors.error,
  },
});
