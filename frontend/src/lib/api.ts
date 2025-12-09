import { redirect } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface Household {
    id: string;
    name: string;
    city?: string;
    currency?: string;
    adminId: string;
    createdAt: string;
    updatedAt: string;
}

export async function login(email: string, password: string): Promise<{ accessToken: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
    }

    return res.json();
}

export async function getHouseholds(token: string): Promise<Household[]> {
    const res = await fetch(`${API_BASE_URL}/households`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error('Unauthorized');
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch households');
    }

    return res.json();
}
