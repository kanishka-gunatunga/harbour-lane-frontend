/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

// import Header from "@/components/Header";
import Modal from "@/components/Modal";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { useTickets } from "@/hooks/useTickets";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";
import { useUpcomingReminders } from "@/hooks/useReminder";
import { useRecentFollowUps } from "@/hooks/useFollowUp";
import { useCurrentUser } from "@/utils/auth";
import FormField from "@/components/FormField";
import { useForm } from "react-hook-form";
import { TicketService } from "@/services/ticket.service";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";

const category = ["Complaint", "Inquiry", "Tech Support", "billing"];
const status = ["New", "In Review", "Processing", "Approval", "Completed"];

export default function TicketsDashboard() {

    const router = useRouter();
    const user = useCurrentUser();
    const queryClient = useQueryClient();
    const { toast, showToast, hideToast } = useToast();

    // Create Ticket State
    const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onCreateTicket = async (data: any) => {
        try {
            await TicketService.createTicket(data);
            showToast("Ticket created successfully!", "success");
            setIsCreateTicketModalOpen(false);
            reset();
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        } catch (error) {
            console.error(error);
            showToast("Failed to create ticket", "error");
        }
    };

    // Search State
    const [searchUserQuery, setSearchUserQuery] = useState("");
    const [isSearchUserActive, setIsSearchUserActive] = useState(false);
    const debouncedSearch = useDebounce(searchUserQuery, 500);

    const { data: tickets, isLoading, isError } = useTickets({
        search: debouncedSearch
    });

    const { data: reminderData } = useUpcomingReminders();
    const { data: recentFollowUps } = useRecentFollowUps(5);

    const [isFilterComplainsModalOpen, setIsFilterComplainsModalOpen] = useState(false);

    // const [isFilterComplainsModalOpen, setIsFilterComplainsModalOpen] = useState(false);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    const filteredTickets = useMemo(() => {
        if (!tickets) return [];

        return tickets.filter((t: any) => {
            // Search filter (client side if API doesn't handle all fields perfectly or for instant feel)
            // Note: API might handle search, but we also filter locally for category/status
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(t.category);
            const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(t.status);

            // Basic client-side search refiner if API result needs it
            const matchesSearch = !debouncedSearch ||
                t.ticket_number?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                t.customer?.name?.toLowerCase().includes(debouncedSearch.toLowerCase());

            return matchesCategory && matchesStatus && matchesSearch;
        });
    }, [tickets, selectedCategories, selectedStatuses, debouncedSearch]);

    const handleRowClick = (id: number) => {
        router.push(`/tickets/${id}`);
    };

    return (
        <div className="relative w-full min-h-screen bg-[#E6E6E6B2]/70 backdrop-blur-md text-gray-900 montserrat overflow-x-hidden">
            <main className="pt-30 px-16 ml-16 max-w-[1440px] mx-auto flex flex-col gap-8">
                <section
                    className="relative mb-5 bg-[#FFFFFF4D] bg-opacity-30 border border-[#E0E0E0] rounded-[45px] px-9 py-10 flex flex-col justify-center items-center">
                    <div className="w-full flex justify-between items-center">
                        <span className="font-semibold text-[22px]">All Tickets</span>

                        <div className="flex gap-5">
                            <div className="relative flex items-center justify-end">
                                <input
                                    type="text"
                                    value={searchUserQuery}
                                    onChange={(e) => setSearchUserQuery(e.target.value)}
                                    // onBlur={() => !searchUserQuery && setIsSearchUserActive(false)} // Keep open if typing
                                    placeholder={`Search Tickets...`}
                                    className={`
                                    bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500
                                    rounded-full border border-gray-300 outline-none
                                    transition-all duration-300 ease-in-out h-10 text-sm
                                    ${isSearchUserActive ? 'w-64 px-4 opacity-100 mr-2 border' : 'w-0 px-0 opacity-0 border-none'}
                                `}
                                    autoFocus={isSearchUserActive}
                                />
                                <button
                                    onClick={() => setIsSearchUserActive(!isSearchUserActive)}
                                    className={`ml-auto text-white text-base font-medium cursor-pointer rounded-full z-10 transition-transform duration-200 ${isSearchUserActive ? 'scale-90' : ''}`}
                                >
                                    {/* Using Lucide Icon or Image if available. Using Image as per reference */}
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    {/* <Image src="/search.svg" alt="search" height={36} width={36} className="h-12 w-12" /> */}
                                </button>
                            </div>
                            <button
                                className="w-12 h-12 bg-white cursor-pointer rounded-full shadow flex items-center justify-center"
                                onClick={() => setIsFilterComplainsModalOpen(true)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                {/* <Image src={"/images/admin/flowbite_filter-outline.svg"} width={24} height={24} alt="Filter icon" /> */}
                            </button>

                            <button
                                className="h-12 px-6 bg-[#DB2727] text-white cursor-pointer rounded-full shadow flex items-center justify-center font-medium hover:bg-red-700 transition"
                                onClick={() => setIsCreateTicketModalOpen(true)}
                            >
                                Create Ticket
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="w-full text-center py-10 text-gray-600">Loading tickets...</div>
                    ) : isError ? (
                        <div className="w-full text-center py-10 text-red-500">
                            Failed to load tickets.
                        </div>
                    ) : (

                        <div className="w-full mt-5 ">
                            <div className="h-[400px] overflow-x-auto overflow-y-hidden ">
                                <div className="min-w-[1000px] ">
                                    {/* Table header */}
                                    <div
                                        className="flex bg-gray-100 text-[#575757] font-normal text-lg montserrat border-b-2 mb-2 border-[#CCCCCC]">
                                        <div className="w-1/5 px-3 py-2">Category</div>
                                        <div className="w-1/5 px-3 py-2">Ticket No.</div>
                                        <div className="w-1/5 px-3 py-2">Contact No.</div>
                                        <div className="w-1/5 px-3 py-2">Email</div>
                                        <div className="w-1/5 px-3 py-2">Status</div>
                                    </div>

                                    {/* Table body (scrollable vertically) */}
                                    <div className="h-[360px] py-3 overflow-y-auto no-scrollbar">
                                        {filteredTickets.length > 0 ? (
                                            filteredTickets.map((item: any) => (
                                                <div
                                                    key={item.id}
                                                    className="flex text-lg mt-1 text-black hover:bg-gray-50 transition cursor-pointer"
                                                    onClick={() => handleRowClick(item.id)}
                                                >
                                                    <div className="w-1/5 px-3 py-2">{item.category}</div>
                                                    <div className="w-1/5 px-3 py-2">{item.ticket_number}</div>
                                                    <div className="w-1/5 px-3 py-2">{item.customer?.mobile || "N/A"}</div>
                                                    <div className="w-1/5 px-3 py-2">{item.customer?.email || "N/A"}</div>
                                                    <div className="w-1/5 px-3 py-2">{item.status}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center text-gray-600 py-5">
                                                No tickets found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section className="relative flex w-full mb-5 gap-5">
                    {/* Next Action (Upcoming Reminders) */}
                    <div className="flex flex-col flex-1 w-0 bg-[#FFFFFF4D] bg-opacity-30 border border-[#E0E0E0] rounded-[45px] px-9 py-10 min-h-[400px]">
                        <span className="font-semibold text-[22px]">Next Action</span>
                        <div className="h-full mt-5 overflow-y-auto no-scrollbar pr-2">
                            {/* Table header */}
                            <div className="flex font-medium text-[#575757] min-w-[400px] mb-2">
                                <div className="w-1/3 px-2">Ticket No.</div>
                                <div className="w-1/3 px-2">Customer Name</div>
                                <div className="w-1/3 px-2">Task Title</div>
                                <div className="w-1/4 px-2">Date</div>
                            </div>
                            <hr className="border-gray-300 mb-4" />

                            <div className="h-[200px] max-h-[300px] overflow-y-auto no-scrollbar">
                                {/* Table rows */}
                                {reminderData && reminderData.length > 0 ? (
                                    reminderData.map((item: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`flex ${idx > 0 ? "mt-3" : ""
                                                } font-medium text-black min-w-[400px] hover:bg-white/50 p-2 rounded-lg transition-colors cursor-pointer`}
                                            onClick={() => router.push(`/tickets/${item.ticket_id}`)}
                                        >
                                            <div className="w-1/3 px-2 truncate">{item.Ticket?.ticket_number || "N/A"}</div>
                                            <div className="w-1/3 px-2 truncate">{item.Ticket?.customer?.name || "N/A"}</div>
                                            <div className="w-1/3 px-2 truncate">{item.task_title}</div>
                                            <div className="w-1/4 px-2 text-sm text-gray-600">{new Date(item.task_date).toLocaleDateString()}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-4">No upcoming actions</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity (FollowUps) */}
                    <div className="flex flex-col flex-1 w-0 bg-[#FFFFFF4D] bg-opacity-30 border border-[#E0E0E0] rounded-[45px] px-9 py-10 min-h-[400px]">
                        <span className="font-semibold text-[22px]">Recent Activity</span>
                        <div className="h-full mt-5 overflow-y-auto no-scrollbar pr-2">
                            {/* Table header */}
                            <div className="flex font-medium text-[#575757] min-w-[400px] mb-2">
                                <div className="w-1/4 px-2">Ticket No.</div>
                                <div className="w-1/4 px-2">Customer</div>
                                <div className="w-1/4 px-2">Activity</div>
                                <div className="w-1/4 px-2">Date</div>
                            </div>
                            <hr className="border-gray-300 mb-4" />

                            <div className="h-[200px] max-h-[300px] overflow-y-auto no-scrollbar">
                                {/* Table rows */}
                                {recentFollowUps && recentFollowUps.length > 0 ? (
                                    recentFollowUps.map((item: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`flex ${idx > 0 ? "mt-3" : ""
                                                } font-medium text-black min-w-[400px] hover:bg-white/50 p-2 rounded-lg transition-colors cursor-pointer`}
                                            onClick={() => router.push(`/tickets/${item.ticket_id}`)}
                                        >
                                            <div className="w-1/4 px-2 truncate">{item.Ticket?.ticket_number || "N/A"}</div>
                                            <div className="w-1/4 px-2 truncate">{item.Ticket?.customer?.name || "N/A"}</div>
                                            <div className="w-1/4 px-2 truncate" title={item.activity}>{item.activity}</div>
                                            <div className="w-1/4 px-2 text-sm text-gray-600">{new Date(item.activity_date).toLocaleDateString()}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-4">No recent activity</div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Complain Filter Modal */}
            {isFilterComplainsModalOpen && (
                <Modal
                    title="Filter"
                    onClose={() => setIsFilterComplainsModalOpen(false)}
                    actionButton={{
                        label: "Apply",
                        onClick: () => {
                            // console.log("Selected Categories:", selectedCategories);
                            // console.log("Selected Statuses:", selectedStatuses);
                            setIsFilterComplainsModalOpen(false);
                        },
                    }}
                >
                    {/* --- Category --- */}
                    <div className="w-full">
                        <span className="font-montserrat font-semibold text-lg leading-[100%]">
                            Category
                        </span>
                        <div className="w-full mt-5 flex gap-3 flex-wrap">
                            {category.map((type) => {
                                const isSelected = selectedCategories.includes(type);
                                return (
                                    <div
                                        key={type}
                                        className={`inline-flex items-center justify-center px-8 py-2 rounded-4xl border-b-[0.88px] bg-[#DFDFDF] opacity-[1] cursor-pointer
                            ${isSelected
                                                ? "bg-blue-500 text-white border-none"
                                                : ""
                                            }`}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedCategories(
                                                    selectedCategories.filter((r) => r !== type)
                                                );
                                            } else {
                                                setSelectedCategories([...selectedCategories, type]);
                                            }
                                        }}
                                    >
                                        {type}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- Status --- */}
                    <div className="w-full mt-5">
                        <span className="font-montserrat font-semibold text-lg leading-[100%]">
                            Status
                        </span>
                        <div className="w-full mt-5 flex gap-3 flex-wrap">
                            {status.map((source) => {
                                const isSelected = selectedStatuses.includes(source);
                                return (
                                    <div
                                        key={source}
                                        className={`inline-flex items-center justify-center px-8 py-2 rounded-4xl border-b-[0.88px] bg-[#DFDFDF] opacity-[1] cursor-pointer
                            ${isSelected
                                                ? "bg-blue-500 text-white border-none"
                                                : ""
                                            }`}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedStatuses(
                                                    selectedStatuses.filter((d) => d !== source)
                                                );
                                            } else {
                                                setSelectedStatuses([...selectedStatuses, source]);
                                            }
                                        }}
                                    >
                                        {source}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Modal>
            )}

            {/* Create Ticket Modal */}
            {isCreateTicketModalOpen && (
                <Modal
                    title="Create Ticket"
                    onClose={() => setIsCreateTicketModalOpen(false)}
                    actionButton={{
                        label: "Submit",
                        onClick: handleSubmit(onCreateTicket),
                    }}
                // isPriorityAvailable={true}
                >
                    <form className="flex w-[800px] flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <FormField
                                    label="Customer Name"
                                    placeholder="Enter full name"
                                    register={register("customer_name", { required: "Name is required" })}
                                    error={errors.customer_name as any}
                                />
                            </div>
                            <div className="flex-1">
                                <FormField
                                    label="Email"
                                    placeholder="Enter email address"
                                    register={register("email", { required: "Email is required" })} // Simple regex can be added
                                    error={errors.email as any}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <FormField
                                    label="Contact Number"
                                    placeholder="Enter contact number"
                                    register={register("contact_number", { required: "Contact is required" })}
                                    error={errors.contact_number as any}
                                />
                            </div>
                            <div className="flex-1">
                                <FormField
                                    label="Inquiry Type"
                                    type="select"
                                    placeholder="Select Inquiry Type"
                                    options={[
                                        { value: "Complaint", label: "Complaint" },
                                        { value: "Inquiry", label: "Inquiry" },
                                        { value: "Tech Support", label: "Tech Support" },
                                        { value: "Billing", label: "Billing" },
                                    ]}
                                    register={register("inquiry_type", { required: "Type is required" })}
                                    error={errors.inquiry_type as any}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <FormField
                                    label="Address"
                                    placeholder="Enter address"
                                    register={register("address")}
                                />
                            </div>
                            <div className="w-1/3">
                                <FormField
                                    label="Zip Code"
                                    placeholder="Zip Code"
                                    register={register("zip_code")}
                                />
                            </div>
                        </div>

                        <FormField
                            label="Note"
                            type="textarea"
                            placeholder="Enter ticket details or notes..."
                            register={register("note", { required: "Note is required" })}
                            error={errors.note as any}
                        />
                    </form>
                </Modal>
            )}

            {toast.visible && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    visible={toast.visible}
                    onClose={hideToast}
                />
            )}
        </div>
    );
}