"use client";

import React, { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { X, Zap } from 'lucide-react';

export default function AddMeterModal({ onClose }: { onClose: () => void }) {
    const [meterNumber, setMeterNumber] = useState("");
    const [alias, setAlias] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (meterNumber.length < 11) return alert("Meter number must be at least 11 digits.");

        setLoading(true);
        console.log("Attempting to save meter..."); // Log for debugging

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("User not authenticated");

            const meterRef = doc(db, 'users', user.uid, 'meters', meterNumber);

            await setDoc(meterRef, {
                id: meterNumber,
                alias: alias || "Main Meter",
                lastBalance: 0,
                updatedAt: Date.now(),
            });

            console.log("Meter saved successfully!");

            // Force a small delay so the user sees a "Success" state if you want, 
            // but for now, let's just close it immediately.
            onClose();

        } catch (error: any) {
            console.error("Firestore Error:", error.code, error.message);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition">
                    <X size={24} />
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Add Meter</h2>
                </div>

                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Meter Number</label>
                        <input
                            required
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition"
                            placeholder="e.g. 01234567890"
                            value={meterNumber}
                            onChange={(e) => setMeterNumber(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Name this meter</label>
                        <input
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition"
                            placeholder="e.g. My Home Office"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition disabled:opacity-50"
                    >
                        {loading ? "Registering..." : "Connect Meter"}
                    </button>
                </form>
            </div>
        </div>
    );
}