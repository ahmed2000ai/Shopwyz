'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getHouseholds, Household } from '@/lib/api';

export default function HouseholdsPage() {
    const router = useRouter();
    const [households, setHouseholds] = useState<Household[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('shopwyz_token');
        if (!token) {
            router.push('/login');
            return;
        }

        getHouseholds(token)
            .then((data) => {
                setHouseholds(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Loading households...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
                <p className="text-red-500 mb-4">Error: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">My Households</h1>

                {households.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <p className="text-gray-500 mb-4">You are not part of any households yet.</p>
                        {/* Future: Add button to create or join a household */}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {households.map((household) => (
                            <div
                                key={household.id}
                                onClick={() => router.push(`/households/${household.id}/lists`)}
                                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-blue-500"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">{household.name}</h2>
                                        {household.city && (
                                            <p className="text-sm text-gray-500">{household.city}</p>
                                        )}
                                    </div>
                                    <span className="text-gray-400">›</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
