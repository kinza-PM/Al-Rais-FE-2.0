import { GraphQLClient, gql } from 'graphql-request';

const APPSYNC_ENDPOINT = import.meta.env.VITE_APPSYNC_ENDPOINT || '';
const APPSYNC_API_KEY = import.meta.env.VITE_APPSYNC_API_KEY || '';

const client = new GraphQLClient(APPSYNC_ENDPOINT, {
  headers: {
    'x-api-key': APPSYNC_API_KEY,
  },
});

// Queries
const GET_CONVERSATION = gql`
  query GetConversation($conversationId: ID!) {
    getConversation(conversationId: $conversationId) {
      conversationId
      userId
      email
      name
      phone
      category
      subcategory
      messages {
        id
        conversationId
        sender
        text
        timestamp
        status
      }
      ticketId
      status
      createdAt
      updatedAt
    }
  }
`;

const LIST_CONVERSATIONS_BY_USER = gql`
  query ListConversationsByUser($userId: ID!, $limit: Int, $nextToken: String) {
    listConversationsByUser(userId: $userId, limit: $limit, nextToken: $nextToken) {
      items {
        conversationId
        userId
        email
        name
        phone
        category
        subcategory
        ticketId
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Mutations
const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      conversationId
      sender
      text
      timestamp
      status
    }
  }
`;

const UPDATE_CONVERSATION_STATUS = gql`
  mutation UpdateConversationStatus($conversationId: ID!, $status: String!) {
    updateConversationStatus(conversationId: $conversationId, status: $status) {
      conversationId
      status
      updatedAt
    }
  }
`;

const CREATE_TICKET_FROM_CONVERSATION = gql`
  mutation CreateTicketFromConversation($conversationId: ID!, $category: String!, $subcategory: String!) {
    createTicketFromConversation(conversationId: $conversationId, category: $category, subcategory: $subcategory) {
      success
      ticketId
      message
    }
  }
`;

// Subscriptions
const ON_MESSAGE_RECEIVED = gql`
  subscription OnMessageReceived($conversationId: ID!) {
    onMessageReceived(conversationId: $conversationId) {
      id
      conversationId
      sender
      text
      timestamp
      status
    }
  }
`;

const ON_CONVERSATION_UPDATED = gql`
  subscription OnConversationUpdated($conversationId: ID!) {
    onConversationUpdated(conversationId: $conversationId) {
      conversationId
      status
      updatedAt
    }
  }
`;

export type Message = {
  id: string;
  conversationId: string;
  sender: string;
  text: string;
  timestamp: string;
  status?: string;
};

export type Conversation = {
  conversationId: string;
  userId?: string;
  email: string;
  name: string;
  phone: string;
  category?: string;
  subcategory?: string;
  messages: Message[];
  ticketId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type SendMessageInput = {
  conversationId: string;
  message: string;
  sender: string;
};

export async function getConversation(conversationId: string): Promise<Conversation> {
  try {
    const data = await client.request(GET_CONVERSATION, { conversationId });
    return data.getConversation;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
}

export async function listConversationsByUser(
  userId: string,
  limit?: number,
  nextToken?: string
): Promise<{ items: Conversation[]; nextToken?: string }> {
  try {
    const data = await client.request(LIST_CONVERSATIONS_BY_USER, {
      userId,
      limit,
      nextToken,
    });
    return data.listConversationsByUser;
  } catch (error) {
    console.error('Error listing conversations:', error);
    throw error;
  }
}

export async function sendMessage(input: SendMessageInput): Promise<Message> {
  try {
    const data = await client.request(SEND_MESSAGE, { input });
    return data.sendMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function updateConversationStatus(
  conversationId: string,
  status: string
): Promise<Conversation> {
  try {
    const data = await client.request(UPDATE_CONVERSATION_STATUS, {
      conversationId,
      status,
    });
    return data.updateConversationStatus;
  } catch (error) {
    console.error('Error updating conversation status:', error);
    throw error;
  }
}

export async function createTicketFromConversation(
  conversationId: string,
  category: string,
  subcategory: string
): Promise<{ success: boolean; ticketId?: string; message: string }> {
  try {
    const data = await client.request(CREATE_TICKET_FROM_CONVERSATION, {
      conversationId,
      category,
      subcategory,
    });
    return data.createTicketFromConversation;
  } catch (error) {
    console.error('Error creating ticket from conversation:', error);
    throw error;
  }
}

export function subscribeToMessageReceived(
  conversationId: string,
  onMessage: (message: Message) => void,
  onError?: (error: any) => void
) {
  // Note: For WebSocket subscriptions, you'll need to use AWS Amplify or a WebSocket client
  // This is a placeholder for the subscription setup
  console.log('Subscribing to messages for conversation:', conversationId);
  return {
    unsubscribe: () => {
      console.log('Unsubscribed from messages');
    },
  };
}

export function subscribeToConversationUpdated(
  conversationId: string,
  onUpdate: (conversation: Conversation) => void,
  onError?: (error: any) => void
) {
  // Note: For WebSocket subscriptions, you'll need to use AWS Amplify or a WebSocket client
  // This is a placeholder for the subscription setup
  console.log('Subscribing to conversation updates:', conversationId);
  return {
    unsubscribe: () => {
      console.log('Unsubscribed from conversation updates');
    },
  };
}
