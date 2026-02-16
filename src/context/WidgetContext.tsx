"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface WidgetContextType {
    isAgentDashboardOpen: boolean;
    toggleAgentDashboard: () => void;
    setAgentDashboardOpen: (open: boolean) => void;
    selectionResetTrigger: number;
    resetSelection: () => void;
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export const WidgetProvider = ({ children }: { children: ReactNode }) => {
    const [isAgentDashboardOpen, setAgentDashboardOpen] = useState(false);
    const [selectionResetTrigger, setSelectionResetTrigger] = useState(0);

    const toggleAgentDashboard = () => setAgentDashboardOpen((prev) => !prev);
    const resetSelection = () => setSelectionResetTrigger((prev) => prev + 1);

    return (
        <WidgetContext.Provider value={{
            isAgentDashboardOpen,
            toggleAgentDashboard,
            setAgentDashboardOpen,
            selectionResetTrigger,
            resetSelection
        }}>
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
