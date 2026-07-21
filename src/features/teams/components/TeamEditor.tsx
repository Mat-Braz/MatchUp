import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { requireOptionalNativeModule } from 'expo-modules-core';

import { theme } from '@/constants/theme';
import { useAuth } from '@/features/auth';
import {
  ChoiceChip,
  FieldLabel,
  PrimaryButton,
} from '@/features/championships/components/WizardShell';
import { ApiError } from '@/lib/api/graphql';

import {
  createTeam,
  fetchPendingTeamInvitePlayerIds,
  fetchTeam,
  fetchTeamMembers,
  invitePlayerToTeam,
  parseLineupAssignments,
  saveTeamLineup,
  searchUsers,
  updateTeam,
  type TeamMember,
  type UserSearchItem,
} from '../api/teams';
import { TeamCreateProvider, useTeamCreate } from '../context/TeamCreateContext';
import {
  formationsForSquadSize,
  getFormation,
  type SquadSize,
} from '../formations';

type EditorTab = 'dados' | 'convites' | 'formacao';

const TABS: { id: EditorTab; label: string }[] = [
  { id: 'dados', label: 'Dados' },
  { id: 'convites', label: 'Convites' },
  { id: 'formacao', label: 'Formação' },
];

function isImagePickerAvailable(): boolean {
  return requireOptionalNativeModule('ExponentImagePicker') != null;
}

type TeamEditorProps = {
  teamId?: number | null;
  /** Only the team creator can edit; members get a read-only view. Default: true on create. */
  canEdit?: boolean;
  variant?: 'screen' | 'embedded';
  onDone?: () => void;
  onTeamChanged?: () => void;
};

export function TeamEditor(props: TeamEditorProps) {
  return (
    <TeamCreateProvider>
      <TeamEditorInner {...props} />
    </TeamCreateProvider>
  );
}

function TeamEditorInner({
  teamId: initialTeamId = null,
  canEdit: canEditProp,
  variant = 'screen',
  onDone,
  onTeamChanged,
}: TeamEditorProps) {
  const { token } = useAuth();
  const { updateDraft } = useTeamCreate();
  const [tab, setTab] = useState<EditorTab>('dados');
  const [loadingTeam, setLoadingTeam] = useState(Boolean(initialTeamId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(canEditProp ?? !initialTeamId);

  const loadTeam = useCallback(async () => {
    if (!token || !initialTeamId) {
      setLoadingTeam(false);
      setCanEdit(canEditProp ?? true);
      return;
    }

    setLoadingTeam(true);
    setLoadError(null);
    try {
      const team = await fetchTeam(token, initialTeamId);
      const squadSize = (team.squadSize === 11 ? 11 : 5) as SquadSize;
      const formations = formationsForSquadSize(squadSize);
      const formationId =
        team.formation && formations.some((f) => f.id === team.formation)
          ? team.formation
          : formations[0].id;

      updateDraft({
        teamId: team.id,
        name: team.name,
        sigla: team.sigla ?? '',
        shieldUrl: team.shieldUrl,
        squadSize,
        formationId,
        assignments: parseLineupAssignments(team.lineup),
        invitedPlayerIds: [],
      });

      if (canEditProp !== undefined) {
        setCanEdit(canEditProp);
      } else {
        const { fetchMe } = await import('@/features/profile');
        const me = await fetchMe(token);
        setCanEdit(team.createdByUserId === me.id);
      }
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : 'Não foi possível carregar o time.',
      );
    } finally {
      setLoadingTeam(false);
    }
  }, [canEditProp, initialTeamId, token, updateDraft]);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  useEffect(() => {
    if (canEditProp !== undefined) {
      setCanEdit(canEditProp);
    }
  }, [canEditProp]);

  if (loadingTeam) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (loadError) {
    return <Text style={styles.error}>{loadError}</Text>;
  }

  return (
    <View style={[styles.root, variant === 'embedded' && styles.rootEmbedded]}>
      {!canEdit ? (
        <Text style={styles.readonlyBanner}>
          Somente o criador do time pode editar. Você está no modo visualização.
        </Text>
      ) : null}

      <View style={styles.tabs}>
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setTab(item.id)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === 'dados' ? (
        <DadosPanel
          canEdit={canEdit}
          onTeamChanged={onTeamChanged}
          onDone={onDone}
          variant={variant}
        />
      ) : null}
      {tab === 'convites' ? (
        <ConvitesPanel canEdit={canEdit} onTeamChanged={onTeamChanged} />
      ) : null}
      {tab === 'formacao' ? (
        <FormacaoPanel canEdit={canEdit} onTeamChanged={onTeamChanged} />
      ) : null}
    </View>
  );
}

