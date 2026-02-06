import { useQuery } from "@tanstack/react-query";
import { TicketService } from "@/services/ticket.service";

export const useTickets = (params?: any) => {
    return useQuery({
        queryKey: ["tickets", params],
        queryFn: async () => {
            return await TicketService.listTickets(params);
        },
    });
};
