"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
                callbackUrl: "/chat-dashboard",
            });

            console.log("[Login] signIn result:", result);

            if (result?.error) {
                console.error("[Login] Error:", result.error);
                setError("Invalid email or password");
                setIsLoading(false);
            } else {
                console.log("[Login] Success, redirecting to /chat-dashboard");
                router.replace("/chat-dashboard");
                // Keep loading true while redirecting
            }
        } catch (error) {
            setError("An unexpected error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Agent Login</h2>
                {error && (
                    <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="w-full rounded border px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="email"
                            type="email"
                            placeholder="agent@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-bold text-gray-700" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full rounded border px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="password"
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        className={`w-full rounded px-4 py-2 font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
