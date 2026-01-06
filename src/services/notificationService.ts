import { generateClient } from "aws-amplify/api";

// Ensure Amplify is configured before creating/using the GraphQL client.
import "../amplify";
import awsconfig from "../aws-exports";

const graphQLConfig = ((awsconfig as any)?.API?.GraphQL ?? {}) as {
  endpoint?: string;
};

const endpoint = graphQLConfig.endpoint;

/**
 * IMPORTANT:
 * We create an explicit endpoint+apiKey client so notifications do not depend on runtime
 * Amplify configuration order/merging (which can lead to NoApiKey/NoCredentials).
 */
const client =
  endpoint
    ? generateClient({ endpoint, authMode: "userPool" })
    : generateClient();

const notificationAuthMode = "userPool" as const;

if (import.meta.env.DEV) {
  console.info("[Notifications] AppSync auth setup:", {
    endpoint,
    forcedAuthMode: notificationAuthMode,
    clientIsExplicit: Boolean(endpoint),
  });
}

export interface NotificationItem {
  userId: string;
  notificationId: string;
  title: string;
  message: string;
  data?: string | null;
  createdAt: string;
  read: boolean;
}

const ON_NOTIFICATION = /* GraphQL */ `
  subscription OnNotification($userId: ID!) {
    onNotification(userId: $userId) {
      userId
      notificationId
      title
      message
      data
      createdAt
      read
    }
  }
`;

const LIST_NOTIFICATIONS = /* GraphQL */ `
  query ListMyNotifications($userId: ID!, $limit: Int, $nextToken: String) {
    listMyNotifications(userId: $userId, limit: $limit, nextToken: $nextToken) {
      items {
        userId
        notificationId
        title
        message
        data
        createdAt
        read
      }
      nextToken
    }
  }
`;

const MARK_NOTIFICATION_READ = /* GraphQL */ `
  mutation MarkNotificationRead($input: MarkNotificationReadInput!) {
    markNotificationRead(input: $input)
  }
`;

export interface NotificationPage {
  items: NotificationItem[];
  nextToken: string | null;
}

export async function fetchNotificationsPage(
  userId: string,
  limit = 20,
  nextToken?: string | null
): Promise<NotificationPage> {
  const response = await client.graphql({
    query: LIST_NOTIFICATIONS,
    variables: { userId, limit, nextToken: nextToken ?? undefined },
    ...(notificationAuthMode ? { authMode: notificationAuthMode } : {}),
  });

  const conn = (response as { data?: any })?.data?.listMyNotifications ?? {};
  const items = (conn?.items || []) as NotificationItem[];
  const token = (conn?.nextToken ?? null) as string | null;
  return { items, nextToken: token };
}

// Backwards-compatible helper
export async function fetchNotifications(userId: string, limit = 20) {
  const page = await fetchNotificationsPage(userId, limit, null);
  return page.items;
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const response = await client.graphql({
    query: MARK_NOTIFICATION_READ,
    variables: { input: { userId, notificationId } },
    ...(notificationAuthMode ? { authMode: notificationAuthMode } : {}),
  });

  const ok = (response as { data?: any })?.data?.markNotificationRead === true;
  if (!ok) {
    throw new Error("markNotificationRead returned false");
  }
  return true;
}

export function subscribeToNotifications(
  userId: string,
  onMessage: (notification: NotificationItem) => void,
  onError?: (error: unknown) => void
) {
  const observable = client.graphql({
    query: ON_NOTIFICATION,
    variables: { userId },
    ...(notificationAuthMode ? { authMode: notificationAuthMode } : {}),
  }) as unknown as {
    subscribe: (handlers: {
      next: (value: { data?: { onNotification?: NotificationItem | null } }) => void;
      error: (err: unknown) => void;
    }) => { unsubscribe: () => void };
  };

  return observable.subscribe({
    next: ({ data }: { data?: { onNotification?: NotificationItem | null } }) => {
      const notification = data?.onNotification ?? null;
      if (notification) {
        onMessage(notification);
      }
    },
    error: (err: unknown) => {
      console.error("Notification subscription error", err);
      onError?.(err);
    },
  });
}
