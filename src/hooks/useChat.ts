import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ChatService } from "@/services/chatService";
import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/query-core";

export function useAgentChat(agentId: number | undefined) {
    const socketRef = useRef<Socket | null>(null);

    // We use a Ref for the selected ID so the socket listener
    // can read the current value without stale closures
    const selectedChatIdRef = useRef<string | null>(null);

    const [queue, setQueue] = useState<any[]>([]);
    const [assigned, setAssigned] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [isCustomerTyping, setIsCustomerTyping] = useState(false);

    // Update the Ref whenever state changes
    useEffect(() => {
        selectedChatIdRef.current = selectedChatId;
    }, [selectedChatId]);

    // Initialize Socket Connection
    useEffect(() => {
        if (!agentId) return;

        // Connect
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
            transports: ["websocket"],
            query: { role: "agent", user_id: agentId },
        });
        socketRef.current = socket;

        // --- Listeners ---

        socket.on("agent.updateQueue", fetchQueue);

        // Refresh assigned list when status changes
        socket.on("agent.assigned", fetchAssigned);
        socket.on("chat.closed", fetchAssigned);

        // Handle incoming messages
        socket.on("message.new", (msg) => {
            // Check if the incoming message belongs to the currently open chat
            if (selectedChatIdRef.current === msg.chat_id) {
                setMessages((prev) => {
                    // If message ID already exists, do not add it again
                    if (prev.some((m) => m.id === msg.id)) {
                        return prev;
                    }
                    return [...prev, msg];
                });

                // Clear typing indicator when a new message arrives
                setIsCustomerTyping(false);

                // If we are looking at this chat, ensure we mark it as read immediately on server?
                // Or rely on selectChat to have done it?
                // Ideally, if window is focused, we read it. For now, let's assume focus.
                socket.emit("agent.read", { chat_id: msg.chat_id });
            }

            // Always refresh assigned list to show new time/preview in sidebar
            // Optimistic update for sidebar
            setAssigned((prev) => {
                const chatIndex = prev.findIndex((c) => c.chat_id === msg.chat_id);
                if (chatIndex === -1) {
                    // If not in assigned list, it might be a new assignment or queue item.
                    // For now, if we get a message for a chat we don't have in assigned, maybe fetchAssigned is safest?
                    fetchAssigned();
                    return prev;
                }

                const chat = prev[chatIndex];
                const updatedChat = {
                    ...chat,
                    last_message_at: msg.createdAt || new Date().toISOString(), // Use msg time or now
                    unread_count: selectedChatIdRef.current === msg.chat_id
                        ? 0 // If open, unread is 0
                        : (chat.unread_count || 0) + 1 // Else increment
                };

                // Move to top
                const newAssigned = [...prev];
                newAssigned.splice(chatIndex, 1);
                return [updatedChat, ...newAssigned];
            });
        });

        socket.on("typing", ({ by, chat_id }) => {
            if (by === 'customer' && chat_id === selectedChatIdRef.current) {
                setIsCustomerTyping(true);
            }
        });

        socket.on("stop_typing", ({ by, chat_id }) => {
            if (by === 'customer' && chat_id === selectedChatIdRef.current) {
                setIsCustomerTyping(false);
            }
        });

        // Initial Data Fetch
        fetchQueue();
        fetchAssigned();

        return () => {
            socket.disconnect();
        };
    }, [agentId]);

    const fetchQueue = async () => {
        // const q = await ChatService.getQueue();
        // setQueue(q);
        if (!agentId) return;

        try {
            const q = await ChatService.getQueue(agentId);
            setQueue(q);
        } catch (error) {
            console.error("Failed to fetch queue", error);
        }
    };

    const fetchAssigned = async () => {
        if (!agentId) return;
        const a = await ChatService.getAssigned(agentId);
        setAssigned(a);
    };

    // --- Actions ---
    const selectChat = async (chat_id: string | null) => {
        if (selectedChatId === chat_id) return;

        setSelectedChatId(chat_id); // Updates state

        if (!chat_id) {
            setMessages([]);
            setIsCustomerTyping(false);
            return;
        }

        // Ref will update via the useEffect above

        setMessages([]);
        setIsCustomerTyping(false);

        setAssigned(prev =>
            prev.map(chat =>
                chat.chat_id === chat_id ? { ...chat, unread_count: 0 } : chat
            )
        );

        socketRef.current?.emit("agent.read", { chat_id });

        try {
            socketRef.current?.emit("join.chat", { chat_id });
            const msgs = await ChatService.getMessages(chat_id);
            setMessages(msgs);
        } catch (error) {
            console.error("Failed to load chat", error);
        }
    };

    const acceptChat = (chat_id: string) => {
        console.log("acceptChat called for:", chat_id, "Agent ID:", agentId);
        if (!agentId) return;

        // Optimistic Update: Remove from queue and add to assigned immediately
        const chatToMove = queue.find(c => c.chat_id === chat_id);
        if (chatToMove) {
            console.log("Found chat in queue, moving optimistically...");
            setQueue(prev => prev.filter(c => c.chat_id !== chat_id));
            setAssigned(prev => {
                // Prevent duplicates
                if (prev.some(c => c.chat_id === chat_id)) return prev;
                // Add to top of assigned list with updated status
                return [{ ...chatToMove, status: 'assigned', agent_id: agentId, unread_count: 0 }, ...prev];
            });
        } else {
            console.warn("Chat not found in queue state:", chat_id);
        }

        socketRef.current?.emit("agent.accept", { chat_id, agent_id: agentId });
        selectChat(chat_id);
    };

    const sendMessage = (text: string, attachment?: { url: string, type: string, name: string }) => {
        // if (!selectedChatId) return;
        if (!selectedChatId || !agentId) return;
        // We do NOT manually add the message to 'messages' state here.
        // We wait for the server to emit 'message.new' to ensure consistency.
        socketRef.current?.emit("message.agent", { chat_id: selectedChatId, text, user_id: agentId, attachment });
    };

    const closeChat = (chat_id: string) => {
        socketRef.current?.emit("chat.close", { chat_id });
        setSelectedChatId(null);
        setMessages([]);
    };

    const sendTyping = () => {
        if (selectedChatId) socketRef.current?.emit("typing", { chat_id: selectedChatId, by: 'agent' });
    };

    const sendStopTyping = () => {
        if (selectedChatId) socketRef.current?.emit("stop_typing", { chat_id: selectedChatId, by: 'agent' });
    };

    return {
        queue,
        assigned,
        selectedChatId,
        selectChat,
        messages,
        acceptChat,
        sendMessage,
        closeChat,
        isCustomerTyping,
        sendTyping,
        sendStopTyping
    };
}

// export const useRatedSessions = () => {
//     return useQuery({
//         queryKey: ["rated-sessions"],
//         queryFn: ChatService.getRatedSessions,
//     });
// };

export const useRatedSessions = (page: number, limit: number, filter: string) => {
    return useQuery({
        queryKey: ["rated-sessions", page, limit, filter],
        queryFn: () => ChatService.getRatedSessions(page, limit, filter),
        placeholderData: keepPreviousData,
    });
};

export const useChatHistory = (chatId: string | null) => {
    return useQuery({
        queryKey: ["chat-history", chatId],
        queryFn: () => ChatService.getMessages(chatId!),
        enabled: !!chatId,
    });
};