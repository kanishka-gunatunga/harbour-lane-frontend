import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TicketService, TicketUpdateData } from "@/services/ticket.service";

// Fetch Ticket by ID
export const useTicketById = (id: number | null) => {
    return useQuery({
        queryKey: ["ticket", id],
        queryFn: async () => {
            if (!id) return null;
            return await TicketService.getTicketById(id);
        },
        enabled: !!id,
    });
};

// Update Ticket
export const useUpdateTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: TicketUpdateData }) => {
            return await TicketService.updateTicket(id, data);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["ticket", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });
};
