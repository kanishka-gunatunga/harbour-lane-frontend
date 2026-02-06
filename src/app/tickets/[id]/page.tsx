"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Added useRouter
import { ArrowLeft } from "lucide-react"; // Added ArrowLeft
import FlowBar, { ComplainStatus } from "@/components/FlowBar";
import TicketDetailsTab from "@/components/TicketDetailsTab";
import TicketInfoRow from "@/components/TicketInfoRow";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { useTicketById, useUpdateTicket } from "@/hooks/useTicket";
import { useCreateFollowUp, useFollowUps } from "@/hooks/useFollowUp";
import { useCreateReminder, useReminders } from "@/hooks/useReminder";
import { useCurrentUser } from "@/utils/auth";
import FormField from "@/components/FormField";
import { useForm } from "react-hook-form";

export default function TicketDetailsPage() {
    const { id } = useParams();
    const router = useRouter(); // Initialize router
    const ticketId = Number(id);

    const { toast, showToast, hideToast } = useToast();
    const user = useCurrentUser();

    const { data: ticket, isLoading: ticketLoading, error: ticketError } = useTicketById(ticketId);

    const updateTicketMutation = useUpdateTicket();
    const createFollowUpMutation = useCreateFollowUp();
    const createReminderMutation = useCreateReminder();

    const { data: followups, isLoading: followupsLoading, error: followupsError } = useFollowUps(ticketId);
    const { data: reminders, isLoading: remindersLoading, error: remindersError } = useReminders(ticketId);

    // Debugging logs
    console.log("Ticket:", ticket);
    console.log("Followups:", followups, "Loading:", followupsLoading, "Error:", followupsError);
    console.log("Reminders:", reminders, "Loading:", remindersLoading, "Error:", remindersError);

    const [isActivityModalOpen, setActivityModalOpen] = useState(false);
    const [isReminderModalOpen, setReminderModalOpen] = useState(false);
    const [isCompleteModalOpen, setCompleteModalOpen] = useState(false);

    const [activityText, setActivityText] = useState("");
    const [reminderTitle, setReminderTitle] = useState("");
    const [reminderDate, setReminderDate] = useState("");
    const [reminderNote, setReminderNote] = useState("");
    const [adminNote, setAdminNote] = useState("");

    const handleStatusChange = async (newStatus: ComplainStatus, note?: string) => {
        try {
            const payload: any = { status: newStatus };
            if (note) {
                await createFollowUpMutation.mutateAsync({
                    ticketId,
                    activity: `Status changed to ${newStatus}. Note: ${note}`,
                    activity_date: new Date().toISOString().split('T')[0]
                });
            } else {
                await createFollowUpMutation.mutateAsync({
                    ticketId,
                    activity: `Status changed to ${newStatus}`,
                    activity_date: new Date().toISOString().split('T')[0]
                });
            }

            await updateTicketMutation.mutateAsync({ id: ticketId, data: payload });
            showToast("Ticket updated successfully", "success");
            if (newStatus === "Completed") setCompleteModalOpen(false);
        } catch (error: any) {
            console.error("Error updating ticket:", error);
            showToast(`Failed to update ticket: ${error.message || "Unknown error"}`, "error");
        }
    };

    const handleActivitySave = async () => {
        if (!activityText.trim()) return;
        try {
            await createFollowUpMutation.mutateAsync({
                ticketId,
                activity: activityText,
                activity_date: new Date().toISOString().split('T')[0],
            });
            setActivityText("");
            setActivityModalOpen(false);
            showToast("Activity added successfully", "success");
        } catch (error: any) {
            console.error("Error creating follow-up:", error);
            // alert(`Failed to save activity: ${error?.response?.data?.message || error?.message}`);
            showToast(`Failed to save activity: ${error.message}`, "error");
        }
    };

    const handleReminderSave = async () => {
        if (!reminderTitle.trim() || !reminderDate) return;
        try {
            await createReminderMutation.mutateAsync({
                ticketId,
                task_title: reminderTitle,
                task_date: reminderDate,
                note: reminderNote,
            });
            setReminderTitle("");
            setReminderDate("");
            setReminderNote("");
            setReminderModalOpen(false);
            showToast("Reminder added successfully", "success");
        } catch (error: any) {
            console.error("Error creating reminder:", error);
            // alert(`Failed to save reminder: ${error?.response?.data?.message || error?.message}`);
            showToast(`Failed to save reminder: ${error.message}`, "error");
        }
    };

    if (ticketLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading ticket details...</p>
            </div>
        );
    }

    if (ticketError || !ticket) {
        return <p className="text-center mt-10 text-gray-500">Ticket not found or error loading.</p>;
    }

    return (
        <div
            className="relative w-full min-h-screen bg-[#E6E6E6B2]/70 backdrop-blur-md text-gray-900 montserrat overflow-x-hidden">
            <Toast
                message={toast.message}
                type={toast.type}
                visible={toast.visible}
                onClose={hideToast}
            />
            <main className="pt-30 px-16 ml-16 max-w-[1440px] mx-auto flex flex-col gap-8">
                {/* Back Button */}
                <div className="w-full flex justify-start">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[#575757] hover:text-black transition-colors"
                    >
                        <ArrowLeft size={24} />
                        <span className="font-medium text-lg">Back</span>
                    </button>
                </div>

                <section
                    className="relative bg-[#FFFFFF4D] mb-5 bg-opacity-30 rounded-[45px] border border-[#E0E0E0] px-9 py-10 flex flex-col justify-center items-center">
                    {/* Header */}
                    <div className="flex w-full justify-between items-center">
                        <div className="flex flex-wrap w-full gap-4 max-[1140px]:gap-2 items-center">
                            <span className="font-semibold text-[22px] max-[1140px]:text-[18px]">
                                Ticket No. {ticket.ticket_number}
                            </span>
                        </div>
                        <FlowBar<ComplainStatus>
                            variant="complains"
                            status={ticket.status as ComplainStatus}
                            onStatusChange={(newStatus) => {
                                // Locked logic handled in component, but safety check here
                                const COMPLAIN_STEPS = ["New", "In Review", "Processing", "Approval", "Completed"];
                                const currentIndex = COMPLAIN_STEPS.indexOf(ticket.status as string);
                                const newIndex = COMPLAIN_STEPS.indexOf(newStatus);

                                if (newIndex <= currentIndex) {
                                    // Optional: allow moving back if needed for admins, but user code had this lock
                                    // return; 
                                }

                                if (newStatus === "Completed") {
                                    setCompleteModalOpen(true);
                                } else {
                                    handleStatusChange(newStatus);
                                }
                            }}
                        />
                    </div>

                    {/* Tabs */}
                    <div className="w-full flex mt-10">
                        <div className="w-2/5">
                            <div className="mb-6 font-semibold text-[20px] max-[1140px]:text-[18px]">
                                Customer Details
                            </div>
                            <TicketInfoRow label="Customer Name:" value={ticket.customer?.name || 'N/A'} />
                            <TicketInfoRow label="Contact No:" value={ticket.customer?.mobile || 'N/A'} />
                            <TicketInfoRow label="Email:" value={ticket.customer?.email || 'N/A'} />
                            <TicketInfoRow label="Address:" value={ticket.customer?.address || 'N/A'} />

                            <div className="mt-8 mb-6 font-semibold text-[20px] max-[1140px]:text-[18px]">
                                Ticket Details
                            </div>
                            <TicketInfoRow label="Category:" value={ticket.category || 'N/A'} />
                            <TicketInfoRow label="Priority:" value={ticket.priority || 'N/A'} />
                            <TicketInfoRow label="Description:" value={ticket.description || 'N/A'} />

                        </div>

                        <div className="w-3/5 flex flex-col min-h-[400px]">
                            {/* Pass loading states implicitly by passing empty arrays if loading, 
                                but ideal would be to handle loading inside DetailsTab.
                                For now, we trust React Query eventual consistency. */}
                            <TicketDetailsTab
                                status={ticket.status as ComplainStatus}
                                onOpenActivity={() => setActivityModalOpen(true)}
                                onOpenReminder={() => setReminderModalOpen(true)}
                                followups={followups || []}
                                reminders={reminders || []}
                            />
                            {/* <div className="mt-6 flex w-full justify-end">
                                <button
                                    className="w-[121px] h-[41px] bg-[#DB2727] text-white rounded-[30px] flex justify-center items-center">
                                    Save
                                </button>
                            </div> */}
                        </div>
                    </div>
                </section>
            </main>

            {/* Activity Modal */}
            {isActivityModalOpen && (
                <Modal
                    title="Add New Activity"
                    onClose={() => setActivityModalOpen(false)}
                    actionButton={{
                        label: "Save",
                        onClick: handleActivitySave,
                    }}
                >
                    <div className="w-full">
                        <label className="block mb-2 font-semibold">Activity</label>
                        <input
                            type="text"
                            value={activityText}
                            onChange={(e) => setActivityText(e.target.value)}
                            className="w-[600px] h-[51px] rounded-[30px] bg-[#FFFFFF80] border border-black/50 backdrop-blur-[50px] px-4 mt-2"
                        />
                    </div>
                </Modal>
            )}

            {/* Reminder Modal */}
            {isReminderModalOpen && (
                <Modal
                    title="Add New Reminder"
                    onClose={() => setReminderModalOpen(false)}
                    actionButton={{
                        label: "Save",
                        onClick: handleReminderSave,
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        <div>
                            <label className="block mb-2 font-medium">Task Title</label>
                            <input
                                type="text"
                                value={reminderTitle}
                                onChange={(e) => setReminderTitle(e.target.value)}
                                className="w-[400px] max-[1345px]:w-[280px] h-[51px] rounded-[30px] bg-[#FFFFFF80] border border-black/50 backdrop-blur-[50px] px-4"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Task Date</label>
                            <input
                                type="date"
                                value={reminderDate}
                                onChange={(e) => setReminderDate(e.target.value)}
                                className="w-[400px] max-[1345px]:w-[280px] h-[51px] rounded-[30px] bg-[#FFFFFF80] border border-black/50 backdrop-blur-[50px] px-4"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Note</label>
                            <input
                                type="text"
                                value={reminderNote}
                                onChange={(e) => setReminderNote(e.target.value)}
                                className="w-[400px] max-[1345px]:w-[280px] h-[51px] rounded-[30px] bg-[#FFFFFF80] border border-black/50 backdrop-blur-[50px] px-4"
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {/* Complete Ticket Modal */}
            {isCompleteModalOpen && (
                <Modal
                    title={`Ticket No. ${ticket.ticket_number}`}
                    onClose={() => setCompleteModalOpen(false)}
                    actionButton={{
                        label: "Submit",
                        onClick: () => {
                            if (!adminNote.trim()) {
                                showToast("Please enter a closing comment.", "error");
                                return;
                            }
                            handleStatusChange("Completed", adminNote);
                        },
                    }}
                >
                    <div className="w-[800px]">
                        <p className="mb-4 text-[18px] font-medium text-[#1D1D1D]">Give a comment for close the complain.</p>
                        <label className="block mb-2 text-[17px] text-[#1D1D1D] font-medium">Comment</label>
                        <textarea
                            rows={4}
                            placeholder="Type your Comment Here"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            className="w-full text-[14px] text-[#575757] rounded-[20px] bg-[#FFFFFF80] p-4 focus:outline-none resize-none"
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
}
