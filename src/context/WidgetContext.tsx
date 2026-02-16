"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface WidgetContextType {
    isAgentDashboardOpen: boolean;
    toggleAgentDashboard: () => void;
    setAgentDashboardOpen: (open: boolean) => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider = ({ children }: { children: ReactNode }) => {
    const [isAgentDashboardOpen, setAgentDashboardOpen] = useState(false);

    const toggleAgentDashboard = () => setAgentDashboardOpen((prev) => !prev);

    return (
        <WidgetContext.Provider value={{ isAgentDashboardOpen, toggleAgentDashboard, setAgentDashboardOpen }}>
            {children}
        </WidgetContext.Provider>
    );
};

export const useWidget = () => {
    const context = useContext(WidgetContext);
    if (context === undefined) {
        throw new Error("useWidget must be used within a WidgetProvider");
    }
    return context;
};
