import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { TicketService } from "@/services/ticket.service";

// Create FollowUp
export const useCreateFollowUp = () => {
    const queryClient = useQueryClient();
    return useMutation({
        // Accepting object with ticketId and other props loose or strict
        mutationFn: async (vars: { ticketId?: number; complaintId?: number; activity: string; activity_date: string }) => {
            // Support both ticketId and complaintId property names for compatibility if needed, 
            // but service expects ticketId in URL.
            const id = vars.ticketId || vars.complaintId;
            if (!id) throw new Error("Ticket ID is required");

            return await TicketService.createFollowUp(id, vars);
        },
        onSuccess: (data, variables) => {
            const id = variables.ticketId || variables.complaintId;
            queryClient.invalidateQueries({ queryKey: ["ticketFollowUps", id] });
            queryClient.invalidateQueries({ queryKey: ["ticket", id] });
        },
    });
};

// Get FollowUps
export const useFollowUps = (ticketId: number | null) => {
    return useQuery({
        queryKey: ["ticketFollowUps", ticketId],
        queryFn: async () => {
            if (!ticketId) return [];
            return await TicketService.getFollowUps(ticketId);
        },
        enabled: !!ticketId,
    });
};

// Get Recent FollowUps (Global)
export const useRecentFollowUps = (limit: number = 1) => {
    return useQuery({
        queryKey: ["recentFollowUps", limit],
        queryFn: async () => {
            return await TicketService.getRecentFollowUps(limit);
        },
    });
};
