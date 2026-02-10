import axiosInstance from "@/utils/axiosinstance";

export const AuthService = {
    register: async (userData: { name: string; email: string; password: string; role?: string }) => {
        const res = await axiosInstance.post("/auth/register", userData);
        return res.data;
    }
};
