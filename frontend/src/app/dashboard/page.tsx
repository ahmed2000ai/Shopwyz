'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
                <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-700 text-lg">
                        You are logged in! Welcome to Shopwyz.
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('shopwyz_token');
                            router.push('/login');
                        }}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
