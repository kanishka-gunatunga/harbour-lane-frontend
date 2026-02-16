"use client";

import React from "react";
import { useWidget } from "@/context/WidgetContext";
import { MessageSquareOff, MessagesSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/utils/auth";

const AgentWidgetToggle = () => {
    const { isAgentDashboardOpen, toggleAgentDashboard, resetSelection } = useWidget();
    const user = useCurrentUser();
    const pathname = usePathname();

    // Only show for agents/admins AND only on /tickets page
    if (!user || pathname !== '/tickets') return null;

    const handleClick = () => {
        toggleAgentDashboard();
    };

    return (
        <button
            onClick={handleClick}
            className={`fixed bottom-6 left-6 z-[999] p-4 rounded-full shadow-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center group
                ${isAgentDashboardOpen
                    ? "bg-[#DB2727] text-white"
                    : "bg-[#DB2727] text-white hover:bg-[#b01e1e] hover:-translate-y-1"
                }
            `}
            title={isAgentDashboardOpen ? "Show Chat List" : "Open Chat Dashboard"}
        >
            <MessagesSquare size={28} />

            <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-xs group-hover:ml-2 font-medium">
                {isAgentDashboardOpen ? "Chat List" : "Open Chat"}
            </span>
        </button>
    );
};

export default AgentWidgetToggle;
