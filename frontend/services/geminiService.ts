// API Base Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data as T;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

// Subscription API Service
export const subscriptionApi = {
  getAll: () => apiCall("/subscriptions"),
  getById: (id: string) => apiCall(`/subscriptions/${id}`),
  create: (data: any) =>
    apiCall("/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/subscriptions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/subscriptions/${id}`, {
      method: "DELETE",
    }),
  getByDate: (date: number) => apiCall(`/subscriptions/date/${date}`),
  getMonthlyTotal: () => apiCall<{ total: number }>("/stats/monthly-total"),
};

// AI Service
export const aiApi = {
  getInsights: () => apiCall("/ai/insights"),
  parseSmartAdd: (input: string) =>
    apiCall("/ai/parse-smart-add", {
      method: "POST",
      body: JSON.stringify({ input }),
    }),
};

// Backwards compatibility with old service exports
export const getSubscriptionInsights = async (subscriptions: any) => {
  return aiApi.getInsights();
};

export const parseSmartAdd = async (text: string) => {
  return aiApi.parseSmartAdd(text);
};
