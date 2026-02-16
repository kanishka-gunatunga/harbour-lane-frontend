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
            className="fixed bottom-24 left-6 z-[998] w-full max-w-[450px] h-[650px] max-h-[80vh] flex flex-col animate-slideInLeft pointer-events-auto"
        >
            <div
                className="relative w-full h-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col border border-gray-200"
            >
                <div className="flex-1 overflow-hidden">
                    <ChatDashboard isWidget={true} />
                </div>
            </div>
        </div>
    );
};

export default FloatingAgentDashboard;
