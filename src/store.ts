import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from './api';

const safeLocalStorage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("Could not read from localStorage:", e);
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error("Storage quota exceeded. Data may not be fully cached in browser:", e);
        }
    },
    removeItem: (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn("Could not remove from localStorage:", e);
        }
    }
};

// Configure your myPOS PayLinks here
export const MYPOS_PAYLINKS: Record<number, string> = {
    20: "https://www.mypos.com/paylink/checkout/YOUR_LINK_HERE_20",
    50: "https://www.mypos.com/paylink/checkout/YOUR_LINK_HERE_50",
    100: "https://www.mypos.com/paylink/checkout/YOUR_LINK_HERE_100",
    250: "https://www.mypos.com/paylink/checkout/YOUR_LINK_HERE_250"
};

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
    age?: number;
    height?: string;
    weight?: string;
    measurements?: string;
    hairColor?: string;
    eyeColor?: string;
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
    password?: string;
    balance: number;
    purchasedMedia: string[];
    subscribedCreators: string[];
    status: 'active' | 'suspended';
};

interface AppState {
    // Current logged-in states
    currentCreatorId: string | null;
    currentClientId: string | null;

    // Super Admin Authentication
    isAdminAuthenticated: boolean;
    adminPassword?: string;
    loginAdmin: (password: string) => boolean;
    logoutAdmin: () => void;
    setAdminPassword: (newPassword: string) => void;

    // Data
    creators: CreatorProfile[];
    pendingCreators: Partial<CreatorProfile>[];
    clients: ClientProfile[];
    chatSessions: ChatSession[];

    // Actions
    loginCreator: (email: string, password?: string) => boolean;
    registerCreator: (data: Partial<CreatorProfile>) => void;
    approveCreator: (index: number) => void;
    rejectCreator: (index: number) => void;
    logoutCreator: () => void;

