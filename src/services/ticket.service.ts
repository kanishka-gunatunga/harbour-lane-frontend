import axiosInstance from "@/utils/axiosinstance";

export interface TicketUpdateData {
    status?: string;
    progress?: number;
    description?: string;
    // Add other fields as needed
}

export interface ActivityData {
    ticketId?: number; // Optional if passed in URL
    complaintId?: number; // Use standard naming if migrating from 'complaint'
    activity: string;
    activity_date: string;
}

export interface ReminderData {
    ticketId?: number;
    complaintId?: number;
    task_title: string;
    task_date: string;
    note?: string;
}

export const TicketService = {
    // Tickets
    listTickets: async (params?: any) => {
        const response = await axiosInstance.get(`/tickets`, { params });
        return response.data;
    },

    getTicketById: async (id: number) => {
        const response = await axiosInstance.get(`/tickets/${id}`);
        return response.data;
    },

    createTicket: async (data: any) => {
        const response = await axiosInstance.post(`/tickets`, data);
        return response.data;
    },

    updateTicket: async (id: number, data: TicketUpdateData) => {
        const response = await axiosInstance.put(`/tickets/${id}`, data);
        return response.data;
    },

    // FollowUps
    getFollowUps: async (ticketId: number) => {
        const response = await axiosInstance.get(`/tickets/${ticketId}/followups`);
        return response.data;
    },

    createFollowUp: async (ticketId: number, data: ActivityData) => {
        const response = await axiosInstance.post(`/tickets/${ticketId}/followups`, data);
        return response.data;
    },

    getRecentFollowUps: async (limit = 5) => {
        const response = await axiosInstance.get(`/followups/recent`, { params: { limit } });
        return response.data;
    },

    // Reminders
    getReminders: async (ticketId: number) => {
        const response = await axiosInstance.get(`/tickets/${ticketId}/reminders`);
        return response.data;
    },

    createReminder: async (ticketId: number, data: ReminderData) => {
        const response = await axiosInstance.post(`/tickets/${ticketId}/reminders`, data);
        return response.data;
    },

    getUpcomingReminders: async () => {
        const response = await axiosInstance.get(`/reminders/upcoming`);
        return response.data;
    },
};
