import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChatService } from "@/services/chatService";

export function useCustomerChat() {
    const socketRef = useRef<Socket | null>(null);

    const [chatId, setChatId] = useState<string | null>(
        typeof window !== "undefined" ? localStorage.getItem("chat_id") : null
    );

    const [messages, setMessages] = useState<any[]>([]);
    const [typing, setTyping] = useState(false);
    const [showRating, setShowRating] = useState(false);

    // New State: Track status
    const [connectionStatus, setConnectionStatus] = useState<"bot" | "connecting" | "connected">("bot");
    const isAgentActive = connectionStatus === 'connected';

    const startChatMutation = useMutation({
        // mutationFn: () => ChatService.startChat("Web"),
        mutationFn: (variables: { channel: string, userType: string, name?: string, mobile?: string }) =>
            ChatService.startChat(variables.channel, variables.userType, variables.name, variables.mobile),
        onSuccess: (data) => {
            setChatId(data.chat_id);
            localStorage.setItem("chat_id", data.chat_id);
            // If restoring a session, check if already assigned (logic depends on your API response)
            if (data.status === 'assigned') {
                setConnectionStatus("connected");
            } else if (data.status === 'queued') {
                setConnectionStatus("connecting");
            }
        },
    });

    // fetch messages
    const messagesQuery = useQuery({
        queryKey: ["chat-messages", chatId],
        queryFn: () => ChatService.getMessages(chatId!),
        enabled: !!chatId,
    });

    useEffect(() => {
        if (messagesQuery.data && messagesQuery.data.length > 0) {
            setMessages(messagesQuery.data);

            const firstMsg = messagesQuery.data[0];
            const sessionStatus = firstMsg.session?.status; // Check recent session status if available

            if (sessionStatus === 'assigned') {
                setConnectionStatus("connected");
            } else if (sessionStatus === 'queued') {
                setConnectionStatus("connecting");
            }
        }
    }, [messagesQuery.data]);


    // socket connection
    useEffect(() => {
        if (!chatId) return;

        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
            // path: "/node/socket.io/",
            transports: ["websocket"],
            query: { role: "customer", chat_id: chatId }
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Socket Connected, joining room:", chatId);
            socket.emit("join.customer", { chat_id: chatId });
        });

        socket.on("message.new", (msg) => {
            setMessages((prev) => {
                // Prevent duplicates
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        });

        socket.on("typing", ({ by }) => {
            if (by === 'bot' || by === 'agent') {
                setTyping(true);
            }
        })

        socket.on("stop_typing", ({ by }) => {
            if (by === 'bot' || by === 'agent') {
                setTyping(false);
            }
        });

        // --- NEW LISTENER: Handle Agent Joining ---
        socket.on("agent.joined", () => {
            setConnectionStatus("connected");
            setTyping(false);
            // Inject a local system message
            setMessages((prev) => [
                ...prev,
                {
                    id: "sys-" + Date.now(),
                    sender: "system",
                    message: "A live agent has joined the chat",
                    createdAt: new Date().toISOString()
                }
            ]);
        });

        // --- NEW LISTENER: Handle Handoff ---
        socket.on("agent.handoff", ({ message }) => {
            setConnectionStatus("connecting");
        });

        socket.on("chat.closed", () => {
            setShowRating(true);
            setConnectionStatus("bot");
        });

        return () => {
            socket.disconnect()
        };
    }, [chatId]);


    useEffect(() => {
        if (messagesQuery.data) {
            setMessages(messagesQuery.data);
            // Optional: If your API returns the chat status in the message list or separate query,
            // you should set setIsAgentActive(true) here if the chat is already assigned.

            const session = messagesQuery.data[0]?.session;
            if (session?.status === 'assigned') {
                setConnectionStatus("connected");
            } else if (session?.status === 'queued') {
                setConnectionStatus("connecting");
            }
        }
    }, [messagesQuery.data]);


    // const sendMessage = (text: string) => {
    //     socketRef.current?.emit("message.customer", {chat_id: chatId, text});
    // };

    // const sendMessage = (text: string) => {
    //     if (!chatId) return;
    //     socketRef.current?.emit("message.customer", {chat_id: chatId, text});
    // };

    const sendMessage = (text: string, attachment?: { url: string, type: string, name: string }) => {
        if (!chatId) return;
        socketRef.current?.emit("message.customer", {
            chat_id: chatId,
            text,
            attachment
        });
    };


    // const askForAgent = () => {
    //     socketRef.current?.emit("request.agent", {chat_id: chatId, priority: 0});
    //     // Optional: You can add a temporary system message here saying "Waiting for agent..."
    // };

    const askForAgent = () => {
        if (!chatId) return;
        socketRef.current?.emit("request.agent", { chat_id: chatId, priority: 0 });
        setConnectionStatus("connecting");
        setMessages((prev) => [
            ...prev,
            {
                id: "sys-" + Date.now(),
                sender: "system",
                message: "Connecting you to a live agent...",
                createdAt: new Date().toISOString()
            }
        ]);
    };

    // const closeSession = () => {
    //     socketRef.current?.emit("chat.close", {chat_id: chatId});
    // };

    const closeSession = () => {
        if (!chatId) return;
        socketRef.current?.emit("chat.close", { chat_id: chatId });
    };

    const submitRating = async (rating: number, message?: string) => {
        if (!chatId) return;
        await ChatService.rateAgent(chatId, rating, message);
        setShowRating(false);
        localStorage.removeItem("chat_id");
        setChatId(null);
        setMessages([]);
        setConnectionStatus("bot");
    };

    const sendTyping = () => {
        if (chatId) socketRef.current?.emit("typing", { chat_id: chatId, by: 'customer' });
    };

    const sendStopTyping = () => {
        if (chatId) socketRef.current?.emit("stop_typing", { chat_id: chatId, by: 'customer' });
    };


    const upgradeSessionMutation = useMutation({
        mutationFn: (variables: { chatId: string, name: string, mobile: string }) =>
            ChatService.upgradeSession(variables.chatId, variables.name, variables.mobile),
        onSuccess: (data) => {
            // Optimistically update any local state if needed, or refetch
            // Usually just succeeding is enough, the socket remains connected
        },
    });


    return {
        chatId,
        startChatMutation,
        messages,
        sendMessage,
        askForAgent,
        typing,
        closeSession,
        showRating,
        submitRating,
        isAgentActive, // Return this to the UI
        connectionStatus, // Expose connection status
        sendTyping,       // Expose functions
        sendStopTyping,
        isChatStarting: startChatMutation.isPending,
        upgradeSessionMutation
    };
}