    loginClient: (email: string, password?: string) => boolean;
    registerClient: (data: Partial<ClientProfile>) => void;
    logoutClient: () => void;
    updateClientProfile: (id: string, data: Partial<ClientProfile>) => void;
    updateCreatorProfile: (id: string, data: Partial<CreatorProfile>) => void;
    addCreatorProfile: (data: Partial<CreatorProfile>) => CreatorProfile;
    deleteCreatorProfile: (id: string) => void;
    rechargeWallet: (clientId: string, amount: number) => void;
    subscribeToCreator: (clientId: string, creatorId: string) => void;
    initSync: () => Promise<void>;

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
        password: 'b2babe123',
        age: 25,
        height: '172 cm',
        weight: '53 kg',
        measurements: '90-61-90',
        hairColor: 'Brunette',
        eyeColor: 'Hazel',
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
            meet: { enabled: false, price: null },
            pic: { enabled: true, price: 15 },
            video: { enabled: true, price: 50 },
            chat: { enabled: true, price: 5 }
        },
        aiPersona: {
            basePrompt: "You are Anna, a friendly and flirty 25-year-old girl from Paris. You love fashion, traveling, and good wine.",
            customInstructions: "Always be polite but playful. Always redirect them to buy private pics or chat. Use emojis occasionally."
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
        password: 'b2babe123',
        age: 23,
        height: '168 cm',
        weight: '50 kg',
        measurements: '88-59-89',
        hairColor: 'Blonde',
        eyeColor: 'Blue',
        mediaImages: [],
        imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400',
        services: {
            meet: { enabled: false, price: null },
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
        password: 'b2babe123',
        age: 26,
        height: '175 cm',
        weight: '56 kg',
        measurements: '92-62-92',
        hairColor: 'Auburn',
        eyeColor: 'Green',
        mediaImages: [],
        imageUrl: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&q=80&w=400&h=400',
        services: {
            meet: { enabled: false, price: null },
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
        password: 'b2babe123',
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

            // Super Admin Authentication
            isAdminAuthenticated: false,
            adminPassword: 'admin2026',
            loginAdmin: (password) => {
                const currentPass = get().adminPassword || 'admin2026';
                if (password === currentPass) {
                    set({ isAdminAuthenticated: true });
                    return true;
                }
                alert("Incorrect Super Admin password. Please try again.");
                return false;
            },
            logoutAdmin: () => set({ isAdminAuthenticated: false }),
            setAdminPassword: (newPassword) => {
                set({ adminPassword: newPassword });
                api.setAdminPassword(newPassword);
            },

            creators: MOCK_CREATORS,
            pendingCreators: [],
            clients: MOCK_CLIENTS,
            chatSessions: MOCK_CHATS,

            loginCreator: (email, password) => {
                const state = get();
                const creator = (state.creators || []).find(c => c.email.trim().toLowerCase() === email.trim().toLowerCase());
                if (!creator) {
                    alert("Creator account not found. Please check your email or register.");
                    return false;
                }
                const expectedPassword = creator.password || 'b2babe123';
                if (!password || password !== expectedPassword) {
                    alert("Incorrect password. Please try again.");
                    return false;
                }
                set({ currentCreatorId: creator.id });
                return true;
            },

            registerCreator: (data) => set((state) => ({
                pendingCreators: [...(state.pendingCreators || []), {
                    ...data,
                    password: data.password || 'b2babe123'
                }]
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
                    password: creatorToApprove.password || 'b2babe123',
                    age: creatorToApprove.age || 24,
                    height: creatorToApprove.height || '170 cm',
                    weight: creatorToApprove.weight || '54 kg',
                    measurements: creatorToApprove.measurements || '90-60-90',
                    hairColor: creatorToApprove.hairColor || 'Brunette',
                    eyeColor: creatorToApprove.eyeColor || 'Brown',
                    mediaImages: [],
                    imageUrl: creatorToApprove.imageUrl || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400&h=400',
                    services: {
                        meet: { enabled: false, price: null },
                        pic: { enabled: false, price: null },
                        video: { enabled: false, price: null },
                        chat: { enabled: true, price: 10 }
                    },
                    aiPersona: {
                        basePrompt: `You are ${creatorToApprove.name || 'a new creator'} on B2Babe.`,
                        customInstructions: "Be friendly, engaging, and encourage clients to unlock media or chat."
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

            loginClient: (email, password) => {
                const state = get();
                const client = (state.clients || []).find(c => c.email.trim().toLowerCase() === email.trim().toLowerCase());
                if (!client) {
                    alert("Client account not found. Please register first.");
                    return false;
                }
                const expectedPassword = client.password || 'b2babe123';
                if (!password || password !== expectedPassword) {
                    alert("Incorrect password. Please try again.");
                    return false;
                }
                set({ currentClientId: client.id });
                return true;
            },

            registerClient: (data) => set((state) => {
                const newClient: ClientProfile = {
                    id: `client_${data.email}`,
                    name: data.name || 'New Client',
                    email: data.email || `client_${Date.now()}@test.com`,
                    password: data.password || 'b2babe123',
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

            initSync: async () => {
                const data = await api.getSync();
                if (data) {
                    set((state) => ({
                        creators: data.creators && data.creators.length > 0 ? data.creators : state.creators,
                        clients: data.clients && data.clients.length > 0 ? data.clients : state.clients,
                        chatSessions: data.chatSessions && data.chatSessions.length > 0 ? data.chatSessions : state.chatSessions,
                        adminPassword: data.adminPassword || state.adminPassword
                    }));
                }
            },

            updateClientProfile: (id, data) => {
                set((state) => ({
                    clients: (state.clients || []).map(c => c.id === id ? { ...c, ...data } : c)
                }));
                api.updateClient(id, data);
            },

            updateCreatorProfile: (id, data) => {
                set((state) => ({
                    creators: (state.creators || []).map(c => c.id === id ? { ...c, ...data } : c)
                }));
                api.updateCreator(id, data);
            },

            addCreatorProfile: (data) => {
                const newCreator: CreatorProfile = {
                    id: data.id || `c_${Date.now()}`,
                    name: data.name || 'New Model',
                    bio: data.bio || 'Welcome to my profile!',
                    location: data.location || 'Paris, France',
                    views: 0,
                    status: data.status || 'active',
                    aiEnabled: data.aiEnabled ?? true,
                    vip: false,
                    phone: data.phone || '',
                    email: data.email || `model_${Date.now()}@b2babe.com`,
                    password: data.password || 'b2babe123',
                    age: data.age || 24,
                    height: data.height || '170 cm',
                    weight: data.weight || '54 kg',
                    measurements: data.measurements || '90-60-90',
                    hairColor: data.hairColor || 'Brunette',
                    eyeColor: data.eyeColor || 'Brown',
                    mediaImages: data.mediaImages || [],
                    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400',
                    services: data.services || {
                        meet: { enabled: false, price: null },
                        pic: { enabled: true, price: 15 },
                        video: { enabled: true, price: 50 },
                        chat: { enabled: true, price: 5 }
                    },
                    aiPersona: data.aiPersona || {
                        basePrompt: `You are ${data.name || 'a creator'} on B2Babe.`,
                        customInstructions: "Be friendly, charming, and encourage clients to unlock media or chat."
                    }
                };
                set((state) => ({
                    creators: [...(state.creators || []), newCreator]
                }));
                api.createCreator(newCreator);
                return newCreator;
            },

            deleteCreatorProfile: (id) => {
                set((state) => ({
                    creators: (state.creators || []).filter(c => c.id !== id)
                }));
                api.deleteCreator(id);
            },

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
            version: 6,
            storage: createJSONStorage(() => safeLocalStorage),
            migrate: (persistedState: unknown) => {
                const state = persistedState as Record<string, unknown>;
                const defaultCreators = MOCK_CREATORS;
                const existingCreators = (state?.creators as CreatorProfile[]) || defaultCreators;

                const mergedCreators = existingCreators.map(c => {
                    const mockMatch = defaultCreators.find(m => m.id === c.id || m.email === c.email);
                    return {
                        ...c,
                        password: c.password || mockMatch?.password || 'b2babe123',
                        age: c.age || mockMatch?.age || 24,
                        height: c.height || mockMatch?.height || '170 cm',
                        weight: c.weight || mockMatch?.weight || '54 kg',
                        measurements: c.measurements || mockMatch?.measurements || '90-60-90',
                        hairColor: c.hairColor || mockMatch?.hairColor || 'Brunette',
                        eyeColor: c.eyeColor || mockMatch?.eyeColor || 'Brown',
                    };
                });

                const existingClients = (state?.clients as ClientProfile[]) || MOCK_CLIENTS;
                const mergedClients = existingClients.map(cl => ({
                    ...cl,
                    password: cl.password || 'b2babe123'
                }));

                return {
                    ...state,
                    isAdminAuthenticated: false,
                    adminPassword: (state?.adminPassword as string) || 'admin2026',
                    creators: mergedCreators,
                    pendingCreators: (state?.pendingCreators as Partial<CreatorProfile>[]) || [],
                    clients: mergedClients,
                    chatSessions: (state?.chatSessions as ChatSession[]) || MOCK_CHATS
                } as unknown as AppState;
            }
        }
    )
);
