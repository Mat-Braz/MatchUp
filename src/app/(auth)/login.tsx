import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { authRoutes } from "@/constants/authRoutes";
import { theme } from "@/constants/theme";
import {
  PencilButton,
  PencilField,
  PencilFullLogo,
  useAuth,
} from "@/features/auth";
import { ApiError } from "@/lib/api/graphql";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const [objects, setObjects] = useState({
    formValues: {
      email: "",
      password: "",
    },
    error: null as string | null,
  });

  const [booleans, setBooleans] = useState({
    passVisible: false,
    keyboardVisible: false,
    submitting: false,
  });

  const { formValues, error } = objects;
  const { passVisible, keyboardVisible, submitting } = booleans;

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setBooleans((current) => ({ ...current, keyboardVisible: true }));
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      setBooleans((current) => ({ ...current, keyboardVisible: false }));
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const topPad = Math.max(insets.top, 16) + 20;
  const bottomPad = Math.max(insets.bottom, 16) + 12;
  const canSubmit =
    formValues.email.trim().length > 0 &&
    formValues.password.length > 0 &&
    !submitting;

  async function handleLogin() {
    if (!canSubmit) {
      return;
    }

    const normalizedEmail = formValues.email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setObjects((current) => ({
        ...current,
        error: "Digite um e-mail válido, tipo nome@email.com",
      }));
      return;
    }

    setObjects((current) => ({ ...current, error: null }));
    setBooleans((current) => ({ ...current, submitting: true }));

    try {
      await signIn({
        email: normalizedEmail,
        password: formValues.password,
      });
      router.replace("/(protected)");
    } catch (err) {
      const raw = err instanceof ApiError ? err.message : "";
      const message =
        raw === "Invalid credentials" ||
        raw.toLowerCase().includes("invalid credentials")
          ? "E-mail ou senha inválidos."
          : raw.toLowerCase().includes("email must be an email")
            ? "Digite um e-mail válido, tipo nome@email.com"
            : raw || "Não foi possível entrar. Tente novamente.";

      setObjects((current) => ({ ...current, error: message }));
    } finally {
      setBooleans((current) => ({ ...current, submitting: false }));
    }
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          scrollEnabled={keyboardVisible}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={keyboardVisible}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: topPad,
              paddingBottom: bottomPad,
            },
          ]}
        >
          <View style={styles.header}>
            <PencilFullLogo style={styles.logo} />
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Entrar</Text>
              <Text style={styles.subtitle}>
                Acesse seus campeonatos e partidas
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.fields}>
              <PencilField
                active
                label="E-MAIL"
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                value={formValues.email}
                onChangeText={(email) =>
                  setObjects((current) => ({
                    ...current,
                    formValues: { ...current.formValues, email },
                  }))
                }
                editable={!submitting}
              />
              <PencilField
                active
                label="SENHA"
                placeholder="Digite sua senha"
                secure={!passVisible}
                textContentType="password"
                value={formValues.password}
                onChangeText={(password) =>
                  setObjects((current) => ({
                    ...current,
                    formValues: { ...current.formValues, password },
                  }))
                }
                editable={!submitting}
                icon={
                  <Ionicons
                    name={passVisible ? "eye-off-outline" : "eye-outline"}
                    size={20}
                  />
                }
                onIconPress={() =>
                  setBooleans((current) => ({
                    ...current,
                    passVisible: !current.passVisible,
                  }))
                }
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              hitSlop={8}
              onPress={() => router.push(authRoutes.forgotPassword)}
              style={({ pressed }) => [
                styles.forgotButton,
                pressed && styles.linkPressed,
              ]}
            >
              <Text style={styles.forgot}>Esqueceu a senha?</Text>
            </Pressable>

            <PencilButton
              height={54}
              label={submitting ? "Entrando..." : "Entrar"}
              disabled={!canSubmit}
              onPress={handleLogin}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem conta?</Text>
            <Pressable
              hitSlop={8}
              onPress={() => router.push(authRoutes.createAccount)}
              style={({ pressed }) => pressed && styles.linkPressed}
            >
              <Text style={styles.footerTextStrong}>Criar conta</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    gap: 32,
  },
  logo: {
    width: 200,
    height: 56,
  },
  titleBlock: {
    gap: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: theme.fontWeights.extraBold,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#A6A5B0",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
    maxWidth: 300,
  },
  form: {
    marginTop: 40,
    gap: 18,
    width: "100%",
  },
  fields: {
    gap: 16,
  },
  error: {
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    marginTop: -4,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 4,
  },
  forgot: {
    color: theme.colors.primarySoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.bold,
  },
  loginButton: {
    marginTop: 25,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: "#80808A",
    fontSize: 14,
    fontWeight: theme.fontWeights.semibold,
  },
  footerTextStrong: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: theme.fontWeights.extraBold,
  },
  linkPressed: {
    opacity: 0.7,
  },
});
