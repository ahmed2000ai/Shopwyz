"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createHousehold, getHouseholds } from "@/lib/api";

interface Household {
    id: string;
    name: string;
    city?: string | null;
}

export default function HouseholdsPage() {
    const router = useRouter();
    const [households, setHouseholds] = useState<Household[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const loadHouseholds = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await getHouseholds();
            setHouseholds(data);
        } catch (err: any) {
            console.error("Error loading households:", err);
            const msg =
                err?.message ||
                (typeof err === "string" ? err : "Failed to load households");
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("shopwyz_token")
                : null;

        if (!token) {
            router.replace("/login");
            return;
        }

        loadHouseholds();
    }, [router, loadHouseholds]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedCity = city.trim();

        if (!trimmedName) {
            setCreateError("Household name is required.");
            return;
        }

        try {
            setCreateError(null);
            setCreating(true);
            await createHousehold({
                name: trimmedName,
                city: trimmedCity || null,
            });
            setName("");
            setCity("");
            await loadHouseholds();
        } catch (err: any) {
            console.error("Error creating household:", err);
            const msg =
                err?.message ||
                (typeof err === "string" ? err : "Failed to create household");
            setCreateError(msg);
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading households...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="border border-red-200 bg-red-50 rounded-lg px-6 py-4 text-red-700 max-w-lg">
                    <p className="font-semibold mb-2">Error</p>
                    <p className="text-sm whitespace-pre-line">{error}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-2xl bg-white shadow rounded-xl p-6 space-y-6">
                <h1 className="text-xl font-semibold mb-4">Your Households</h1>

                <section className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <h2 className="text-lg font-medium mb-2">Create a household</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Add your home so you can start sharing lists with members.
                    </p>
                    <form className="space-y-3" onSubmit={handleCreate}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    placeholder="e.g. Home, Family, Roommates"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">City</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-md px-3 py-2 text-sm"
                                    placeholder="e.g. Riyadh"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>
                        </div>

                        {createError && (
                            <p className="text-sm text-red-600">{createError}</p>
                        )}

                        <button
                            type="submit"
                            disabled={creating}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {creating ? "Creating..." : "Create household"}
                        </button>
                    </form>
                </section>

                {households.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        You don&apos;t belong to any households yet.
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {households.map((h) => (
                            <li
                                key={h.id}
                                className="py-3 cursor-pointer hover:bg-gray-50 px-2 rounded-md"
                                onClick={() =>
                                    router.push(`/households/${encodeURIComponent(h.id)}/lists`)
                                }
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{h.name}</span>
                                    {h.city && (
                                        <span className="text-xs text-gray-500">{h.city}</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
