/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCustomerChat } from "@/hooks/useChatBot";
import Image from "next/image";
import Link from "next/link";
import { ChatService } from "@/services/chatService";


const renderBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
        }
        return part;
    });
};


const ChatMessageContent = ({ msg, onImageClick }: { msg: any, onImageClick: (url: string) => void }) => {
    const { message, attachment_url, attachment_type, file_name } = msg;

    const getFullUrl = (url: string) => {
        if (url?.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`;
    };

    const fullUrl = getFullUrl(attachment_url);

    return (
        <div className="flex flex-col gap-1">
            {attachment_type === 'image' && attachment_url && (
                <div
                    className="mb-1 relative w-full max-w-[200px] h-auto rounded-lg overflow-hidden border border-gray-200">
                    <img
                        src={process.env.NEXT_PUBLIC_API_URL + attachment_url}
                        alt="attachment"
                        className="w-full h-auto object-cover"
                        loading="lazy"
                        onClick={() => onImageClick(fullUrl)}
                    />
                </div>
            )}

            {attachment_type === 'document' && attachment_url && (
                <a
                    href={process.env.NEXT_PUBLIC_API_URL + attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-black/5 rounded-lg hover:bg-black/10 transition mb-1 no-underline"
                >
                    <div className="w-8 h-8 bg-red-100 text-red-500 rounded flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            viewBox="0 0 16 16">
                            <path
                                d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z" />
                        </svg>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span
                            className="text-xs font-medium truncate max-w-[150px] text-gray-700">{file_name || "Document"}</span>
                        <span className="text-[10px] text-gray-500 uppercase">Download</span>
                    </div>
                </a>
            )}

            {message && (
                <div className="whitespace-pre-wrap overflow-wrap-anywhere">
                    {renderBold(message)}
                </div>
            )}
        </div>
    );
};

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
        <path
            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
        <path
            d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
    </svg>
);

const StarIcon = ({ filled, onClick }: { filled: boolean; onClick: () => void }) => (
    <svg
        onClick={onClick}
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill={filled ? "#FFD700" : "#E0E0E0"}
        viewBox="0 0 16 16"
        style={{ cursor: "pointer", transition: "fill 0.2s" }}
    >
        <path
            d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
    </svg>
);

const AttachIcon = () => (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);


const ImageLightbox = ({ src, onClose }: { src: string, onClose: () => void }) => {
    return (
        <div
            className="fixed inset-0 z-[100000] bg-black/90 flex flex-col items-center justify-center p-4 animate-fadeIn">
            <button onClick={onClose}
                className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition">
                <CloseIcon />
            </button>
            <img src={src} alt="Full Preview" className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl" />
            <a
                href={src}
                download
                target="_blank"
                className="mt-4 px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition"
            >
                Download Original
            </a>
        </div>
    );
};


const ActionButtons = ({ action, onRegister, onAgent }: {
    action: string,
    onRegister: () => void,
    onAgent: () => void
}) => {
    if (action === 'offer_register') {
        return (
            <button
                onClick={onRegister}
                style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#DB2727',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 5px rgba(219, 39, 39, 0.3)'
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path
                        d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z" />
                </svg>
                Register to View Inventory
            </button>
        );
    }

    if (action === 'offer_agent') {
        return (
            <button
                onClick={onAgent}
                style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#ffffff',
                    color: '#DB2727',
                    border: '1px solid #DB2727',
                    borderRadius: '20px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path
                        d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                </svg>
                Chat with Live Agent
            </button>
        );
    }
    return null;
};


export default function ChatLauncher() {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<'type' | 'register' | 'otp' | 'chat'>('type');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    const [formData, setFormData] = useState({ name: "", mobile: "" });

    const [otp, setOtp] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("");
    const [verifiedName, setVerifiedName] = useState("");
    const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);
    const [authError, setAuthError] = useState("");

    const [selectedType, setSelectedType] = useState<'guest' | 'registered'>('guest');

    const agentImageUrl = "https://placehold.co/80x80/3B82F6/FFFFFF?text=A";

    const [inputMode, setInputMode] = useState<'direct'>('direct');

    const {
        chatId,
        startChatMutation,
        messages,
        sendMessage,
        askForAgent,
        typing,
        closeSession,
        showRating,
        submitRating,
        sendTyping,
        sendStopTyping,
        isChatStarting,
        upgradeSessionMutation,
        connectionStatus
    } = useCustomerChat();

    const [input, setInput] = useState("");

    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (open && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open, typing]);

    useEffect(() => {
        if (chatId) {
            setView('chat')
        }
    }, [chatId]);

    const handleOpen = () => {
        setOpen(true);
        if (!chatId) {
            handleTypeSelect('guest');
        }
    }

    const handleTypeSelect = (type: 'guest' | 'registered') => {
        // setSelectedType(type);
        if (type === 'registered') {
            setView('register');
            setAuthError("");
        } else {
            startChatMutation.mutate({
                channel: "web",
                userType: 'guest'
            });
            // setView('chat');
        }
    }

    const handleVerifyCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingAuth(true);
        setAuthError("");

        try {
            const res = await ChatService.verifyCustomer(formData.mobile);

            setMaskedEmail(res.email);
            setVerifiedName(res.customer_name);

            if (res.customer_name) setFormData(prev => ({ ...prev, name: res.customer_name }));

            setView('otp');
        } catch (error: any) {
            console.error(error);
            setAuthError(error.response?.data?.message || "Verification failed");
        } finally {
            setIsLoadingAuth(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingAuth(true);
        setAuthError("");

        try {
            await ChatService.validateOtp(formData.mobile, otp);

            if (chatId) {
                await upgradeSessionMutation.mutateAsync({
                    chatId: chatId,
                    name: verifiedName || formData.name,
                    mobile: formData.mobile
                });

                setView('chat');
            } else {
                startChatMutation.mutate({
                    channel: "Web",
                    userType: 'registered',
                    name: verifiedName || formData.name,
                    mobile: formData.mobile,
                });
            }

            // startChatMutation.mutate({
            //     lang: language,
            //     channel: "Web",
            //     userType: 'registered',
            //     name: verifiedName || formData.name,
            //     mobile: formData.mobile,
            // })

        } catch (error: any) {
            console.error(error);
            setAuthError(error.response?.data?.message || "Invalid OTP.");
        } finally {
            setIsLoadingAuth(false);
        }
    };


    const handleRegisterClickInChat = () => {
        setSelectedType('registered');
        setView('register');
    };


    const handleBack = () => {
        setAuthError("");
        if (view === 'otp') setView('register');
        // else if (view === 'register') setView('type');
        else if (view === 'register') {
            if (chatId) {
                setView('chat');
            } else {
                setView('type');
            }
        }
        // else if (view === 'type') setView('language');
    };

    const handleClose = () => {
        if (!chatId || showRating) {
            setOpen(false);
            if (showRating) setView('type');
            setInput("");
            setFormData({ name: "", mobile: "" });
        } else {
            // Active chat -> End Session
            closeSession();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        sendTyping();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendStopTyping();
        }, 1500);
    };



    const handleAttachClick = () => {
        fileInputRef.current?.click();
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large (Max 5MB)");
            return;
        }

        setIsUploading(true);

        try {
            const data = await ChatService.uploadFile(file);

            const type = file.type.startsWith("image/") ? "image" : "document";

            sendMessage("", {
                url: data.url,
                type: type,
                name: data.filename
            });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSend = (e: any) => {
        e.preventDefault();

        if (!input.trim() || isChatStarting) return;
        sendMessage(input);
        setInput("");



        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        sendStopTyping();
    };

    const handleSubmitRating = async () => {
        await submitRating(rating, feedback);
        setRating(0);
        setFeedback("");
        setOpen(false);
    }

    return (
        <div style={{ fontFamily: '"Poppins", sans-serif' }}>

            {lightboxUrl && <ImageLightbox src={lightboxUrl} onClose={() => setLightboxUrl(null)} />}

            {!open && (
                <button onClick={handleOpen} style={styles.launcherButton}>
                    <Image src="/agent.png" alt="Chat" width={30} height={30} style={{ margin: 'auto' }} />
                    <span style={styles.statusBadge}></span>
                </button>
            )}

            {open && (
                <div style={styles.chatWindow}>
                    <div style={styles.header}>
                        <div style={styles.headerInfo}>

                            {!chatId && (
                                <button onClick={handleBack} style={{ ...styles.closeButton, marginRight: 8 }}>
                                    <span style={{ fontSize: 18 }}>←</span>
                                </button>
                            )}

                            <div style={styles.agentImageContainer}>
                                <Image src="/agent.png" alt="Agent" width={45} height={45} />
                                <span style={styles.onlineIndicator}></span>
                            </div>
                            <div style={styles.headerText}>
                                <p style={styles.headerTitle}>Harbour Lane Assistant</p>
                                <span style={styles.headerSubtitle}>
                                    {showRating ? "Chat Ended" :
                                        connectionStatus === 'connecting' ? "Connecting to live agent..." :
                                            connectionStatus === 'connected' ? "Live Agent Connected" : "Online"}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleClose}
                            style={styles.closeButton}
                            title={showRating ? "Close" : "End Chat"}
                        >
                            <CloseIcon />
                        </button>

                    </div>

                    {/*{!chatId && view === 'type' && (
                        <div style={styles.languageContainer}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <img src={agentImageUrl} width={60} height={60} alt="Logo"
                                    style={{ margin: '0 auto 10px', borderRadius: '50%' }} />
                                <h3 style={{ color: '#333', fontWeight: 600 }}>Select Account Type</h3>
                            </div>
                            <div style={styles.langGrid}>
                                <button onClick={() => handleTypeSelect('guest')} style={styles.langButton}>
                                    Guest User <br /> <span
                                        style={{ fontSize: 10, color: '#888' }}>General Info Only</span>
                                </button>
                                <button onClick={() => handleTypeSelect('registered')} style={styles.langButton}>
                                    Registered User <br /> <span style={{ fontSize: 10, color: '#888' }}>Check Inventory & Prices</span>
                                </button>
                            </div>
                        </div>
                    )}*/}

                    {view === 'register' && (
                        <div style={styles.languageContainer}>
                            <h3 style={{
                                color: '#333',
                                fontWeight: 600,
                                marginBottom: 20,
                                textAlign: 'center'
                            }}>Registered User Login</h3>
                            <p style={{ fontSize: 12, color: '#666', marginBottom: 20, textAlign: 'center' }}>
                                Enter your details to verify your account.
                            </p>
                            <form onSubmit={handleVerifyCustomer}
                                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 15 }}>
                                <input
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={styles.inputSecondary}
                                />
                                <input
                                    placeholder="Mobile Number (e.g. 0771234567)"
                                    value={formData.mobile}
                                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                    style={styles.inputSecondary}
                                    required
                                />
                                {authError &&
                                    <p style={{ color: 'red', fontSize: 11, textAlign: 'center' }}>{authError}</p>}

                                <button type="submit" style={{ ...styles.submitRatingButton, width: '100%' }}
                                    disabled={isLoadingAuth}>
                                    {isLoadingAuth ? "Verifying..." : "Verify & Continue"}
                                </button>
                            </form>
                        </div>
                    )}

                    {view === 'otp' && (
                        <div style={styles.languageContainer}>
                            <h3 style={{ color: '#333', fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>
                                Enter OTP
                            </h3>
                            <p style={{ fontSize: 12, color: '#666', marginBottom: 20, textAlign: 'center' }}>
                                We sent a code to <b>{maskedEmail}</b>
                            </p>

                            <form onSubmit={handleOtpSubmit}
                                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 15 }}>
                                <input
                                    placeholder="6-Digit Code"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    style={{
                                        ...styles.inputSecondary,
                                        textAlign: 'center',
                                        letterSpacing: 2,
                                        fontSize: 18
                                    }}
                                    maxLength={6}
                                    required
                                />
                                {authError &&
                                    <p style={{ color: 'red', fontSize: 11, textAlign: 'center' }}>{authError}</p>}

                                <button type="submit" style={{ ...styles.submitRatingButton, width: '100%' }}
                                    disabled={isLoadingAuth || isChatStarting}>
                                    {isLoadingAuth || isChatStarting ? "Validating..." : "Confirm & Chat"}
                                </button>
                            </form>
                        </div>
                    )}

                    {(chatId || showRating || isChatStarting) && view === 'chat' && (
                        <>
                            {isChatStarting ? (
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    backgroundColor: '#fff'
                                }}>
                                    <div style={{
                                        width: 30,
                                        height: 30,
                                        border: '3px solid #f3f3f3',
                                        borderTop: '3px solid #DB2727',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    <p style={{ marginTop: 10, color: '#666', fontSize: 12 }}>Connecting...</p>
                                    <style>{`@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}`}</style>
                                </div>
                            ) : (

                                showRating ? (
                                    <div style={styles.ratingContainer}>
                                        <Image src="/agent.png" width={80} height={80} alt="Agent"
                                            style={{ borderRadius: '50%', marginBottom: '20px' }} />
                                        <h3 style={{
                                            color: '#333',
                                            marginBottom: '10px',
                                            fontSize: '18px',
                                            fontWeight: 600
                                        }}>How
                                            was
                                            your experience?</h3>
                                        <p style={{
                                            color: '#777',
                                            fontSize: '13px',
                                            marginBottom: '20px',
                                            textAlign: 'center'
                                        }}>
                                            Please rate the service provided by our agent.
                                        </p>

                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '25px' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <StarIcon
                                                    key={star}
                                                    filled={star <= rating}
                                                    onClick={() => setRating(star)}
                                                />
                                            ))}
                                        </div>
                                        <textarea
                                            placeholder="Optional feedback..."
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            style={styles.feedbackInput}
                                        />

                                        <button onClick={handleSubmitRating} style={styles.submitRatingButton}>
                                            Submit Feedback
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div style={styles.body}>
                                            {messages.length === 0 && (
                                                <div style={styles.botMessageContainer}>
                                                    <Image src="/agent.png" width={30} height={30} alt="Bot"
                                                        style={styles.botAvatar} />
                                                    <div style={styles.messageWrapper}>
                                                        <span style={styles.botName}>Harbour Lane Assistant</span>
                                                        <div style={styles.botBubble}>
                                                            Hello! Welcome to Harbour Lane. How can I help you today?
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {messages.map((m: any, i: number) => {
                                                if (m.sender === "system") {
                                                    return (
                                                        <div key={i} style={styles.systemMessageContainer}>
                                                            <span style={styles.systemMessage}>
                                                                {m.message}
                                                            </span>
                                                        </div>
                                                    )
                                                }

                                                return (
                                                    <div key={i} style={{
                                                        display: 'flex',
                                                        flexDirection: m.sender === "customer" ? 'row-reverse' : 'row',
                                                        marginBottom: '15px',
                                                        alignItems: 'flex-end'
                                                    }}>
                                                        {m.sender !== "customer" && (
                                                            <Image src="/agent.png" width={30} height={30} alt="Bot"
                                                                style={styles.botAvatar} />
                                                        )}

                                                        <div
                                                            style={m.sender === "customer" ? styles.userMessageWrapper : styles.messageWrapper}>
                                                            {m.sender !== "customer" && (
                                                                <span style={styles.botName}>Harbour Lane Assistant</span>
                                                            )}
                                                            <div
                                                                style={m.sender === "customer" ? styles.userBubble : styles.botBubble}>

                                                                <ChatMessageContent msg={m}
                                                                    onImageClick={setLightboxUrl} />

                                                                <div style={{
                                                                    ...styles.timestamp,
                                                                    textAlign: m.sender === "customer" ? 'right' : 'left',
                                                                    color: m.sender === "customer" ? '#888' : 'rgba(255,255,255,0.8)'
                                                                }}>
                                                                    {new Date(m.createdAt).toLocaleTimeString([], { timeStyle: 'short' })}
                                                                </div>
                                                            </div>

                                                            {m.sender === 'bot' && m.action && (
                                                                <ActionButtons
                                                                    action={m.action}
                                                                    onRegister={handleRegisterClickInChat}
                                                                    onAgent={askForAgent}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}

                                            {typing && (
                                                <div style={styles.botMessageContainer}>
                                                    <Image src="/agent.png" width={30} height={30} alt="Bot"
                                                        style={styles.botAvatar} />
                                                    <div style={styles.messageWrapper}>
                                                        <div style={{ ...styles.botBubble, fontStyle: 'italic' }}>
                                                            Typing...
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>



                                        <form onSubmit={handleSend} style={styles.footer}>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                style={{ display: 'none' }}
                                                onChange={handleFileChange}
                                                accept="image/*,.pdf,.doc,.docx,.txt"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAttachClick}
                                                disabled={isUploading}
                                                className="p-2 hover:bg-gray-200 rounded-full transition text-gray-500"
                                            >
                                                {isUploading ? (
                                                    <div
                                                        className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                                                ) : (
                                                    <AttachIcon />
                                                )}
                                            </button>

                                            <div
                                                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <div style={styles.inputContainer}>
                                                    <input value={input} onChange={handleInputChange} type="text"
                                                        placeholder="Write message..."
                                                        style={styles.input}
                                                    />
                                                </div>
                                            </div>
                                            <button type="submit" style={styles.sendButton} disabled={isChatStarting}>
                                                <SendIcon /></button>
                                        </form>

                                    </>
                                )
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    launcherButton: {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: "#fff",
        border: "2px solid #DB2727",
        cursor: "pointer",
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
    },
    statusBadge: {
        position: "absolute",
        bottom: "0",
        right: "0",
        width: "14px",
        height: "14px",
        backgroundColor: "#05e905",
        borderRadius: "50%",
        border: "2px solid #fff"
    },
    chatWindow: {
        position: "fixed",
        bottom: "10px",
        right: "10px",
        width: "360px",
        height: "550px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 5px 25px rgba(0,0,0,0.2)",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif"
    },
    header: {
        backgroundColor: "#DB2727",
        padding: "12px 15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
    },
    headerInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    agentImageContainer: { position: 'relative', display: 'flex' },
    onlineIndicator: {
        position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px',
        backgroundColor: '#05e905', borderRadius: '50%', border: '1px solid #fff'
    },
    headerText: { display: 'flex', flexDirection: 'column', lineHeight: '1.2' },
    headerTitle: { margin: 0, color: '#fff', fontWeight: 600, fontSize: '16px' },
    headerSubtitle: { margin: 0, color: '#fff', fontWeight: 300, fontSize: '11px' },
    closeButton: {
        background: "transparent",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        display: 'flex',
        alignItems: 'center'
    },
    body: {
        flex: 1, padding: "15px", overflowY: "auto", backgroundColor: "#fff", display: 'flex', flexDirection: 'column'
    },


    ratingContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        backgroundColor: '#fff',
        animation: 'fadeIn 0.3s ease'
    },
    feedbackInput: {
        width: '100%',
        height: '80px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontFamily: "'Poppins', sans-serif",
        marginBottom: '20px',
        outlineColor: '#DB2727',
        resize: 'none'
    },
    submitRatingButton: {
        backgroundColor: '#DB2727',
        color: '#fff',
        border: 'none',
        borderRadius: '25px',
        padding: '10px 30px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(219, 39, 39, 0.3)'
    },

    systemMessageContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '15px',
        marginTop: '5px'
    },
    systemMessage: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeeba',
        padding: '4px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        textAlign: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },

    botMessageContainer: { display: 'flex', alignItems: 'flex-end', marginBottom: '15px' },
    botAvatar: { borderRadius: '50%', marginRight: '10px', marginBottom: '5px' },
    messageWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '75%' },
    botName: { fontSize: '10px', color: '#BFBFBF', marginLeft: '2px', marginBottom: '2px' },
    botBubble: {
        backgroundColor: "#DB2727", color: "#fff", padding: "10px 14px", borderRadius: "12px",
        borderTopLeftRadius: "0px", fontSize: "12px", lineHeight: "1.5",
        wordBreak: "normal",
        overflowWrap: "anywhere",
        maxWidth: "100%"
    },
    userMessageWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '75%' },
    userBubble: {
        backgroundColor: "#F4F9FF", color: "#595E62", padding: "10px 14px", borderRadius: "12px",
        borderBottomRightRadius: "0px", fontSize: "12px", textAlign: "left", lineHeight: "1.5",
        wordBreak: "normal",
        overflowWrap: "anywhere",
        maxWidth: "100%"
    },
    timestamp: { display: 'block', fontSize: '9px', marginTop: '4px' },
    liveAgentButton: {
        width: '100%', backgroundColor: '#fff', border: '1px solid #DB2727', color: '#DB2727',
        padding: '8px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer',
        marginBottom: '10px', transition: 'all 0.2s'
    },
    footer: {
        padding: "10px", borderTop: "1px solid #e0e0e0", display: "flex", gap: "10px",
        alignItems: "center", backgroundColor: '#fff'
    },

    inputContainer: { width: '100%' },
    inputContainerSecondary: { width: '100%' },

    input: {
        width: '100%',
        border: "none",
        outline: "none",
        fontSize: "12px",
        padding: "8px",
        color: "#595E62",
        fontFamily: "'Poppins', sans-serif",
        background: 'transparent'
    },

    inputConverted: {
        width: '100%',
        border: "none",
        outline: "none",
        fontSize: "14px",
        padding: "8px",
        color: "#000",
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600,
        background: '#f0f2f5',
        borderRadius: '5px'
    },
    inputSecondary: {
        width: '100%',
        border: "1px solid #ddd",
        borderRadius: '5px',
        outline: "none",
        fontSize: "12px",
        padding: "8px",
        color: "#595E62",
        fontFamily: "'Poppins', sans-serif"
    },

    sendButton: {
        background: "transparent", border: "1px solid #DB2727", color: "#DB2727", width: "35px", height: "35px",
        borderRadius: "50%", display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: "pointer"
    },

    languageContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '30px',
        backgroundColor: '#fff',
    },
    langGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    langButton: {
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        backgroundColor: '#f9f9f9',
        color: '#333',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'center',
        fontSize: '14px'
    },
};