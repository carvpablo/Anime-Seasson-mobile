import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, radius, typography, shadows } from '../../constants/theme';

// ─── Error Translation ────────────────────────────────────────────────────────

const translateError = (msg = '') => {
  if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado';
  if (msg.includes('Password should be at least'))
    return 'A senha deve ter pelo menos 6 caracteres';
  if (msg.includes('Unable to validate email') || msg.includes('invalid email'))
    return 'E-mail inválido';
  if (msg.includes('Network') || msg.includes('fetch'))
    return 'Sem conexão com a internet';
  return 'Ocorreu um erro inesperado. Tente novamente';
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
  autoCapitalize = 'none',
  rightIcon,
  onRightIconPress,
  error,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View
        style={[
          fieldStyles.wrapper,
          focused && fieldStyles.wrapperFocused,
          error && fieldStyles.wrapperError,
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={
            error ? colors.error : focused ? colors.accent : colors.textMuted
          }
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
          <TouchableOpacity onPress={onRightIconPress} style={fieldStyles.eyeBtn}>
            <Ionicons name={rightIcon} size={17} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={fieldStyles.errorHint}>{error}</Text> : null}
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
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: 'rgba(233,69,96,0.05)',
  },
  wrapperError: {
    borderColor: colors.error,
    backgroundColor: 'rgba(255,82,82,0.05)',
  },
  icon: { width: 20, textAlign: 'center' },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  eyeBtn: { padding: spacing.xs },
  errorHint: {
    ...typography.caption,
    color: colors.error,
    marginLeft: 4,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = 'Campo obrigatório';
    else if (username.trim().length < 3) errs.username = 'Mínimo 3 caracteres';
    if (!email.trim()) errs.email = 'Campo obrigatório';
    if (!password) errs.password = 'Campo obrigatório';
    else if (password.length < 6) errs.password = 'Mínimo 6 caracteres';
    if (!confirmPassword) errs.confirmPassword = 'Campo obrigatório';
    else if (password !== confirmPassword) errs.confirmPassword = 'As senhas não coincidem';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) {
      shake();
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await signUp(email.trim(), password, username.trim());
    setLoading(false);
    if (err) {
      setError(translateError(err.message));
      shake();
    } else {
      setSuccess(true);
    }
  };

  // Success state — show confirmation message
  if (success) {
    return (
      <View style={[styles.successContainer, { paddingTop: insets.top + 40 }]}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Conta criada! 🎉</Text>
        <Text style={styles.successText}>
          Verifique seu e-mail e clique no link de confirmação para ativar sua conta.
        </Text>
        <TouchableOpacity
          style={styles.backToLoginBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Ionicons name="log-in-outline" size={18} color="#fff" />
          <Text style={styles.backToLoginText}>Ir para o Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.logoMini}>
            <Ionicons name="play" size={18} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Criar conta</Text>
        </View>

        {/* Form card */}
        <Animated.View
          style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Junte-se à comunidade ✨</Text>
            <Text style={styles.cardSubtitle}>
              Crie sua conta e acompanhe seus animes
            </Text>
          </View>

          {/* Global error */}
          {!!error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={15} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <InputField
            icon="person-outline"
            label="USERNAME"
            placeholder="seu_apelido"
            value={username}
            onChangeText={(v) => {
              setUsername(v);
              setFieldErrors((p) => ({ ...p, username: '' }));
            }}
            autoCapitalize="none"
            error={fieldErrors.username}
          />

          <InputField
            icon="mail-outline"
            label="E-MAIL"
            placeholder="seu@email.com"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setFieldErrors((p) => ({ ...p, email: '' }));
            }}
            keyboardType="email-address"
            error={fieldErrors.email}
          />

          <InputField
            icon="lock-closed-outline"
            label="SENHA"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setFieldErrors((p) => ({ ...p, password: '' }));
            }}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
            error={fieldErrors.password}
          />

          <InputField
            icon="shield-checkmark-outline"
            label="CONFIRMAR SENHA"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
            }}
            secureTextEntry={!showConfirm}
            rightIcon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowConfirm(!showConfirm)}
            error={fieldErrors.confirmPassword}
          />

          {/* Register button */}
          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={18} color="#fff" />
                <Text style={styles.registerBtnText}>Criar conta</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login link */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>
              Já tem uma conta?{' '}
              <Text style={styles.linkAccent}>Fazer login</Text>
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
    position: 'absolute',
    top: 80,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(233,69,96,0.07)',
  },
  blob2: {
    position: 'absolute',
    bottom: 60,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(76,155,232,0.05)',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,82,82,0.3)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },

  // Register button
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.xs,
    ...shadows.accent,
  },
  registerBtnDisabled: { opacity: 0.7 },
  registerBtnText: {
    ...typography.h4,
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.divider },
  dividerText: { ...typography.caption, color: colors.textMuted },

  // Link
  linkRow: { alignItems: 'center' },
  linkText: { ...typography.body, color: colors.textSecondary },
  linkAccent: { color: colors.accent, fontWeight: '600' },

  // Success state
  successContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  successIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  successTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  successText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  backToLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xxl,
    ...shadows.accent,
    marginTop: spacing.md,
  },
  backToLoginText: {
    ...typography.h4,
    color: '#fff',
  },
});
