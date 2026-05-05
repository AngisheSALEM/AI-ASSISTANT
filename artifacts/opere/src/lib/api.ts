function getApiBase(): string {
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE as string;
  }
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/api`;
}

export const API_BASE = getApiBase();

export function getToken(): string | null {
  return localStorage.getItem("opere_token");
}

export function setToken(token: string): void {
  localStorage.setItem("opere_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("opere_token");
}

export function getUser(): Record<string, any> | null {
  const raw = localStorage.getItem("opere_user");
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: Record<string, any>): void {
  localStorage.setItem("opere_user", JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem("opere_user");
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  auth: {
    register: (name: string, email: string, password: string) =>
      request("/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
    login: (email: string, password: string) =>
      request("/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  },
  org: {
    create: (name: string) =>
      request("/onboarding", { method: "POST", body: JSON.stringify({ name }) }),
    get: (orgId: string) => request(`/organization/${orgId}`),
    upgrade: (organizationId: string) =>
      request("/organization/upgrade", { method: "POST", body: JSON.stringify({ organizationId }) }),
    recharge: (organizationId: string, amount: number) =>
      request("/payments/recharge", { method: "POST", body: JSON.stringify({ organizationId, amount }) }),
  },
  agents: {
    list: (orgId: string) => request(`/agents/${orgId}`),
    templates: () => request("/templates"),
    createFromTemplate: (templateId: string, organizationId: string, agentName?: string) =>
      request("/agents/create-from-template", { method: "POST", body: JSON.stringify({ templateId, organizationId, agentName }) }),
  },
  chat: {
    copilot: (messages: { role: string; content: string }[], conversationId?: string) =>
      request("/chat", { method: "POST", body: JSON.stringify({ messages, conversationId }) }),
    history: (conversationId: string) => request(`/chat/history?conversationId=${conversationId}`),
    agent: (agentId: string, message: string, conversationId?: string) =>
      request(`/chat/${agentId}`, { method: "POST", body: JSON.stringify({ message, conversationId }) }),
  },
};
