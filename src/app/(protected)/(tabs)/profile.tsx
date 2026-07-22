import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { requireOptionalNativeModule } from "expo-modules-core";
import { useFocusEffect, useRouter } from "expo-router";

import {
  ProfileHeader,
  ProfileMenu,
  ProtectedCanvas,
  ScreenTitle,
  type ProfileMenuItem,
} from "@/components/layout/PencilProtected";
import { authRoutes } from "@/constants/authRoutes";
import { protectedProfileRoutes } from "@/constants/protectedProfileRoutes";
import { theme } from "@/constants/theme";
import { ConfirmationOverlay, useAuth } from "@/features/auth";
import {
  fetchMe,
  formatProfileSubtitle,
  updateMyAvatar,
  type MeUser,
} from "@/features/profile";
import { ApiError } from "@/lib/api/graphql";

function isImagePickerAvailable(): boolean {
  return requireOptionalNativeModule("ExponentImagePicker") != null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { token, signOut } = useAuth();

  const [user, setUser] = useState<MeUser | null>(null);
  const [booleans, setBooleans] = useState({
    loading: true,
    uploading: false,
    showLogoutConfirm: false,
    signingOut: false,
  });
  const [error, setError] = useState<string | null>(null);

  const { loading, uploading, showLogoutConfirm, signingOut } = booleans;

  const loadProfile = useCallback(async () => {
    if (!token) {
      setBooleans((current) => ({
        ...current,
        loading: false,
        uploading: false,
      }));
      return;
    }

    setBooleans((current) => ({ ...current, loading: true }));
    setError(null);

    try {
      const me = await fetchMe(token);
      setUser(me);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível carregar o perfil.",
      );
    } finally {
      setBooleans((current) => ({ ...current, loading: false }));
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  async function handleChangePhoto() {
    if (!token || uploading) {
      return;
    }

    if (!isImagePickerAvailable()) {
      Alert.alert(
        "Atualize o app",
        "Para escolher uma foto da galeria, é preciso gerar um novo development build com o expo-image-picker.\n\nNa pasta MatchUp rode:\nnpx eas build --platform android --profile development\n\nDepois instale o APK novo no celular.",
      );
      return;
    }

    try {
      const ImagePicker = await import("expo-image-picker");

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permissão necessária",
          "Autorize o acesso às fotos para alterar sua imagem de perfil.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.55,
        base64: true,
      });

      if (result.canceled || !result.assets[0]?.base64) {
        return;
      }

      const asset = result.assets[0];
      const mime = asset.mimeType ?? "image/jpeg";
      const avatarBase64 = `data:${mime};base64,${asset.base64}`;

      setBooleans((current) => ({ ...current, uploading: true }));
      await updateMyAvatar(token, avatarBase64);
      const me = await fetchMe(token);
      setUser(me);
    } catch (err) {
      Alert.alert(
        "Erro",
        err instanceof ApiError
          ? err.message
          : "Não foi possível atualizar a foto. Tente novamente.",
      );
    } finally {
      setBooleans((current) => ({ ...current, uploading: false }));
    }
  }

  const handleSignOut = useCallback(() => {
    setBooleans((current) => ({ ...current, showLogoutConfirm: true }));
  }, []);

  const confirmSignOut = useCallback(async () => {
    if (signingOut) {
      return;
    }

    setBooleans((current) => ({ ...current, signingOut: true }));
    try {
      await signOut();
      router.replace(authRoutes.login);
    } finally {
      setBooleans((current) => ({
        ...current,
        signingOut: false,
        showLogoutConfirm: false,
      }));
    }
  }, [router, signOut, signingOut]);

  const dismissLogoutConfirm = useCallback(() => {
    if (signingOut) {
      return;
    }
    setBooleans((current) => ({ ...current, showLogoutConfirm: false }));
  }, [signingOut]);

  const menuItems = useMemo<ProfileMenuItem[]>(
    () => [
      {
        key: "card",
        label: "Minha Carta",
        icon: "id-card-outline",
        onPress: () => router.push(protectedProfileRoutes.myCard),
      },
      {
        key: "edit",
        label: "Editar Perfil",
        icon: "create-outline",
        onPress: () => router.push(protectedProfileRoutes.editProfile),
      },
      {
        key: "stats",
        label: "Estatísticas",
        icon: "stats-chart-outline",
        onPress: () => router.push(protectedProfileRoutes.statistics),
      },
      {
        key: "champs",
        label: "Meus Campeonatos",
        icon: "trophy-outline",
        onPress: () => router.push(protectedProfileRoutes.myChampionships),
      },
      {
        key: "teams",
        label: "Meus Times",
        icon: "people-outline",
        onPress: () => router.push(protectedProfileRoutes.myTeams),
      },
      { key: "settings", label: "Configurações", icon: "settings-outline" },
      {
        key: "logout",
        label: "Sair",
        icon: "log-out-outline",
        danger: true,
        onPress: handleSignOut,
      },
    ],
    [handleSignOut, router],
  );

  return (
    <ProtectedCanvas active="Perfil" scroll canvasHeight={900}>
      <ScreenTitle>Perfil</ScreenTitle>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && user ? (
        <>
          <ProfileHeader
            name={user.name}
            subtitle={formatProfileSubtitle(user)}
            avatarUrl={user.avatarUrl}
            onChangePhoto={handleChangePhoto}
          />
          {uploading ? (
            <Text style={styles.uploading}>Atualizando foto...</Text>
          ) : null}
          <ProfileMenu items={menuItems} top={292} />
        </>
      ) : null}

      {showLogoutConfirm ? (
        <ConfirmationOverlay
          variant="danger"
          title={`Sair da conta?`}
          message={`Você precisará entrar novamente\npara acessar o MatchUp.`}
          buttonLabel={signingOut ? "Saindo..." : "SAIR"}
          cancelLabel="Cancelar"
          icon={<Ionicons name="log-out-outline" size={28} color="#FFFFFF" />}
          onPress={confirmSignOut}
          onCancel={dismissLogoutConfirm}
        />
      ) : null}
    </ProtectedCanvas>
  );
}

const styles = StyleSheet.create({
  loadingBox: {
    position: "absolute",
    left: 24,
    top: 160,
    width: 342,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    position: "absolute",
    left: 24,
    top: 150,
    width: 342,
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
    textAlign: "center",
  },
  uploading: {
    position: "absolute",
    left: 24,
    top: 268,
    width: 342,
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
    textAlign: "center",
  },
});
