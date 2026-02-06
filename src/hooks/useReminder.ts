import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { TicketService } from "@/services/ticket.service";

// Create Reminder
export const useCreateReminder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (vars: { ticketId?: number; complaintId?: number; task_title: string; task_date: string; note?: string }) => {
            const id = vars.ticketId || vars.complaintId;
            if (!id) throw new Error("Ticket ID is required");

            return await TicketService.createReminder(id, vars);
        },
        onSuccess: (data, variables) => {
            const id = variables.ticketId || variables.complaintId;
            queryClient.invalidateQueries({ queryKey: ["ticketReminders", id] });
            queryClient.invalidateQueries({ queryKey: ["ticket", id] });
            queryClient.invalidateQueries({ queryKey: ["upcomingReminders"] }); // Invalidate global list
        },
    });
};

// Get Reminders
export const useReminders = (ticketId: number | null) => {
    return useQuery({
        queryKey: ["ticketReminders", ticketId],
        queryFn: async () => {
            if (!ticketId) return [];
            return await TicketService.getReminders(ticketId);
        },
        enabled: !!ticketId,
    });
};

// Get Upcoming Reminders (Dashboard)
export const useUpcomingReminders = () => {
    return useQuery({
        queryKey: ["upcomingReminders"],
        queryFn: async () => {
            return await TicketService.getUpcomingReminders();
        },
    });
};
