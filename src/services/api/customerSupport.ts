import { api, toApiError } from "../axios";

export type TicketReason = {
  id: string;
  reason: string;
  specializations?: string[];
  status: boolean;
  createdAt: number;
  updatedAt: number;
};

export type TicketReasonsResponse = {
  success: boolean;
  data: TicketReason[];
};

export async function getTicketReasons<TResp = TicketReasonsResponse>(): Promise<TResp> {
  const source = "getTicketReasons";
  try {
    const configBaseUrl = import.meta.env.VITE_CONFIGURATIONS_API_BASE;
    if (!configBaseUrl) throw new Error("Missing VITE_CONFIGURATIONS_API_BASE");
    
    const response = await fetch(`${configBaseUrl}/reasons`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch reasons`);
    }
    
    return await response.json() as TResp;
  } catch (err) {
    throw toApiError(source, err);
  }
}

export type CreateTicketRequest = {
  name: string;
  email: string;
  contact: {
    code: string;
    number: string;
  };
  reason: string;
  message: string;
  attachments?: File[];
};

export async function createTicket<TResp = any>(
  data: CreateTicketRequest,
): Promise<TResp> {
  const source = "createTicket";
  try {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("contact[code]", data.contact.code);
    formData.append("contact[number]", data.contact.number);
    formData.append("reason", data.reason);
    formData.append("message", data.message);

    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    return await api.post<TResp>("/ticket", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (err) {
    throw toApiError(source, err);
  }
}
