const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export interface LoginResponse {
    accessToken: string;
}

export type Unit = "KG" | "G" | "L" | "ML" | "PCS" | "PACK";

export interface Household {
    id: string;
    name: string;
    city?: string | null;
}

export interface GroceryList {
    id: string;
    name: string;
    householdId: string;
    createdAt: string;
    updatedAt: string;
    _count?: { items: number };
}

export interface ListItem {
    id: string;
    name: string;
    quantity: number;
    unit: Unit;
    notes?: string | null;
    isChecked: boolean;
    createdAt: string;
    productId?: string | null;
    categoryId?: string | null;
}

function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("shopwyz_token");
}

async function authFetch(path: string, options: RequestInit = {}) {
    const token = getAccessToken();
    const headers = new Headers(options.headers || {});

    if (!headers.has("Content-Type") && options.method && options.method !== "GET") {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const text = await res.text();
        const error: any = new Error(text || "Request failed");
        (error.status = res.status);
        throw error;
    }

    return res.json();
}

/**
 * Auth: login (no Authorization header needed)
 */
export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        let message = "Login failed";
        try {
            const data = await res.json();
            if ((data as any)?.message) message = (data as any).message;
        } catch {
            // ignore
        }
        throw new Error(message);
    }

    const data = await res.json();

    // Support multiple token field names from backend
    const token =
        (data as any).accessToken ??
        (data as any).access_token ??
        (data as any).token;

    if (!token || typeof token !== "string") {
        console.error("Login response did not contain a usable token:", data);
        throw new Error("Login succeeded but no token was returned by the server.");
    }

    return { accessToken: token };
}

/**
 * Get households for current user
 */
export async function getHouseholds() {
    return authFetch("/households", {
        method: "GET",
    });
}

/**
 * Create a household for the current user
 */
export async function createHousehold(payload: { name: string; city?: string | null }) {
    return authFetch("/households", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getLists(householdId: string): Promise<GroceryList[]> {
    return authFetch(`/households/${encodeURIComponent(householdId)}/lists`, {
        method: "GET",
    });
}

export async function createList(householdId: string, payload: { name: string }) {
    return authFetch(`/households/${encodeURIComponent(householdId)}/lists`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getList(listId: string): Promise<GroceryList> {
    return authFetch(`/lists/${encodeURIComponent(listId)}`, {
        method: "GET",
    });
}

export async function getListItems(listId: string): Promise<ListItem[]> {
    return authFetch(`/lists/${encodeURIComponent(listId)}/items`, {
        method: "GET",
    });
}

export async function addListItem(
    listId: string,
    payload: { name: string; quantity: number; unit: Unit; notes?: string; productId?: string; categoryId?: string }
) {
    return authFetch(`/lists/${encodeURIComponent(listId)}/items`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function setItemChecked(listId: string, itemId: string, isChecked: boolean) {
    const path = isChecked ? "check" : "uncheck";
    return authFetch(`/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}/${path}`, {
        method: "POST",
    });
}

export async function deleteListItem(listId: string, itemId: string) {
    return authFetch(`/lists/${encodeURIComponent(listId)}/items/${encodeURIComponent(itemId)}/delete`, {
        method: "POST",
    });
}

export async function parseTextToItems(listId: string, text: string) {
    return authFetch("/ai/parse-text", {
        method: "POST",
        body: JSON.stringify({ listId, text }),
    });
}

export async function getRecommendation(listId: string) {
    return authFetch(`/lists/${encodeURIComponent(listId)}/recommendation`, {
        method: "GET",
    });
}
