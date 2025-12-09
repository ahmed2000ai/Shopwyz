const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export interface LoginResponse {
    accessToken: string;
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
