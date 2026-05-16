"use client";

import React, { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Zap, History, User, LogOut } from 'lucide-react';
import { clearSession } from '@/lib/auth-utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        // Auth Observer: Watch for logout events
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                clearSession();
                router.push('/auth');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await auth.signOut();
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-brand-700">Pay4Pawa</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />
                    <NavItem icon={<Zap size={20} />} label="Meters" />
                    <NavItem icon={<History size={20} />} label="History" />
                    <NavItem icon={<User size={20} />} label="Profile" />
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 text-red-600 font-medium p-3 w-full hover:bg-red-50 rounded-lg transition"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <div className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition ${active ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}>
            {icon}
            <span className="font-medium">{label}</span>
        </div>
    );
}