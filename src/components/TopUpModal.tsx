"use client";

import React, { useState } from 'react';
import { X, RefreshCw, Zap, CreditCard } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { auth } from '@/lib/firebase';

export default function TopUpModal({ meter, onClose }: { meter: any, onClose: () => void }) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [purchasedToken, setPurchasedToken] = useState<string | null>(null);

    const handlePayment = async () => {
        if (!amount || parseInt(amount) < 500) return alert("Minimum purchase is ₦500");

        setLoading(true);
        try {
            const response = await fetch('/api/electricity/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: auth.currentUser?.uid,
                    meterId: meter.id,
                    amount: parseInt(amount),
                }),
            });

            const data = await response.json();
            if (data.success) {
                setPurchasedToken(data.token);
            } else {
                alert("Payment failed. Please try again.");
            }
        } catch (e) {
            alert("Network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">

                {/* The Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors p-1 hover:bg-gray-100 rounded-full"
                >
                    <X size={20} />
                </button>

                {!purchasedToken ? (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Buy Power</h2>
                        <p className="text-gray-500 mb-6">Refilling meter: <span className="font-mono font-bold text-gray-900">{meter.id}</span></p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-400 uppercase">Amount (₦)</label>
                                <input
                                    type="number"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="2000"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition flex justify-center items-center gap-2"
                            >
                                {loading ? <RefreshCw className="animate-spin" /> : <CreditCard size={20} />}
                                {loading ? "Processing..." : `Pay ₦${amount || '0'}`}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap size={32} fill="currentColor" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Purchase Successful!</h2>
                        <p className="text-gray-500 mb-6">Your 20-digit electricity token:</p>

                        <div className="bg-gray-900 text-green-400 p-6 rounded-2xl font-mono text-xl tracking-widest mb-6">
                            {purchasedToken}
                        </div>

                        <button
                            onClick={() => {
                                // SPRINT 6: Trigger Bluetooth Loading here
                                onClose();
                            }}
                            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl"
                        >
                            Load Token Automatically
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}