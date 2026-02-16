"use client";

import { SessionProvider } from "next-auth/react";
import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { WidgetProvider } from "@/context/WidgetContext";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <WidgetProvider>
                    {children}
                </WidgetProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
