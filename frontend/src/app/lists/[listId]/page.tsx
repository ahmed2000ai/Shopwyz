"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    addListItem,
    deleteListItem,
    getList,
    getListItems,
    getRecommendation,
    ListItem,
    parseTextToItems,
    setItemChecked,
    Unit,
    GroceryList,
} from "@/lib/api";

const unitOptions: Unit[] = ["PCS", "PACK", "KG", "G", "L", "ML"];

interface RecommendationResult {
    listId: string;
    householdId: string;
    city?: string;
    supermarkets: Array<{
        supermarketId: string;
        supermarketName: string;
        totalCost: number;
        totalDiscount: number;
        items: Array<{
            itemId: string;
            name?: string;
            offerId?: string;
            priceUsed?: number;
            calculatedCost?: number;
            status?: string;
        }>;
    }>;
}

export default function ListDetailPage() {
    const router = useRouter();
    const params = useParams<{ listId: string }>();
    const listId = params?.listId;

    const [list, setList] = useState<GroceryList | null>(null);
    const [items, setItems] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newName, setNewName] = useState("");
    const [newQty, setNewQty] = useState("1");
    const [newUnit, setNewUnit] = useState<Unit>("PCS");
    const [newNotes, setNewNotes] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const [aiText, setAiText] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
    const [recLoading, setRecLoading] = useState(false);
    const [recError, setRecError] = useState<string | null>(null);

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            // unchecked first, then by name
            if (a.isChecked !== b.isChecked) return a.isChecked ? 1 : -1;
            return a.name.localeCompare(b.name);
        });
    }, [items]);

    const loadData = useCallback(async () => {
        if (!listId) return;
        try {
            setError(null);
            setLoading(true);
            const [listData, itemData] = await Promise.all([
                getList(listId),
                getListItems(listId),
            ]);
            setList(listData);
            setItems(itemData);
        } catch (err: any) {
            console.error("Error loading list:", err);
            const msg = err?.message || "Failed to load list";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [listId]);

    useEffect(() => {
        const token = typeof window !== "undefined"
            ? localStorage.getItem("shopwyz_token")
            : null;
        if (!token) {
            router.replace("/login");
            return;
        }
        loadData();
    }, [router, loadData]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!listId) return;
        const qtyNumber = parseFloat(newQty || "0");
        if (!newName.trim()) {
            setCreateError("Item name is required.");
            return;
        }
        if (Number.isNaN(qtyNumber) || qtyNumber <= 0) {
            setCreateError("Quantity must be greater than zero.");
            return;
        }
        try {
            setCreateError(null);
            setCreating(true);
            await addListItem(listId, {
                name: newName.trim(),
                quantity: qtyNumber,
                unit: newUnit,
                notes: newNotes.trim() || undefined,
            });
            setNewName("");
            setNewQty("1");
            setNewUnit("PCS");
            setNewNotes("");
            await loadData();
        } catch (err: any) {
            console.error("Error adding item:", err);
            const msg = err?.message || "Failed to add item";
            setCreateError(msg);
        } finally {
            setCreating(false);
        }
    };

    const handleToggle = async (item: ListItem) => {
        if (!listId) return;
        try {
            await setItemChecked(listId, item.id, !item.isChecked);
            await loadData();
        } catch (err: any) {
            console.error("Error toggling item:", err);
            alert(err?.message || "Failed to update item");
        }
    };

    const handleDelete = async (item: ListItem) => {
        if (!listId) return;
        try {
            await deleteListItem(listId, item.id);
            await loadData();
        } catch (err: any) {
            console.error("Error deleting item:", err);
            alert(err?.message || "Failed to delete item");
        }
    };

    const handleAiParse = async () => {
        if (!listId) return;
        const text = aiText.trim();
        if (!text) {
            setAiError("Enter some text to parse.");
            return;
        }
        try {
            setAiError(null);
            setAiLoading(true);
            await parseTextToItems(listId, text);
            setAiText("");
            await loadData();
        } catch (err: any) {
            console.error("Error parsing text:", err);
            const msg = err?.message || "Failed to parse text";
            setAiError(msg);
        } finally {
            setAiLoading(false);
        }
    };

    const handleRecommendation = async () => {
        if (!listId) return;
        try {
            setRecError(null);
            setRecLoading(true);
            const data = await getRecommendation(listId);
            setRecommendation(data as RecommendationResult);
        } catch (err: any) {
            console.error("Error getting recommendation:", err);
            const msg = err?.message || "Failed to get recommendation";
            setRecError(msg);
        } finally {
            setRecLoading(false);
        }
    };

    if (!listId) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-red-600">No list selected.</p>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-sm">Loading list...</p>
            </main>
        );
    }

    if (error || !list) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="border border-red-200 bg-red-50 rounded-lg px-6 py-4 text-red-700 max-w-lg">
                    <p className="font-semibold mb-2">Error</p>
                    <p className="text-sm whitespace-pre-line">{error || "List not found"}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
            <div className="w-full max-w-5xl bg-white shadow rounded-xl p-6 space-y-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">List</p>
                        <h1 className="text-2xl font-semibold">{list.name}</h1>
                    </div>
                    <button
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                        onClick={() => router.push(`/households/${encodeURIComponent(list.householdId)}/lists`)}
                    >
                        ← Back to lists
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-medium">Items</h2>
                            <button
                                onClick={handleRecommendation}
                                disabled={recLoading}
                                className="text-sm bg-emerald-600 text-white px-3 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {recLoading ? "Calculating..." : "Best supermarket"}
                            </button>
                        </div>
                        <div className="border border-gray-100 rounded-lg">
                            {sortedItems.length === 0 ? (
                                <p className="text-sm text-gray-500 p-4">No items yet.</p>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {sortedItems.map((item) => (
                                        <li key={item.id} className="flex items-center justify-between px-4 py-3">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isChecked}
                                                    onChange={() => handleToggle(item)}
                                                    className="mt-1 h-4 w-4"
                                                />
                                                <div>
                                                    <p className={`font-medium ${item.isChecked ? "line-through text-gray-400" : ""}`}>
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.quantity} {item.unit}
                                                        {item.notes ? ` • ${item.notes}` : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="text-xs text-red-600 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 space-y-3">
                            <h3 className="font-medium">Add item</h3>
                            <form className="space-y-3" onSubmit={handleAddItem}>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-md px-3 py-2 text-sm"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g. Whole milk"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full border rounded-md px-3 py-2 text-sm"
                                            value={newQty}
                                            onChange={(e) => setNewQty(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Unit</label>
                                        <select
                                            className="w-full border rounded-md px-3 py-2 text-sm"
                                            value={newUnit}
                                            onChange={(e) => setNewUnit(e.target.value as Unit)}
                                        >
                                            {unitOptions.map((u) => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Notes</label>
                                    <textarea
                                        className="w-full border rounded-md px-3 py-2 text-sm"
                                        rows={2}
                                        value={newNotes}
                                        onChange={(e) => setNewNotes(e.target.value)}
                                        placeholder="Optional instructions"
                                    />
                                </div>
                                {createError && <p className="text-sm text-red-600">{createError}</p>}
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {creating ? "Adding..." : "Add item"}
                                </button>
                            </form>
                        </div>

                        <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 space-y-3">
                            <h3 className="font-medium">Add via AI</h3>
                            <p className="text-xs text-gray-600">
                                Paste natural language (e.g. "2kg chicken for grilling, snacks for kids, 3x 1L milk").
                            </p>
                            <textarea
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                rows={3}
                                value={aiText}
                                onChange={(e) => setAiText(e.target.value)}
                            />
                            {aiError && <p className="text-sm text-red-600">{aiError}</p>}
                            <button
                                onClick={handleAiParse}
                                disabled={aiLoading}
                                className="w-full bg-emerald-600 text-white py-2 rounded-md text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                            >
                                {aiLoading ? "Parsing..." : "Parse and add"}
                            </button>
                        </div>
                    </section>
                </div>

                <section className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium">Supermarket recommendation</h3>
                        {recError && <p className="text-sm text-red-600">{recError}</p>}
                    </div>

                    {!recommendation ? (
                        <p className="text-sm text-gray-500">
                            Click "Best supermarket" to calculate recommendations for this list.
                        </p>
                    ) : recommendation.supermarkets.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No supermarkets found in {recommendation.city ?? "your city"}.
                        </p>
                    ) : (
                        <div className="mt-3 space-y-3">
                            {recommendation.supermarkets.map((store) => (
                                <div
                                    key={store.supermarketId}
                                    className="border border-gray-200 rounded-md p-3 bg-white"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{store.supermarketName}</p>
                                            <p className="text-xs text-gray-500">
                                                Cost: {store.totalCost.toFixed(2)} • Discount: {store.totalDiscount.toFixed(2)}
                                            </p>
                                        </div>
                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                            {store === recommendation.supermarkets[0] ? "Best" : "Option"}
                                        </span>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-600 mb-1">Items:</p>
                                        <ul className="text-xs text-gray-700 space-y-1">
                                            {store.items.map((i) => (
                                                <li key={i.itemId} className="flex justify-between">
                                                    <span>{i.name ?? i.itemId}</span>
                                                    {i.status ? (
                                                        <span className="text-gray-500">{i.status}</span>
                                                    ) : (
                                                        <span>Cost: {i.calculatedCost?.toFixed(2) ?? "-"}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
