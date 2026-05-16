"use client";

import React, { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { X, Zap } from 'lucide-react';

export default function AddMeterModal({ onClose }: { onClose: () => void }) {
    const [meterNumber, setMeterNumber] = useState("");
    const [alias, setAlias] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (meterNumber.length < 11) return alert("Invalid Meter Number");

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No user found");

            // Save to Firestore under users/{uid}/meters/{meterNumber}
            const meterRef = doc(db, 'users', user.uid, 'meters', meterNumber);
            await setDoc(meterRef, {
                meterNumber,
                alias: alias || "My Meter",
                addedAt: Date.now(),
                lastBalance: 0,
            });

            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to add meter");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-brand-100 rounded-full text-brand-600">
                        <Zap size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Add New Meter</h2>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meter Number (11 or 13 digits)</label>
                        <input
                            required
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="01234567890"
                            value={meterNumber}
                            onChange={(e) => setMeterNumber(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meter Alias (e.g. Home Office)</label>
                        <input
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            placeholder="e.g. Main House"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Save Meter"}
                    </button>
                </form>
            </div>
        </div>
    );
}