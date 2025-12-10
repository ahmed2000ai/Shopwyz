"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createList, getLists, GroceryList } from "@/lib/api";

export default function HouseholdListsPage() {
    const router = useRouter();
    const params = useParams<{ householdId: string }>();
    const householdId = params?.householdId;

    const [lists, setLists] = useState<GroceryList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const loadLists = useCallback(async () => {
        if (!householdId) return;
        try {
            setError(null);
            setLoading(true);
            const data = await getLists(householdId);
            setLists(data);
        } catch (err: any) {
            console.error("Error loading lists:", err);
            const msg = err?.message || "Failed to load lists";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [householdId]);

    useEffect(() => {
        const token = typeof window !== "undefined"
            ? localStorage.getItem("shopwyz_token")
            : null;
        if (!token) {
            router.replace("/login");
            return;
        }
        loadLists();
    }, [router, loadLists]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!householdId) return;
        const trimmed = name.trim();
        if (!trimmed) {
            setCreateError("List name is required.");
            return;
        }
        try {
            setCreateError(null);
            setCreating(true);
            await createList(householdId, { name: trimmed });
            setName("");
            await loadLists();
        } catch (err: any) {
            console.error("Error creating list:", err);
            const msg = err?.message || "Failed to create list";
            setCreateError(msg);
        } finally {
            setCreating(false);
        }
    };

    if (!householdId) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-red-600">No household selected.</p>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading lists...</p>
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
        <main className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
            <div className="w-full max-w-3xl bg-white shadow rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Household</p>
                        <h1 className="text-2xl font-semibold">Lists</h1>
                    </div>
                    <button
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                        onClick={() => router.push("/households")}
                    >
                        ← Back to households
                    </button>
                </div>

                <section className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <h2 className="text-lg font-medium mb-2">Create a list</h2>
                    <form className="space-y-3" onSubmit={handleCreate}>
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                placeholder="Weekly Groceries, BBQ Party, etc."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        {createError && (
                            <p className="text-sm text-red-600">{createError}</p>
                        )}
                        <button
                            type="submit"
                            disabled={creating}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {creating ? "Creating..." : "Create list"}
                        </button>
                    </form>
                </section>

                {lists.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No lists yet. Create your first one to get started.
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {lists.map((list) => (
                            <li
                                key={list.id}
                                className="py-3 px-2 hover:bg-gray-50 rounded-md cursor-pointer flex justify-between items-center"
                                onClick={() => router.push(`/lists/${encodeURIComponent(list.id)}`)}
                            >
                                <div>
                                    <p className="font-medium">{list.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {list._count?.items ?? 0} items
                                    </p>
                                </div>
                                <span className="text-gray-400 text-sm">→</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
}
