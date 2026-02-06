import axiosInstance from "@/utils/axiosinstance";

export type ChatSession = {
    id: number;
    chat_id: string;
    status: "bot" | "queued" | "assigned" | "closed";
    agent_id: number | null;
    channel?: string;
    priority?: number;
    unread_count?: number;
    last_message_at?: string;
};

export type ChatMessage = {
    id: number;
    chat_id: string;
    sender: "customer" | "bot" | "agent" | "system";
    message: string;
    viewed_by_agent: "yes" | "no";
    createdAt: string;
    session?: ChatSession;
};

export const ChatService = {
    /** customer starts bot chat */
    // startChat(payload: { language?: string; channel?: string }) {
    //     return axiosInstance.post<ChatSession>("/chat/start", payload).then(r => r.data);
    // },

    startChat: async (channel: string, userType: string, name?: string, mobile?: string) => {
        const res = await axiosInstance.post("/chat/start", { channel, user_type: userType, name, mobile });
        return res.data;
    },

    /** promote customer to live agent queue */
    requestAgent(chat_id: string, priority = 0) {
        return axiosInstance.post(`/chat/${chat_id}/request-agent`, { priority }).then(r => r.data);
    },

    /** list queued chats (for agent dashboard) */
    getQueue(agentId: number) {
        // return axiosInstance.get<ChatSession[]>("/chat/queue").then(r => r.data);
        return axiosInstance.get<ChatSession[]>(`/chat/queue?agent_id=${agentId}`).then(r => r.data);
    },

    /** agent claims chat manually */
    assignChat(chat_id: string, user_id: number) {
        return axiosInstance.post(`/chat/${chat_id}/assign`, { user_id }).then(r => r.data);
    },

    /** close chat */
    closeChat(chat_id: string) {
        return axiosInstance.post(`/chat/${chat_id}/close`).then(r => r.data);
    },

    /** fetch chat messages */
    getMessages(chat_id: string) {
        return axiosInstance.get<ChatMessage[]>(`/chat/${chat_id}/messages`).then(r => r.data);
    },

    /** agent's assigned chats */
    getAssigned(user_id: number) {
        return axiosInstance.get<ChatSession[]>(`/chat/agent/${user_id}/assigned`).then(r => r.data);
    },

    rateAgent(chat_id: string, rating: number, message?: string) {
        return axiosInstance.post(`/chat/${chat_id}/rate`, { rating, message }).then(r => r.data);
    },

    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axiosInstance.post("/chat/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data;
    },

    // getRatedSessions: async () => {
    //     const res = await axiosInstance.get("/chat/ratings");
    //     return res.data;
    // },

    getRatedSessions: async (page = 1, limit = 10, filter = 'all') => {
        const res = await axiosInstance.get(`/chat/ratings?page=${page}&limit=${limit}&filter=${filter}`);
        return res.data;
    },

    verifyCustomer: async (phoneNumber: string) => {
        const res = await axiosInstance.post("/chat/verify-customer", { phone_number: phoneNumber });
        return res.data;
    },

    validateOtp: async (phoneNumber: string, otp: string) => {
        const res = await axiosInstance.post("/chat/verify-otp", { phone_number: phoneNumber, otp });
        return res.data;
    },

    upgradeSession: async (chat_id: string, name: string, mobile: string) => {
        const res = await axiosInstance.post(`/chat/${chat_id}/upgrade`, { name, mobile });
        return res.data;
    }
};
