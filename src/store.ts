import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Message = {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    timestamp: number;
    isRead: boolean;
};

export type ChatSession = {
    id: string;
    creatorId: string;
    clientId: string;
    clientName: string;
    messages: Message[];
    aiEnabled: boolean;
    lastMessageTimestamp: number;
};

export type CreatorService = {
    enabled: boolean;
    price: number | null;
};

export type CreatorProfile = {
    id: string;
    name: string;
    bio: string;
    location: string;
    views: number;
    status: 'active' | 'inactive';
    aiEnabled: boolean;
    vip: boolean;
    phone: string;
    email: string;
    password?: string;
    mediaImages: string[];
    premiumMedia?: {
        id: string;
        url: string;
        price: number;
    }[];
    imageUrl: string;
    services: {
        meet: CreatorService;
        pic: CreatorService;
        video: CreatorService;
        chat: CreatorService;
    };
    aiPersona?: {
        basePrompt: string;
        customInstructions: string;
    };
};

export type ClientProfile = {
    id: string;
    name: string;
    email: string;
    password?: string; // Optional for security
    balance: number; // For payments
    purchasedMedia: string[]; // IDs of unlocked media
    subscribedCreators: string[]; // IDs of subscribed creators
    status: 'active' | 'suspended';
};

interface AppState {
    // Current logged-in states (mock)
    currentCreatorId: string | null;
    currentClientId: string | null;

    // Data
    creators: CreatorProfile[];
    pendingCreators: Partial<CreatorProfile>[]; // Array for pending registrations
    clients: ClientProfile[];
    chatSessions: ChatSession[];

    // Actions
    loginCreator: (email: string, password?: string) => void;
    registerCreator: (data: Partial<CreatorProfile>) => void;
    approveCreator: (index: number) => void;
    rejectCreator: (index: number) => void;
    logoutCreator: () => void;

    loginClient: (email: string, password?: string) => void;
    registerClient: (data: Partial<ClientProfile>) => void;
    logoutClient: () => void;
    updateClientProfile: (id: string, data: Partial<ClientProfile>) => void;
    updateCreatorProfile: (id: string, data: Partial<CreatorProfile>) => void;
    rechargeWallet: (clientId: string, amount: number) => void;
    subscribeToCreator: (clientId: string, creatorId: string) => void;

    // Chat Actions
    sendMessage: (sessionId: string, senderId: string, receiverId: string, text: string) => void;
    receiveAiMessage: (sessionId: string, creatorId: string, clientId: string) => void;
    toggleAiForSession: (sessionId: string, aiEnabled: boolean) => void;
    markMessagesAsRead: (sessionId: string, readerId: string) => void;
    purchasePremiumMedia: (clientId: string, mediaId: string, price: number) => boolean;
}

// Initial mock data
const MOCK_CREATORS: CreatorProfile[] = [
    {
        id: 'c1',
        name: 'Anna Smith',
        bio: 'Hi, I\'m Anna. I offer exclusive dates and private moments.',
        location: 'Paris, France',
        views: 1200,
        status: 'active',
        aiEnabled: true,
        vip: true,
        phone: '12345678',
        email: 'anna@b2babe.com',
        mediaImages: [
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400',
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400'
        ],
        premiumMedia: [
            {
                id: 'media_1_c1',
                url: 'https://images.unsplash.com/photo-1611042553365-9b101441c135?auto=format&fit=crop&q=80&w=500&h=600',
                price: 15
            },
            {
                id: 'media_2_c1',
                url: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&q=80&w=500&h=600',
                price: 25
            }
        ],
        imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400',
        services: {
            meet: { enabled: true, price: 250 },
            pic: { enabled: true, price: 15 },
            video: { enabled: true, price: 50 },
            chat: { enabled: true, price: 5 }
        },
        aiPersona: {
            basePrompt: "You are Anna, a friendly and flirty 25-year-old girl from Paris. You love fashion, traveling, and good wine.",
            customInstructions: "Always be polite but playful. If they ask to meet, check the price first. Use emojis occasionally."
        }
    },
    {
        id: 'c2',
        name: 'Chloe Paris',
        bio: 'Let\'s create unforgettable memories together.',
        location: 'London, UK',
        views: 450,
        status: 'inactive',
        aiEnabled: false,
        vip: false,
        phone: '87654321',
        email: 'chloe@b2babe.com',
        mediaImages: [],
        imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400',
        services: {
            meet: { enabled: true, price: 300 },
            pic: { enabled: false, price: null },
            video: { enabled: true, price: 100 },
            chat: { enabled: true, price: 10 }
        }
    },
    {
        id: 'c3',
        name: 'Lea Dupont',
        bio: 'Fun, bubbly and ready for adventure.',
        location: 'Berlin, Germany',
        views: 3200,
        status: 'active',
        aiEnabled: true,
        vip: false,
        phone: '11223344',
        email: 'lea@b2babe.com',
        mediaImages: [],
        imageUrl: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&q=80&w=400&h=400',
        services: {
            meet: { enabled: true, price: 200 },
            pic: { enabled: true, price: 10 },
            video: { enabled: false, price: null },
            chat: { enabled: true, price: 5 }
        }
    }
];