function DadosPanel({
  canEdit,
  onTeamChanged,
  onDone,
  variant,
}: {
  canEdit: boolean;
  onTeamChanged?: () => void;
  onDone?: () => void;
  variant: 'screen' | 'embedded';
}) {
  const { token } = useAuth();
  const { draft, updateDraft } = useTeamCreate();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function pickShield() {
    if (!canEdit) {
      return;
    }
    if (!isImagePickerAvailable()) {
      Alert.alert(
        'Atualize o app',
        'É preciso um development build com expo-image-picker para escolher a imagem.',
      );
      return;
    }

    try {
      const ImagePicker = await import('expo-image-picker');
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão necessária', 'Autorize o acesso às fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.55,
        base64: true,
      });

      if (result.canceled || !result.assets[0]?.base64) {
        return;
      }

      const asset = result.assets[0];
      const mime = asset.mimeType ?? 'image/jpeg';
      updateDraft({
        shieldUrl: `data:${mime};base64,${asset.base64}`,
      });
      setMessage(null);
    } catch {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  }

  async function handleSave() {
    if (!canEdit || !token || saving) {
      return;
    }
    if (draft.name.trim().length < 2) {
      setError('Informe o nome do time (mín. 2 caracteres).');
      return;
    }

    const sigla = draft.sigla.trim().toUpperCase();
    if (sigla && (sigla.length < 2 || sigla.length > 5)) {
      setError('A sigla deve ter de 2 a 5 caracteres.');
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (draft.teamId) {
        await updateTeam(token, draft.teamId, {
          name: draft.name.trim(),
          sigla: sigla || undefined,
          shieldUrl: draft.shieldUrl ?? undefined,
        });
        setMessage('Dados atualizados.');
      } else {
        const created = await createTeam(token, {
          name: draft.name.trim(),
          sigla: sigla || undefined,
          shieldUrl: draft.shieldUrl ?? undefined,
        });
        updateDraft({ teamId: created.id });
        setMessage('Time criado. Você pode convidar e montar a formação quando quiser.');
      }
      onTeamChanged?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao salvar o time.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.hint}>
        {canEdit
          ? 'Nome é o único campo obrigatório. Foto, sigla, convites e formação são opcionais.'
          : 'Dados do time em modo visualização.'}
      </Text>

      <Pressable
        onPress={pickShield}
        disabled={!canEdit}
        style={[styles.shieldPicker, !canEdit && styles.disabledBlock]}
      >
        {draft.shieldUrl ? (
          <Image source={{ uri: draft.shieldUrl }} style={styles.shieldImage} />
        ) : (
          <View style={styles.shieldPlaceholder}>
            <Ionicons name="camera-outline" size={28} color={theme.colors.primary} />
            <Text style={styles.shieldHint}>
              {canEdit ? 'Escudo / imagem' : 'Sem escudo'}
            </Text>
          </View>
        )}
      </Pressable>

      <FieldLabel>Nome do time</FieldLabel>
      <TextInput
        style={[styles.input, !canEdit && styles.inputReadonly]}
        placeholder="Ex: Unidos FC"
        placeholderTextColor={theme.colors.textDim}
        value={draft.name}
        editable={canEdit}
        onChangeText={(name) => {
          updateDraft({ name });
          setError(null);
        }}
      />

      <FieldLabel>Sigla (opcional)</FieldLabel>
      <TextInput
        style={[styles.input, !canEdit && styles.inputReadonly]}
        placeholder="UFC"
        placeholderTextColor={theme.colors.textDim}
        autoCapitalize="characters"
        maxLength={5}
        value={draft.sigla}
        editable={canEdit}
        onChangeText={(sigla) => {
          updateDraft({ sigla: sigla.toUpperCase().replace(/[^A-Z0-9]/g, '') });
          setError(null);
        }}
      />

      {message ? <Text style={styles.ok}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {canEdit ? (
        <PrimaryButton
          label={
            saving
              ? 'Salvando...'
              : draft.teamId
                ? 'Salvar dados'
                : 'Criar time'
          }
          disabled={saving}
          onPress={handleSave}
        />
      ) : null}

      {variant === 'screen' && draft.teamId && onDone ? (
        <Pressable onPress={onDone} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Concluir</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ConvitesPanel({
  canEdit,
  onTeamChanged,
}: {
  canEdit: boolean;
  onTeamChanged?: () => void;
}) {
  const { token } = useAuth();
  const { draft, updateDraft } = useTeamCreate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [invitingId, setInvitingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ensuring, setEnsuring] = useState(false);
  const [pendingPlayerIds, setPendingPlayerIds] = useState<number[]>([]);

  useEffect(() => {
    if (!token || !draft.teamId || !canEdit) {
      setPendingPlayerIds([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const ids = await fetchPendingTeamInvitePlayerIds(token, draft.teamId!);
        if (!cancelled) {
          setPendingPlayerIds(ids);
          updateDraft({
            invitedPlayerIds: [...new Set([...draft.invitedPlayerIds, ...ids])],
          });
        }
      } catch {
        // Ignore pending invite load failures in the invites panel.
      }
    })();

    return () => {
      cancelled = true;
    };
    // Only reload when team changes / panel mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, draft.teamId, token]);

  const runSearch = useCallback(async () => {
    if (!canEdit || !token || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const users = await searchUsers(token, query);
      setResults(users.filter((u) => u.id !== undefined));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha na busca.');
    } finally {
      setSearching(false);
    }
  }, [canEdit, query, token]);

  async function ensureTeamExists(): Promise<number | null> {
    if (draft.teamId) {
      return draft.teamId;
    }
    if (!canEdit || !token) {
      return null;
    }
    if (draft.name.trim().length < 2) {
      setError('Salve os dados com o nome do time antes de convidar.');
      return null;
    }

    setEnsuring(true);
    try {
      const created = await createTeam(token, {
        name: draft.name.trim(),
        sigla: draft.sigla.trim() || undefined,
        shieldUrl: draft.shieldUrl ?? undefined,
      });
      updateDraft({ teamId: created.id });
      onTeamChanged?.();
      return created.id;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao criar o time.');
      return null;
    } finally {
      setEnsuring(false);
    }
  }

  async function handleInvite(player: UserSearchItem) {
    if (
      !canEdit ||
      !token ||
      invitingId ||
      pendingPlayerIds.includes(player.id) ||
      draft.invitedPlayerIds.includes(player.id)
    ) {
      return;
    }
    setInvitingId(player.id);
    setError(null);
    setMessage(null);
    try {
      const teamId = await ensureTeamExists();
      if (!teamId) {
        return;
      }
      await invitePlayerToTeam(token, teamId, player.id);
      setPendingPlayerIds((current) =>
        current.includes(player.id) ? current : [...current, player.id],
      );
      updateDraft({
        invitedPlayerIds: [...new Set([...draft.invitedPlayerIds, player.id])],
      });
      setMessage(`Convite enviado para ${player.name}.`);
      onTeamChanged?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível convidar.');
    } finally {
      setInvitingId(null);
    }
  }

  if (!canEdit) {
    return (
      <View style={styles.panel}>
        <Text style={styles.hint}>
          Apenas o criador do time pode enviar convites. Você pode ver o elenco na aba
          Formação.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.hint}>
        Busque por nome ou e-mail. O jogador recebe o convite e pode aceitar depois.
      </Text>

      {!draft.teamId ? (
        <Text style={styles.warn}>
          Ainda sem time salvo — ao convidar, criamos com o nome da aba Dados (se preenchido).
        </Text>
      ) : null}

      <FieldLabel>Buscar jogador</FieldLabel>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Nome ou e-mail"
          placeholderTextColor={theme.colors.textDim}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={runSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.searchBtn} onPress={runSearch} disabled={searching}>
          {searching ? (
            <ActivityIndicator color={theme.colors.black} />
          ) : (
            <Ionicons name="search" size={20} color={theme.colors.black} />
          )}
        </Pressable>
      </View>

      {message ? <Text style={styles.ok}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {ensuring ? <ActivityIndicator color={theme.colors.primary} /> : null}

      {results.map((user) => {
        const invited =
          pendingPlayerIds.includes(user.id) ||
          draft.invitedPlayerIds.includes(user.id);
        return (
          <View key={user.id} style={styles.userRow}>
            <View style={styles.avatar}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user.name.slice(0, 1).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <Pressable
              disabled={invited || invitingId === user.id}
              onPress={() => handleInvite(user)}
              style={[styles.inviteBtn, invited && styles.inviteBtnDone]}
            >
              <Text style={[styles.inviteText, invited && styles.inviteTextDone]}>
                {invited
                  ? 'Convite enviado'
                  : invitingId === user.id
                    ? '...'
                    : 'Convidar'}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

function FormacaoPanel({
  canEdit,
  onTeamChanged,
}: {
  canEdit: boolean;
  onTeamChanged?: () => void;
}) {
  const { token } = useAuth();
  const { draft, updateDraft, setAssignment } = useTeamCreate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pickingSlot, setPickingSlot] = useState<string | null>(null);

  const formations = useMemo(
    () => formationsForSquadSize(draft.squadSize),
    [draft.squadSize],
  );

  const formation = useMemo(
    () => getFormation(draft.squadSize, draft.formationId),
    [draft.squadSize, draft.formationId],
  );

  const loadMembers = useCallback(async () => {
    if (!token || !draft.teamId) {
      setMembers([]);
      return;
    }
    setLoading(true);
    try {
      setMembers(await fetchTeamMembers(token, draft.teamId));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao carregar elenco.');
    } finally {
      setLoading(false);
    }
  }, [draft.teamId, token]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  function handleSquadSize(size: SquadSize) {
    if (!canEdit) {
      return;
    }
    const nextForms = formationsForSquadSize(size);
    updateDraft({
      squadSize: size,
      formationId: nextForms[0].id,
      assignments: {},
    });
  }

  function handleFormation(formationId: string) {
    if (!canEdit) {
      return;
    }
    updateDraft({ formationId, assignments: {} });
  }

  const assignedPlayerIds = useMemo(
    () => new Set(Object.values(draft.assignments)),
    [draft.assignments],
  );

  const availableMembers = useMemo(
    () => members.filter((m) => !assignedPlayerIds.has(m.playerId)),
    [members, assignedPlayerIds],
  );

  function memberName(playerId: number | undefined) {
    if (!playerId) {
      return null;
    }
    return members.find((m) => m.playerId === playerId)?.playerName ?? `#${playerId}`;
  }

  async function handleSave() {
    if (!canEdit || !token || saving) {
      return;
    }
    if (!draft.teamId) {
      setError('Salve os dados do time na aba Dados antes de gravar a formação.');
      return;
    }

    const slots = formation.slots
      .map((slot) => {
        const playerId = draft.assignments[slot.id];
        if (!playerId) {
          return null;
        }
        return { slotId: slot.id, playerId };
      })
      .filter(Boolean) as { slotId: string; playerId: number }[];

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await saveTeamLineup(token, {
        teamId: draft.teamId,
        squadSize: draft.squadSize,
        formation: draft.formationId,
        slots,
      });
      setMessage(
        slots.length
          ? 'Formação salva.'
          : 'Formação salva (sem jogadores posicionados).',
      );
      onTeamChanged?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao salvar formação.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.hint}>
        {canEdit
          ? 'Monte a escalação quando quiser. Pode salvar só o esquema sem posicionar ninguém.'
          : 'Formação do time em modo visualização.'}
      </Text>

      {!draft.teamId ? (
        <Text style={styles.warn}>
          Crie/salve o time na aba Dados para liberar a formação.
        </Text>
      ) : null}

      <FieldLabel>Modo</FieldLabel>
      <View style={styles.row}>
        <ChoiceChip
          label="5 jogadores (salão)"
          selected={draft.squadSize === 5}
          onPress={() => handleSquadSize(5)}
        />
        <ChoiceChip
          label="11 jogadores (campo)"
          selected={draft.squadSize === 11}
          onPress={() => handleSquadSize(11)}
        />
      </View>

      <FieldLabel>Formação</FieldLabel>
      <View style={styles.row}>
        {formations.map((item) => (
          <ChoiceChip
            key={item.id}
            label={item.name}
            selected={draft.formationId === item.id}
            onPress={() => handleFormation(item.id)}
          />
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 24 }} />
      ) : (
        <View style={[styles.pitch, !canEdit && styles.disabledBlock]}>
          <View style={styles.pitchInner}>
            <View style={styles.centerCircle} />
            <View style={styles.halfway} />
            {formation.slots.map((slot) => {
              const playerId = draft.assignments[slot.id];
              const name = memberName(playerId);
              return (
                <Pressable
                  key={slot.id}
                  disabled={!canEdit}
                  onPress={() => {
                    if (!canEdit) {
                      return;
                    }
                    if (!draft.teamId) {
                      setError('Salve o time antes de posicionar jogadores.');
                      return;
                    }
                    setPickingSlot(slot.id);
                  }}
                  style={[
                    styles.slot,
                    {
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                    },
                    playerId ? styles.slotFilled : null,
                  ]}
                >
                  <Text style={styles.slotLabel}>{slot.label}</Text>
                  <Text style={styles.slotName} numberOfLines={1}>
                    {name ? name.split(' ')[0] : canEdit ? '+' : '—'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      <Text style={styles.benchTitle}>Elenco disponível</Text>
      <Text style={styles.benchHint}>
        {canEdit
          ? 'Toque em uma posição e escolha um jogador. Só entram membros que aceitaram o convite.'
          : 'Membros ativos deste time.'}
      </Text>
      <View style={styles.benchRow}>
        {members.length === 0 ? (
          <Text style={styles.benchEmpty}>Nenhum membro ativo além do criador ainda.</Text>
        ) : (
          members.map((m) => (
            <View
              key={m.playerId}
              style={[
                styles.benchChip,
                assignedPlayerIds.has(m.playerId) && styles.benchChipUsed,
              ]}
            >
              <Text style={styles.benchChipText} numberOfLines={1}>
                {m.playerName.split(' ')[0]}
              </Text>
            </View>
          ))
        )}
      </View>

      {message ? <Text style={styles.ok}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {canEdit ? (
        <PrimaryButton
          label={saving ? 'Salvando...' : 'Salvar formação'}
          disabled={saving || !draft.teamId}
          onPress={handleSave}
        />
      ) : null}

      <Modal visible={pickingSlot != null} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setPickingSlot(null)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Escolher jogador</Text>
            {pickingSlot ? (
              <Pressable
                style={styles.modalItem}
                onPress={() => {
                  setAssignment(pickingSlot, null);
                  setPickingSlot(null);
                }}
              >
                <Text style={styles.modalClear}>Limpar posição</Text>
              </Pressable>
            ) : null}
            {availableMembers.map((m) => (
              <Pressable
                key={m.playerId}
                style={styles.modalItem}
                onPress={() => {
                  if (pickingSlot) {
                    setAssignment(pickingSlot, m.playerId);
                  }
                  setPickingSlot(null);
                }}
              >
                <Text style={styles.modalItemText}>{m.playerName}</Text>
                <Text style={styles.modalItemMeta}>{m.role}</Text>
              </Pressable>
            ))}
            {availableMembers.length === 0 ? (
              <Text style={styles.benchEmpty}>Nenhum jogador livre no elenco.</Text>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  rootEmbedded: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  readonlyBanner: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    backgroundColor: theme.colors.surfaceHigh,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceCard,
    alignItems: 'center',
  },
  tabActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#0F2A0F',
  },
  tabText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
  tabTextActive: {
    color: theme.colors.primarySoft,
  },
  panel: {
    gap: 12,
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  warn: {
    color: theme.colors.textDim,
    fontSize: 12,
    lineHeight: 16,
  },
  shieldPicker: {
    alignSelf: 'center',
    width: 112,
    height: 112,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceCard,
  },
  shieldImage: {
    width: '100%',
    height: '100%',
  },
  shieldPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shieldHint: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: theme.fontWeights.semibold,
  },
  input: {
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text,
    fontSize: 15,
  },
  inputReadonly: {
    opacity: 0.85,
    color: theme.colors.textMuted,
  },
  disabledBlock: {
    opacity: 0.9,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: theme.colors.primarySoft,
    fontWeight: theme.fontWeights.bold,
  },
  userName: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.bold,
  },
  userEmail: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
  inviteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  inviteBtnDone: {
    backgroundColor: theme.colors.surfaceHigh,
  },
  inviteText: {
    color: theme.colors.black,
    fontWeight: theme.fontWeights.bold,
    fontSize: 12,
  },
  inviteTextDone: {
    color: theme.colors.textMuted,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeights.bold,
    fontSize: 15,
  },
  ok: {
    color: theme.colors.primarySoft,
    fontSize: 13,
  },
  error: {
    color: theme.colors.dangerSoft,
    fontSize: 13,
    fontWeight: theme.fontWeights.semibold,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pitch: {
    height: 360,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: '#0B3D1E',
  },
  pitchInner: {
    flex: 1,
    margin: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 8,
    position: 'relative',
  },
  halfway: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  centerCircle: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    left: '50%',
    top: '50%',
    marginLeft: -35,
    marginTop: -35,
  },
  slot: {
    position: 'absolute',
    width: 56,
    height: 56,
    marginLeft: -28,
    marginTop: -28,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  slotFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0,40,0,0.75)',
  },
  slotLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: theme.fontWeights.bold,
  },
  slotName: {
    color: theme.colors.primarySoft,
    fontSize: 11,
    fontWeight: theme.fontWeights.bold,
  },
  benchTitle: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.bold,
    fontSize: 14,
  },
  benchHint: {
    color: theme.colors.textDim,
    fontSize: 12,
    lineHeight: 16,
  },
  benchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  benchChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  benchChipUsed: {
    opacity: 0.45,
  },
  benchChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: theme.fontWeights.semibold,
  },
  benchEmpty: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
    maxHeight: '55%',
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: theme.fontWeights.bold,
    marginBottom: 8,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalItemText: {
    color: theme.colors.text,
    fontWeight: theme.fontWeights.semibold,
  },
  modalItemMeta: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
  modalClear: {
    color: theme.colors.dangerSoft,
    fontWeight: theme.fontWeights.bold,
  },
});
