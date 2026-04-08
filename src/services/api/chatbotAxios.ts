import axios from "axios";

const CHATBOT_API_BASE = import.meta.env.VITE_CHATBOT_API_BASE || 
  "https://czetk4q7hi.execute-api.eu-west-1.amazonaws.com/dev";

export const chatbotClient = axios.create({
  baseURL: CHATBOT_API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

export const chatbotApi = {
  get: async <T>(
    url: string,
    params?: Record<string, any>,
    signal?: AbortSignal,
  ) => {
    const res = await chatbotClient.get<T>(url, { params, signal });
    return res.data;
  },

  post: async <T>(
    url: string,
    data?: Record<string, any>,
    options?: { signal?: AbortSignal; headers?: Record<string, string> },
  ) => {
    const res = await chatbotClient.post<T>(url, data, {
      signal: options?.signal,
      headers: options?.headers,
    });
    return res.data;
  },
};