const MOCK_CLIENTS: ClientProfile[] = [
    {
        id: 'client_john@example.com',
        name: 'John Doe',
        email: 'john@example.com',
        balance: 500,
        purchasedMedia: [],
        subscribedCreators: [],
        status: 'active'
    }
];

const MOCK_CHATS: ChatSession[] = [
    {
        id: 'session-c1-clientA',
        creatorId: 'c1',
        clientId: 'clientA',
        clientName: 'Client A',
        aiEnabled: true,
        lastMessageTimestamp: Date.now() - 120000,
        messages: [
            { id: 'm1', senderId: 'clientA', receiverId: 'c1', text: 'Hi, are you available this evening?', timestamp: Date.now() - 180000, isRead: true },
            { id: 'm2', senderId: 'c1', receiverId: 'clientA', text: 'Hi! Yes I am, what do you have in mind? (AI automated)', timestamp: Date.now() - 120000, isRead: true }
        ]
    }
];

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentCreatorId: null,
            currentClientId: 'client-guest', // Allow guests by default, but replaceable with loginClient

            creators: MOCK_CREATORS,
            pendingCreators: [],
            clients: MOCK_CLIENTS,
            chatSessions: MOCK_CHATS,

            loginCreator: (email) => set((state) => {
                const creator = (state.creators || []).find(c => c.email === email);
                if (creator) {
                    return { currentCreatorId: creator.id };
                }
                alert("Account not found. Please register first.");
                return {};
            }),

            registerCreator: (data) => set((state) => ({
                pendingCreators: [...(state.pendingCreators || []), data]
            })),

            approveCreator: (index) => set((state) => {
                const pending = state.pendingCreators || [];
                const creatorToApprove = pending[index];
                if (!creatorToApprove) return state;

                const newCreator: CreatorProfile = {
                    id: `c_${Date.now()}`,
                    name: creatorToApprove.name || 'New Creator',
                    bio: creatorToApprove.bio || 'Welcome to my profile!',
                    location: creatorToApprove.location || 'Unknown',
                    views: 0,
                    status: 'active',
                    aiEnabled: true,
                    vip: false,
                    phone: creatorToApprove.phone || '',
                    email: creatorToApprove.email || `creator_${Date.now()}@test.com`,
                    mediaImages: [],
                    imageUrl: creatorToApprove.imageUrl || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400&h=400',
                    services: {
                        meet: { enabled: true, price: 150 },
                        pic: { enabled: false, price: null },
                        video: { enabled: false, price: null },
                        chat: { enabled: true, price: 10 }
                    },
                    aiPersona: {
                        basePrompt: `You are ${creatorToApprove.name || 'a new creator'} on B2Babe.`,
                        customInstructions: "Be friendly, engaging, and encourage clients to unlock media or book a meeting."
                    }
                };

                const newPending = [...pending];
                newPending.splice(index, 1);

                return {
                    creators: [...(state.creators || []), newCreator],
                    pendingCreators: newPending
                };
            }),

            rejectCreator: (index) => set((state) => {
                const newPending = [...(state.pendingCreators || [])];
                newPending.splice(index, 1);
                return { pendingCreators: newPending };
            }),

            logoutCreator: () => set({ currentCreatorId: null }),

            loginClient: (email) => set((state) => {
                const client = (state.clients || []).find(c => c.email === email);
                if (client) {
                    return { currentClientId: client.id };
                }
                alert("Client info not found. Please register first.");
                return {};
            }),

            registerClient: (data) => set((state) => {
                const newClient: ClientProfile = {
                    id: `client_${data.email}`,
                    name: data.name || 'New Client',
                    email: data.email || `client_${Date.now()}@test.com`,
                    balance: 0,
                    purchasedMedia: [],
                    subscribedCreators: [],
                    status: 'active'
                };
                return {
                    clients: [...(state.clients || []), newClient],
                    currentClientId: newClient.id
                };
            }),

            logoutClient: () => set({ currentClientId: 'client-guest' }),

            updateClientProfile: (id, data) => set((state) => ({
                clients: (state.clients || []).map(c => c.id === id ? { ...c, ...data } : c)
            })),

            updateCreatorProfile: (id, data) => set((state) => ({
                creators: (state.creators || []).map(c => c.id === id ? { ...c, ...data } : c)
            })),

            rechargeWallet: (clientId, amount) => set((state) => ({
                clients: (state.clients || []).map(c => c.id === clientId ? {
                    ...c,
                    balance: c.balance + amount
                } : c)
            })),

            subscribeToCreator: (clientId, creatorId) => set((state) => ({
                clients: (state.clients || []).map(c => c.id === clientId ? {
                    ...c,
                    subscribedCreators: [...new Set([...(c.subscribedCreators || []), creatorId])]
                } : c)
            })),

            purchasePremiumMedia: (clientId, mediaId, price) => {
                let success = false;
                set((state) => {
                    const client = (state.clients || []).find(c => c.id === clientId);
                    if (client && client.balance >= price) {
                        if (!client.purchasedMedia.includes(mediaId)) {
                            success = true;
                            return {
                                clients: state.clients.map(c => c.id === clientId ? {
                                    ...c,
                                    balance: c.balance - price,
                                    purchasedMedia: [...c.purchasedMedia, mediaId]
                                } : c)
                            };
                        } else {
                            success = true; // already purchased
                        }
                    }
                    return state;
                });
                return success;
            },

            sendMessage: (sessionId, senderId, receiverId, text) => {
                const timestamp = Date.now();
                const newMessage: Message = {
                    id: `msg_${Date.now()}_${Math.random()}`,
                    senderId,
                    receiverId,
                    text,
                    timestamp,
                    isRead: false
                };

                let triggerAi = false;
                let finalCreatorId = '';
                let finalClientId = '';

                set((state) => {
                    const existingSession = (state.chatSessions || []).find(s => s.id === sessionId);

                    let newSessions: ChatSession[];
                    if (existingSession) {
                        newSessions = (state.chatSessions || []).map(s => {
                            if (s.id === sessionId) {
                                return {
                                    ...s,
                                    messages: [...(s.messages || []), newMessage],
                                    lastMessageTimestamp: timestamp
                                };
                            }
                            return s;
                        });

                        // Check if receiver is a creator and AI is enabled
                        const receiverCreator = (state.creators || []).find(c => c.id === receiverId);
                        if (receiverCreator && existingSession.aiEnabled && receiverCreator.aiEnabled) {
                            triggerAi = true;
                            finalCreatorId = receiverCreator.id;
                            finalClientId = senderId;
                        }

                    } else {
                        // Determine who is the creator by checking our creators list
                        const isSenderCreator = (state.creators || []).some(c => c.id === senderId);

                        // Auto-resolve client name
                        const resolvedClientId = isSenderCreator ? receiverId : senderId;
                        const foundClient = (state.clients || []).find(c => c.id === resolvedClientId);
                        const finalClientName = foundClient ? foundClient.name : 'Guest Client';

                        // Check if receiver is a creator and AI is enabled
                        const receiverCreator = !isSenderCreator ? (state.creators || []).find(c => c.id === receiverId) : null;
                        let defaultAiEnabled = true;
                        if (receiverCreator && receiverCreator.aiEnabled) {
                            triggerAi = true;
                            finalCreatorId = receiverCreator.id;
                            finalClientId = senderId;
                        } else if (!receiverCreator) {
                            defaultAiEnabled = false;
                        }

                        // Create a new session if one doesn't exist
                        const newSession: ChatSession = {
                            id: sessionId,
                            creatorId: isSenderCreator ? senderId : receiverId,
                            clientId: resolvedClientId,
                            clientName: finalClientName,
                            aiEnabled: defaultAiEnabled,
                            lastMessageTimestamp: timestamp,
                            messages: [newMessage]
                        };
                        newSessions = [...(state.chatSessions || []), newSession];
                    }

                    return { chatSessions: newSessions };
                });

                if (triggerAi) {
                    setTimeout(() => {
                        get().receiveAiMessage(sessionId, finalCreatorId, finalClientId);
                    }, 1500);
                }
            },

            receiveAiMessage: (sessionId, creatorId, clientId) => set((state) => {
                const creator = (state.creators || []).find(c => c.id === creatorId);
                if (!creator) return state;

                // Simple mock AI logic based on persona rules
                const promptRules = creator.aiPersona?.customInstructions?.toLowerCase() || '';
                let replyText = "Hi!";

                if (promptRules.includes('flirt')) {
                    replyText = "Hey handsome... I was just thinking about you. 😘";
                } else if (promptRules.includes('price') || promptRules.includes('buy')) {
                    replyText = "I'd love to chat more! You should check out my private pics first. 📸";
                } else {
                    replyText = "I'm a bit busy right now but I got your message! Talk soon! ❤️";
                }

                const aiMessage: Message = {
                    id: `msg_ai_${Date.now()}_${Math.random()}`,
                    senderId: creatorId,
                    receiverId: clientId,
                    text: replyText,
                    timestamp: Date.now(),
                    isRead: false
                };

                return {
                    chatSessions: (state.chatSessions || []).map(s => {
                        if (s.id === sessionId) {
                            return {
                                ...s,
                                messages: [...(s.messages || []), aiMessage],
                                lastMessageTimestamp: aiMessage.timestamp
                            };
                        }
                        return s;
                    })
                };
            }),

            toggleAiForSession: (sessionId, aiEnabled) => set((state) => ({
                chatSessions: (state.chatSessions || []).map(s => s.id === sessionId ? { ...s, aiEnabled } : s)
            })),

            markMessagesAsRead: (sessionId, readerId) => set((state) => ({
                chatSessions: (state.chatSessions || []).map(session => {
                    if (session.id === sessionId) {
                        return {
                            ...session,
                            messages: session.messages.map(m =>
                                (m.receiverId === readerId) ? { ...m, isRead: true } : m
                            )
                        };
                    }
                    return session;
                })
            }))
        }),
        {
            name: 'b2babe-storage',
            version: 5,
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as Record<string, unknown>;
                if (version < 5) {
                    return {
                        ...state,
                        creators: state.creators || MOCK_CREATORS,
                        pendingCreators: state.pendingCreators || [],
                        clients: state.clients || MOCK_CLIENTS,
                        chatSessions: state.chatSessions || MOCK_CHATS
                    } as unknown as AppState;
                }
                return state as unknown as AppState;
            }
        }
    )
);

if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
        if (e.key === 'b2babe-storage' && e.newValue) {
            try {
                const parsed = JSON.parse(e.newValue);
                if (parsed && parsed.state) {
                    useAppStore.setState(parsed.state);
                }
            } catch (err) {
                console.error("Failed to sync state from storage", err);
            }
        }
    });
}
