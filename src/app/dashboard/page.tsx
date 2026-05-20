"use client";

import React, { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Zap, RefreshCw, CreditCard } from 'lucide-react';
import AddMeterModal from '../../components/AddMeterModal';
import TopUpModal from '../../components/TopUpModal'; // New Import
import { Meter } from '@/types';

export default function DashboardPage() {
    const { meters, setMeters } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);

    useEffect(() => {
        const authUnsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                const metersRef = collection(db, 'users', user.uid, 'meters');

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
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Meters</h1>
                    <p className="text-gray-500 text-sm">Monitor and recharge your electricity</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-100"
                >
                    <Plus size={20} />
                    Add Meter
                </button>
            </div>

            {/* Content Logic */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <RefreshCw className="animate-spin text-green-600 mb-4" size={40} />
                    <p className="text-gray-400 font-medium">Powering up your dashboard...</p>
                </div>
            ) : meters.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Zap className="text-gray-300" size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">No Meters Connected</h2>
                    <p className="text-gray-500 mb-8 max-w-xs mx-auto">Add your prepaid meter number to start tracking your electricity units.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition"
                    >
                        Connect Now
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {meters.map((meter) => (
                        <div key={meter.id} className="bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                                    <Zap size={24} fill={meter.lastBalance > 10 ? "currentColor" : "none"} />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                                    <p className="text-xs font-bold text-green-600">Active</p>
                                </div>
                            </div>

                            <h3 className="font-extrabold text-xl text-gray-900 mb-1">{meter.alias}</h3>
                            <p className="text-sm text-gray-400 font-mono mb-8 tracking-tighter">ID: {meter.id}</p>

                            <div className="bg-gray-50 p-5 rounded-2xl mb-6">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Current Balance</p>
                                <div className="flex items-baseline gap-1">
                                    <p className={`text-3xl font-black ${meter.lastBalance < 10 ? 'text-red-500' : 'text-gray-900'}`}>
                                        {meter.lastBalance.toFixed(2)}
                                    </p>
                                    <span className="text-gray-400 font-bold text-sm">kWh</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedMeter(meter)}
                                className="w-full bg-white border-2 border-gray-100 py-4 rounded-2xl font-bold text-gray-700 flex items-center justify-center gap-2 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-300"
                            >
                                <CreditCard size={18} />
                                Quick Top Up
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {isModalOpen && <AddMeterModal onClose={() => setIsModalOpen(false)} />}

            {/* Payment Modal */}
            {selectedMeter && (
                <TopUpModal
                    meter={selectedMeter}
                    onClose={() => setSelectedMeter(null)}
                />
            )}
        </div>
    );
}