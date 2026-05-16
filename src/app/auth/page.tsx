"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, normalizePhoneNumber } from "@/lib/utils/phone";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { Smartphone, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react';
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

        // Convert phone to the internal pseudo-email format
        const pseudoEmail = `${normalizedPhone.replace('+', '')}@pay4pawa.auth`;

        try {
            let userCredential;

            if (isSignup) {
                // Create a NEW account
                userCredential = await createUserWithEmailAndPassword(auth, pseudoEmail, data.password);
                console.log("Account Created Successfully");
            } else {
                // Login to EXISTING account
                userCredential = await signInWithEmailAndPassword(auth, pseudoEmail, data.password);
                console.log("Logged in Successfully");
            }

            // Secure the session with the bouncer
            const token = await userCredential.user.getIdToken();
            setSession(token);

            // Move to dashboard
            window.location.href = "/dashboard";

        } catch (err: any) {
            console.error("Firebase Auth Error Code:", err.code);

            // Sophisticated error mapping
            switch (err.code) {
                case 'auth/invalid-credential':
                    setError("Invalid phone number or password. If you're new, please click 'Sign Up' below.");
                    break;
                case 'auth/email-already-in-use':
                    setError("This phone number is already registered. Try logging in instead.");
                    break;
                case 'auth/weak-password':
                    setError("Password is too weak. Please use at least 8 characters.");
                    break;
                default:
                    setError("Authentication failed. Please check your internet and try again.");
            }
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
            <div className="flex flex-col justify-center p-8 md:p-16 bg-white min-h-screen">
                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            {isSignup ? "Create account" : "Welcome back"}
                        </h1>
                        <p className="text-gray-500 mt-2">Access your Pay4Pawa dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    {...register("phone")}
                                    placeholder="08012345678"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition text-gray-900"
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message as string}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition text-gray-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message as string}</p>}
                        </div>

                        {/* Primary Action Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 transition-all transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="animate-spin h-5 w-5" />
                            ) : (
                                <span>{isSignup ? "Create Account" : "Login to Dashboard"}</span>
                            )}
                        </button>
                    </form>

                    <div className="relative flex items-center py-8">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">or</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        type="button"
                        className="w-full border-2 border-gray-100 py-3.5 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-200 transition-all font-bold text-gray-700"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5 mr-3" alt="Google" />
                        Continue with Google
                    </button>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        {isSignup ? "Already have an account?" : "New to Pay4Pawa?"}{" "}
                        <button
                            onClick={() => setIsSignup(!isSignup)}
                            className="text-green-600 font-extrabold hover:underline ml-1"
                        >
                            {isSignup ? "Login" : "Sign Up"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}