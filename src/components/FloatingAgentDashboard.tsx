"use client";

import React from "react";
import ChatDashboard from "./ChatDashboard";
import { useWidget } from "@/context/WidgetContext";
import { X } from "lucide-react";

const FloatingAgentDashboard = () => {
    const { isAgentDashboardOpen, setAgentDashboardOpen } = useWidget();

    if (!isAgentDashboardOpen) return null;

    return (
        <div
            onClick={() => setAgentDashboardOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-10 animate-fadeIn"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-6xl h-full max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Close Button Overlay for Widget Mode */}
                <button
                    onClick={() => setAgentDashboardOpen(false)}
                    className="absolute top-4 right-4 z-[110] p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition active:scale-95 text-gray-500 hover:text-red-600"
                    title="Close Dashboard"
                >
                    <X size={24} />
                </button>

                <div className="flex-1 overflow-hidden">
                    <ChatDashboard isWidget={true} />
                </div>
            </div>
        </div>
    );
};

export default FloatingAgentDashboard;
