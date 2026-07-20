import { graphqlRequest } from '@/lib/api/graphql';

export type NotificationType =
  | 'CONVITE_TIME'
  | 'CONVITE_CAMPEONATO'
  | 'SOLICITACAO_CAMPEONATO'
  | 'RESULTADO_PARTIDA'
  | 'SUSPENSAO'
  | 'AVISO';

export type NotificationStatus = 'PENDENTE' | 'ACEITO' | 'RECUSADO' | 'LIDO';

export type NotificationCategory = 'INVITES' | 'ALERTS';

export type MyNotificationItem = {
  id: number;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  isInvite: boolean;
  isUnread: boolean;
  fromUserId: number | null;
  fromUserName: string | null;
  teamId: number | null;
  teamName: string | null;
  championshipId: number | null;
  championshipName: string | null;
  matchId: number | null;
  readAt: string | null;
  createdAt: string;
};

const MY_NOTIFICATIONS_QUERY = `
  query MyNotifications($category: NotificationCategory) {
    myNotifications(category: $category) {
      id
      type
      status
      title
      message
      isInvite
      isUnread
      fromUserId
      fromUserName
      teamId
      teamName
      championshipId
      championshipName
      matchId
      readAt
      createdAt
    }
  }
`;

const RESPOND_TO_INVITE_MUTATION = `
  mutation RespondToInvite($notificationId: Int!, $accept: Boolean!) {
    respondToInvite(notificationId: $notificationId, accept: $accept) {
      id
      status
    }
  }
`;

const MARK_NOTIFICATION_READ_MUTATION = `
  mutation MarkNotificationRead($notificationId: Int!) {
    markNotificationRead(notificationId: $notificationId) {
      id
      status
      readAt
    }
  }
`;

const MARK_ALL_ALERTS_READ_MUTATION = `
  mutation MarkAllAlertsRead {
    markAllAlertsRead
  }
`;

const NOTIFY_PLAYER_SUSPENSION_MUTATION = `
  mutation NotifyPlayerSuspension($input: NotifyPlayerSuspensionInput!) {
    notifyPlayerSuspension(input: $input) {
      id
      userId
      type
      title
    }
  }
`;

export async function fetchMyNotifications(
  token: string,
  category?: NotificationCategory,
): Promise<MyNotificationItem[]> {
  const data = await graphqlRequest<
    { myNotifications: MyNotificationItem[] },
    { category?: NotificationCategory }
  >(MY_NOTIFICATIONS_QUERY, category ? { category } : {}, token);
  return data.myNotifications;
}

export async function respondToInvite(
  token: string,
  notificationId: number,
  accept: boolean,
): Promise<void> {
  await graphqlRequest(
    RESPOND_TO_INVITE_MUTATION,
    { notificationId, accept },
    token,
  );
}

export async function markNotificationRead(
  token: string,
  notificationId: number,
): Promise<void> {
  await graphqlRequest(
    MARK_NOTIFICATION_READ_MUTATION,
    { notificationId },
    token,
  );
}

export async function markAllAlertsRead(token: string): Promise<number> {
  const data = await graphqlRequest<{ markAllAlertsRead: number }>(
    MARK_ALL_ALERTS_READ_MUTATION,
    undefined,
    token,
  );
  return data.markAllAlertsRead;
}

export async function notifyPlayerSuspension(
  token: string,
  input: {
    playerId: number;
    teamId: number;
    championshipId?: number;
    matchId?: number;
    reason?: string;
  },
): Promise<void> {
  await graphqlRequest(NOTIFY_PLAYER_SUSPENSION_MUTATION, { input }, token);
}

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

export function inviteStatusLabel(status: NotificationStatus): string | null {
  if (status === 'ACEITO') {
    return 'Aceito';
  }
  if (status === 'RECUSADO') {
    return 'Recusado';
  }
  return null;
}
