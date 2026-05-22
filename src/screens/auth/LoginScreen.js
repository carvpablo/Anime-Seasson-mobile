import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import {
  colors,
  spacing,
  radius,
  typography,
  shadows,
} from "../../constants/theme";

// ─── Error Translation ────────────────────────────────────────────────────────

const translateError = (msg = "") => {
  if (msg.includes("Invalid login credentials"))
    return "Incorrect email or password";
  if (msg.includes("Email not confirmed"))
    return "Please confirm your email before signing in";
  if (msg.includes("Too many requests"))
    return "Too many attempts. Please wait and try again";
  if (msg.includes("Network") || msg.includes("fetch"))
    return "No internet connection";
  return "An unexpected error occurred. Please try again";
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const InputField = ({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "none",
  rightIcon,
  onRightIconPress,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View
        style={[
          fieldStyles.wrapper,
          focused && fieldStyles.wrapperFocused,
          value && !focused && fieldStyles.wrapperFilled,
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={focused ? colors.accent : colors.textMuted}
          style={fieldStyles.icon}
        />
        <TextInput
          style={fieldStyles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={fieldStyles.eyeBtn}
          >
            <Ionicons name={rightIcon} size={17} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const fieldStyles = StyleSheet.create({
  group: { gap: spacing.xs },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginLeft: 2,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    height: 50,
    gap: spacing.sm,
  },
  wrapperFocused: {
    borderColor: colors.accent,
    backgroundColor: "rgba(233,69,96,0.05)",
  },
  wrapperFilled: {
    borderColor: "rgba(255,255,255,0.12)",
  },
  icon: { width: 20, textAlign: "center" },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: spacing.xs,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 7,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -7,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 55,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      shake();
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) {
      setError(translateError(err.message));
      shake();
    }
    // On success, AuthContext updates → AppNavigator redirects automatically
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Decorative background blobs ── */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        {/* ── Logo / Brand ── */}
        <View style={styles.logoSection}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Ionicons name="play" size={30} color="#fff" />
            </View>
          </View>
          <Text style={styles.appName}>AnimeSeason</Text>
          <Text style={styles.tagline}>Your season, your way</Text>
        </View>

        {/* ── Form Card ── */}
        <Animated.View
          style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Welcome back </Text>
            <Text style={styles.cardSubtitle}>Sign in to continue</Text>
          </View>

          {/* Error banner */}
          {!!error && (
            <View style={styles.errorBanner}>
              <Ionicons
                name="alert-circle-outline"
                size={15}
                color={colors.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <InputField
            icon="mail-outline"
            label="E-MAIL"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <InputField
            icon="lock-closed-outline"
            label="PASSWORD"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color="#fff" />
                <Text style={styles.loginBtnText}>Sign in</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register link */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>
              Don't have an account?{" "}
              <Text style={styles.linkAccent}>Create account</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },

  // Background decorative blobs
  blob1: {
    position: "absolute",
    top: -60,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(233,69,96,0.08)",
  },
  blob2: {
    position: "absolute",
    bottom: 100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(76,155,232,0.05)",
  },

  // Logo
  logoSection: {
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: "rgba(233,69,96,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  logoInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    ...typography.h1,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Form card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.card,
  },
  cardHeader: { gap: spacing.xs },
  cardTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Error
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,82,82,0.1)",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,82,82,0.3)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },

  // Login button
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.xs,
    ...shadows.accent,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: {
    ...typography.h4,
    color: "#fff",
    letterSpacing: 0.5,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Register link
  linkRow: { alignItems: "center" },
  linkText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  linkAccent: {
    color: colors.accent,
    fontWeight: "600",
  },
});
