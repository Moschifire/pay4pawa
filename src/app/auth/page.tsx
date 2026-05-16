"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, normalizePhoneNumber } from "@/lib/utils/phone";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { ShieldCheck, Smartphone, Lock, Eye, EyeOff } from 'lucide-react';
import { setSession } from '@/lib/auth-utils';

export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(authSchema)
    });

    const onSubmit = async (data: any) => {
        setError("");
        const normalizedPhone = normalizePhoneNumber(data.phone);
        // Sophisticated Hack: Using phone as email to allow Phone+Password in Firebase
        const pseudoEmail = `${normalizedPhone.replace('+', '')}@pay4pawa.auth`;
        const userCredential = await signInWithEmailAndPassword(auth, pseudoEmail, data.password);
        const token = await userCredential.user.getIdToken();
        setSession(token); // Set the bouncer's pass
        window.location.href = "/dashboard";

        try {
            if (isSignup) {
                await createUserWithEmailAndPassword(auth, pseudoEmail, data.password);
                // Step to save phone number to Firestore would happen here
            } else {
                await signInWithEmailAndPassword(auth, pseudoEmail, data.password);
            }
            window.location.href = "/dashboard";
        } catch (err: any) {
            setError(err.message.includes("auth/user-not-found") ? "Account not found" : err.message);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            window.location.href = "/dashboard";
        } catch (err) {
            setError("Google Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Visual Panel */}
            <div className="hidden lg:flex bg-brand-900 flex-col justify-between p-12 text-white">
                <div>
                    <h2 className="text-3xl font-bold">Pay4Pawa</h2>
                    <p className="mt-4 text-brand-100 max-w-sm">
                        Empowering Nigerians with seamless, smart electricity payments. No tokens lost, no manual typing.
                    </p>
                </div>
                <div className="bg-brand-800/50 p-6 rounded-xl border border-brand-700">
                    <p className="italic text-sm text-brand-200">
                        "The first time I didn't have to walk to the meter to type a 20-digit code. Life-changing."
                    </p>
                    <p className="mt-2 font-bold text-sm">— Adeola B., Lagos</p>
                </div>
            </div>

            {/* Form Panel */}
            <div className="flex flex-col justify-center p-8 md:p-16 bg-white">
                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold">{isSignup ? "Create an account" : "Welcome back"}</h1>
                        <p className="text-gray-500 mt-2">Enter your details to access Pay4Pawa</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

                        <div className="relative">
                            <Smartphone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                {...register("phone")}
                                placeholder="Phone Number (e.g. 080...)"
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                            />
                            {errors.phone && <span className="text-xs text-red-500">{errors.phone.message as string}</span>}
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                            </button>
                            {errors.password && <span className="text-xs text-red-500">{errors.password.message as string}</span>}
                        </div>

                        <button
                            disabled={isSubmitting}
                            className="w-full bg-brand-600 text-white font-bold py-3 rounded-lg hover:bg-brand-700 transition disabled:opacity-50"
                        >
                            {isSubmitting ? "Processing..." : isSignup ? "Create Account" : "Login"}
                        </button>
                    </form>

                    <div className="relative flex items-center py-6">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="mx-4 text-gray-400 text-xs font-bold uppercase">or</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full border border-gray-200 py-3 rounded-lg flex items-center justify-center hover:bg-gray-50 transition font-medium"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5 mr-2" alt="Google" />
                        Continue with Google
                    </button>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        {isSignup ? "Already have an account?" : "New to Pay4Pawa?"}{" "}
                        <button
                            onClick={() => setIsSignup(!isSignup)}
                            className="text-brand-600 font-bold hover:underline"
                        >
                            {isSignup ? "Login" : "Sign Up"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}