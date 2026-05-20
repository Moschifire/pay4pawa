"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSchema, normalizePhoneNumber, nigerianPhoneRegex } from "@/lib/utils/phone"; // Added nigerianPhoneRegex
import { auth, db } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import {
    doc,
    setDoc,
    query,
    where,
    getDocs,
    collection
} from "firebase/firestore"; // Added doc, setDoc, query, where, getDocs, collection
import { Smartphone, Lock, Eye, EyeOff, RefreshCw, Mail, User } from 'lucide-react';
import { setSession } from '@/lib/auth-utils';
import { sendPasswordResetEmail } from "firebase/auth";

export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(authSchema)
    });

    const handleForgotPassword = async () => {
        // We get the identifier (email) from the form state
        const email = (document.getElementsByName("identifier")[0] as HTMLInputElement)?.value;

        if (!email || !email.includes("@")) {
            setError("Please enter your registered email address in the field above first.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset link sent to " + email + ". Please check your inbox.");
        } catch (err: any) {
            setError("Error: " + err.message);
        }
    };

    const onSubmit = async (data: any) => {
        setError(""); // Clear any previous errors
        try {
            let userCredential;

            if (isSignup) {
                // --- 1. SIGN-UP LOGIC ---

                // Ensure all required fields for signup are present
                if (!data.name || !data.email || !data.phone) {
                    setError("Please fill in all fields to create an account.");
                    return;
                }

                // A. Create the user in Firebase Auth
                userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

                // B. Set the User's Display Name
                await updateProfile(userCredential.user, { displayName: data.name });

                // C. Send Verification Email
                await sendEmailVerification(userCredential.user);

                // D. Save the full profile to Firestore (including phone for future dual-login)
                const normalizedPhone = normalizePhoneNumber(data.phone);
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    name: data.name,
                    email: data.email,
                    phone: normalizedPhone,
                    createdAt: Date.now(),
                });

                alert("Account created! A verification email has been sent to " + data.email + ". Please verify your email before logging in.");

                // Toggle UI back to login mode
                setIsSignup(false);

            } else {
                // --- 2. LOGIN LOGIC (Email or Phone) ---

                if (!data.identifier) {
                    setError("Please enter your Email or Phone Number.");
                    return;
                }

                let loginEmail = data.identifier.trim();

                // Check if the user entered a Nigerian Phone Number instead of an Email
                const isPhone = nigerianPhoneRegex.test(loginEmail);

                if (isPhone) {
                    const normalized = normalizePhoneNumber(loginEmail);

                    // Query Firestore to find which email is linked to this phone number
                    const q = query(collection(db, "users"), where("phone", "==", normalized));
                    const querySnapshot = await getDocs(q);

                    if (querySnapshot.empty) {
                        setError("No account found with this phone number. Please Sign Up.");
                        return;
                    }

                    // Retrieve the actual email associated with the phone record
                    loginEmail = querySnapshot.docs[0].data().email;
                }

                // Attempt login with the resolved email and password
                userCredential = await signInWithEmailAndPassword(auth, loginEmail, data.password);

                // --- 3. VERIFICATION GUARD ---
                // Even with correct password, block access if email isn't verified
                if (!userCredential.user.emailVerified) {
                    setError("Please verify your email address first. Check your inbox.");
                    await auth.signOut(); // Kick them out of the auth state
                    return;
                }

                // SUCCESS: Setup session and enter the app
                const token = await userCredential.user.getIdToken();
                setSession(token);
                window.location.href = "/dashboard";
            }
        } catch (err: any) {
            console.error("Auth Error Code:", err.code);

            // Map Firebase technical errors to professional messages
            switch (err.code) {
                case 'auth/invalid-credential':
                    setError("Invalid email/phone or password. Please try again.");
                    break;
                case 'auth/email-already-in-use':
                    setError("This email is already registered. Try logging in.");
                    break;
                case 'auth/too-many-requests':
                    setError("Too many failed attempts. Please try again later.");
                    break;
                case 'auth/user-disabled':
                    setError("This account has been disabled. Contact support.");
                    break;
                default:
                    setError("Authentication failed: " + err.message);
            }
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
            setSession(token);
            window.location.href = "/dashboard";
        } catch (err: any) {
            setError("Google Login failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-white">
            {/* Left Panel - Visual (Hidden on Mobile) */}
            <div className="hidden lg:flex bg-brand-900 flex-col justify-between p-12 text-white">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight">Pay4Pawa</h2>
                    <p className="mt-4 text-brand-100 text-lg max-w-sm">
                        Smart electricity management for modern Nigerian homes.
                    </p>
                </div>
                <div className="bg-brand-800/40 p-8 rounded-2xl border border-brand-700 backdrop-blur-sm">
                    <p className="italic text-brand-100 leading-relaxed">
                        "The fastest way to recharge my meter without ever touching the physical keypad. Pay4Pawa is a game changer for my office."
                    </p>
                    <p className="mt-4 font-bold text-green-400">— Chidi O., Abuja</p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex flex-col justify-center p-8 md:p-16 lg:p-24 overflow-y-auto">
                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            {isSignup ? "Create an account" : "Welcome back"}
                        </h1>
                        <p className="text-gray-500 mt-2">
                            {isSignup ? "Join thousands of smart Nigerians." : "Enter your credentials to continue."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

                        {/* SIGNUP ONLY: Name */}
                        {isSignup && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                                <input {...register("name")} placeholder="John Doe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                        )}

                        {/* LOGIN ONLY: Email or Phone */}
                        {!isSignup && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Email or Phone Number</label>
                                <input {...register("identifier")} placeholder="email@me.com or 080..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                        )}

                        {/* SIGNUP ONLY: Separate Email and Phone */}
                        {isSignup && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                    <input {...register("email")} type="email" placeholder="name@example.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                    <input {...register("phone")} placeholder="080..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                                </div>
                            </>
                        )}

                        {/* ALWAYS: Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                            <input {...register("password")} type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                {!isSignup && (
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-[10px] font-bold text-brand-600 hover:underline uppercase tracking-tighter"
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Debugger: This will show you why the button isn't clicking */}
                        {Object.keys(errors).length > 0 && (
                            <div className="p-3 bg-orange-50 border border-orange-200 text-orange-700 text-xs rounded-lg">
                                <strong>Validation Errors:</strong>
                                <ul className="list-disc ml-4">
                                    {Object.values(errors).map((err: any, i) => (
                                        <li key={i}>{err.message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg">
                            {isSubmitting ? "Processing..." : isSignup ? "Create Account" : "Login"}
                        </button>
                    </form>

                    <div className="relative flex items-center py-8">
                        <div className="flex-grow border-t border-gray-100"></div>
                        <span className="mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">or</span>
                        <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        type="button"
                        className="group relative w-full border-2 border-gray-100 py-3.5 rounded-xl flex items-center justify-center font-bold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-200"
                    >
                        {/* SVG Container replacing your <img> tag */}
                        <div className="w-5 h-5 mr-3 shrink-0">
                            <svg
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 48 48"
                                className="block w-full h-full"
                            >
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                            </svg>
                        </div>

                        Continue with Google
                    </button>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        {isSignup ? "Already have an account?" : "New to Pay4Pawa?"}{" "}
                        <button
                            onClick={() => setIsSignup(!isSignup)}
                            className="text-green-600 font-extrabold hover:underline ml-1"
                        >
                            {isSignup ? "Login here" : "Sign Up here"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}