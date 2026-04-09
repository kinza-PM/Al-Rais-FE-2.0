import { chatbotApi } from "./chatbotAxios";

export type SupportMessage = {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: string;
};

export type SupportConversation = {
  conversationId: string;
  userId?: string;
  email: string;
  name: string;
  phone: string;
  category: string;
  subcategory: string;
  messages: SupportMessage[];
  ticketId?: string;
  status: string;
  isNewConversation: boolean;
  redirectUrl?: string;
};

export type Category = {
  categoryId: string;
  categoryName: string;
  description: string;
  active: boolean;
};

export type Subcategory = {
  subcategoryId: string;
  categoryId: string;
  subcategoryName: string;
  description: string;
  active: boolean;
};

export type SendSupportMessageRequest = {
  message: string;
  conversationId?: string;
  email?: string;
  name?: string;
  phone?: string;
  category?: string;
  subcategory?: string;
  createTicket?: boolean;
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    categoryId: '1',
    categoryName: 'Booking Issues',
    description: 'Issues related to flight, hotel, or transport bookings',
    active: true
  },
  {
    categoryId: '2',
    categoryName: 'Refund Request',
    description: 'Request for refund or cancellation',
    active: true
  },
  {
    categoryId: '3',
    categoryName: 'Technical Support',
    description: 'Technical issues with the website or app',
    active: true
  },
  {
    categoryId: '4',
    categoryName: 'General Inquiry',
    description: 'General questions or inquiries',
    active: true
  },
  {
    categoryId: '5',
    categoryName: 'Other',
    description: 'Other issues not listed above',
    active: true
  }
];

export async function sendSupportMessage<TResp = SupportConversation>(
  data: SendSupportMessageRequest
): Promise<TResp> {
  try {
    const payload: any = {
      message: data.message,
      createTicket: data.createTicket || false
    };

    if (data.conversationId) {
      payload.conversationId = data.conversationId;
    } else {
      payload.email = data.email;
      payload.name = data.name;
      payload.phone = data.phone;
      payload.category = data.category;
      payload.subcategory = data.subcategory;
    }

    // console.log("payload", payload);
    return await chatbotApi.post<TResp>("/support/ticket", payload);
  } catch (err) {
    console.error("Error sending support message:", err);
    throw err;
  }
}

export async function getCategories<TResp = Category[]>(): Promise<TResp> {
  try {
    return await chatbotApi.get<TResp>("/categories");
  } catch (err) {
    console.error("Error fetching categories, using defaults:", err);
    return DEFAULT_CATEGORIES as unknown as TResp;
  }
}

export async function getSubcategories<TResp = Subcategory[]>(
  categoryId: string
): Promise<TResp> {
  try {
    return await chatbotApi.get<TResp>(`/subcategories/${categoryId}`);
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    throw err;
  }
}
