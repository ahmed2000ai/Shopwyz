'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('shopwyz_token');
        if (!token) {
            router.push('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Welcome</p>
                        <h1 className="text-3xl font-bold text-gray-900">Shopwyz</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage households, grocery lists, and AI-powered shopping in one place.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem("shopwyz_token");
                            router.push("/login");
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                    >
                        Sign out
                    </button>
                </div>

                <section className="grid gap-4 md:grid-cols-2">
                    <Link
                        href="/households"
                        className="block border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition"
                    >
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Step 1</p>
                        <h2 className="text-xl font-semibold">Households</h2>
                        <p className="text-sm text-gray-600 mt-2">
                            View or create a household, set your city, and manage members.
                        </p>
                        <span className="inline-flex mt-3 text-indigo-600 text-sm font-semibold">
                            Go to households →
                        </span>
                    </Link>

                    <Link
                        href="/households"
                        className="block border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition"
                    >
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Step 2</p>
                        <h2 className="text-xl font-semibold">Lists & items</h2>
                        <p className="text-sm text-gray-600 mt-2">
                            Open a household, create lists, add items manually or via AI, and check them off.
                        </p>
                        <span className="inline-flex mt-3 text-indigo-600 text-sm font-semibold">
                            Manage lists →
                        </span>
                    </Link>

                    <Link
                        href="/households"
                        className="block border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition"
                    >
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Step 3</p>
                        <h2 className="text-xl font-semibold">Members</h2>
                        <p className="text-sm text-gray-600 mt-2">
                            Invite household members (owner-only) and collaborate in real time (coming soon).
                        </p>
                        <span className="inline-flex mt-3 text-indigo-600 text-sm font-semibold">
                            Manage members →
                        </span>
                    </Link>

                    <Link
                        href="/households"
                        className="block border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition"
                    >
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Step 4</p>
                        <h2 className="text-xl font-semibold">Best supermarket</h2>
                        <p className="text-sm text-gray-600 mt-2">
                            From any list, tap “Best supermarket” to get offer-based recommendations.
                        </p>
                        <span className="inline-flex mt-3 text-indigo-600 text-sm font-semibold">
                            View recommendations →
                        </span>
                    </Link>
                </section>
            </div>
        </main>
    );
}
