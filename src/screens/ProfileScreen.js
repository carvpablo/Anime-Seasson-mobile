import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, typography, shadows } from '../constants/theme';

// ─── Local avatars ────────────────────────────────────────────────────────────

const AVATAR_OPTIONS = [
  { id: 'avatar-01', source: require('../../assets/avatars/avatar-01.png') },
  { id: 'avatar-02', source: require('../../assets/avatars/avatar-02.jpg') },
  { id: 'avatar-03', source: require('../../assets/avatars/avatar-03.png') },
  { id: 'avatar-04', source: require('../../assets/avatars/avatar-04.jpg') },
  { id: 'avatar-05', source: require('../../assets/avatars/avatar-05.png') },
  { id: 'avatar-06', source: require('../../assets/avatars/avatar-06.png') },
];

const getAvatarSource = (avatarId) =>
  AVATAR_OPTIONS.find((avatar) => avatar.id === avatarId)?.source;

// ─── Avatar ───────────────────────────────────────────────────────────────────

const Avatar = ({ username, avatarId, size = 80 }) => {
  const avatarSource = getAvatarSource(avatarId);
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : '?';

  if (avatarSource) {
    return (
      <View
        style={[
          avatarStyles.imageWrap,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Image
          source={avatarSource}
          resizeMode="cover"
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      </View>
    );
  }

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
  imageWrap: {
    backgroundColor: colors.card,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
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
  const { user, signOut, getProfile, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [savingAvatarId, setSavingAvatarId] = useState(null);
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

  const handleAvatarSelect = async (avatarId) => {
    if (avatarId === profile?.avatar_id || savingAvatarId) return;

    setSavingAvatarId(avatarId);
    const previousProfile = profile;
    setProfile((current) => ({ ...current, avatar_id: avatarId }));

    const { error } = await updateProfile({ avatar_id: avatarId });

    if (error) {
      setProfile(previousProfile);
      Alert.alert(
        'Avatar not saved',
        'Make sure the profiles table has an avatar_id column and try again.',
      );
    }

    setSavingAvatarId(null);
  };

  const handleAvatarPress = () => {
    setAvatarPickerVisible((visible) => !visible);
  };

  const username = profile?.username || user?.user_metadata?.username || 'User';
  const selectedAvatarId = profile?.avatar_id;
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
            <TouchableOpacity
              style={[
                styles.avatarTrigger,
                avatarPickerVisible && styles.avatarTriggerActive,
                avatarHovered && styles.avatarTriggerHovered,
              ]}
              onPress={handleAvatarPress}
              onMouseEnter={() => setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Choose profile picture"
              accessibilityState={{ expanded: avatarPickerVisible }}
            >
              <Avatar username={username} avatarId={selectedAvatarId} size={84} />
              <View
                style={[
                  styles.avatarEditOverlay,
                  (avatarHovered || avatarPickerVisible) && styles.avatarEditOverlayVisible,
                ]}
              >
                <Ionicons name="camera-outline" size={22} color="#fff" />
              </View>
            </TouchableOpacity>
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

      {avatarPickerVisible && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PROFILE PICTURE</Text>
          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((avatar) => {
              const selected = avatar.id === selectedAvatarId;
              const saving = avatar.id === savingAvatarId;

              return (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    selected && styles.avatarOptionSelected,
                  ]}
                  onPress={() => handleAvatarSelect(avatar.id)}
                  disabled={profileLoading || !!savingAvatarId}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${avatar.id}`}
                  accessibilityState={{
                    selected,
                    disabled: profileLoading || !!savingAvatarId,
                  }}
                >
                  <Image
                    source={avatar.source}
                    resizeMode="cover"
                    style={styles.avatarOptionImage}
                  />
                  {selected && (
                    <View style={styles.avatarCheck}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                  {saving && (
                    <View style={styles.avatarSavingOverlay}>
                      <ActivityIndicator color={colors.accent} size="small" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

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
  avatarTrigger: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTriggerHovered: {
    backgroundColor: 'rgba(233,69,96,0.16)',
    transform: [{ scale: 1.04 }],
  },
  avatarTriggerActive: {
    backgroundColor: 'rgba(233,69,96,0.12)',
  },
  avatarEditOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    bottom: 4,
    left: 4,
    borderRadius: 42,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  avatarEditOverlayVisible: {
    opacity: 1,
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

  // Avatar picker
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  avatarOption: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  avatarOptionSelected: {
    borderColor: colors.accent,
    ...shadows.accent,
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
  },
  avatarCheck: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSavingOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
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
