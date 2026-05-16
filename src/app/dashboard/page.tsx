"use client";

import React, { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Zap, RefreshCw } from 'lucide-react';
import AddMeterModal from '../../components/AddMeterModal';
import { Meter } from '@/types';

export default function DashboardPage() {
    const { meters, setMeters } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use onAuthStateChanged to ensure we have the user BEFORE attaching the Firestore listener
        const authUnsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                const metersRef = collection(db, 'users', user.uid, 'meters');

                // Attach the real-time listener
                const firestoreUnsubscribe = onSnapshot(metersRef, (snapshot) => {
                    const meterList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Meter[];

                    console.log("Meters updated in UI:", meterList.length);
                    setMeters(meterList);
                    setLoading(false);
                }, (error) => {
                    console.error("Firestore Listener Error:", error);
                    setLoading(false);
                });

                return () => firestoreUnsubscribe();
            } else {
                setLoading(false);
            }
        });

        return () => authUnsubscribe();
    }, [setMeters]);

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Meters</h1>
                    <p className="text-gray-500 text-sm">Manage your electricity tokens</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition"
                >
                    <Plus size={20} />
                    Add Meter
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <RefreshCw className="animate-spin text-green-600" size={32} />
                </div>
            ) : meters.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                    <Zap className="mx-auto text-gray-300 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-800">No Meters Added</h2>
                    <p className="text-gray-500 mb-6">Connect your first meter to start tracking units.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-green-600 font-bold">
                        + Add Meter Number
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meters.map((meter) => (
                        <div key={meter.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <Zap size={20} />
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900">{meter.alias}</h3>
                            <p className="text-sm text-gray-400 font-mono mb-4">{meter.id}</p>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500 font-bold uppercase">Balance</p>
                                <p className="text-2xl font-black text-gray-900">{meter.lastBalance} <span className="text-sm font-normal text-gray-400">kWh</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && <AddMeterModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}