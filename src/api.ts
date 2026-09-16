import type { CreatorProfile, ClientProfile, ChatSession } from './store';

const API_BASE = '/api';

export interface SyncResponse {
    creators: CreatorProfile[];
    clients: ClientProfile[];
    chatSessions: ChatSession[];
    adminPassword?: string;
}

export const api = {
    async getSync(): Promise<SyncResponse | null> {
        try {
            const res = await fetch(`${API_BASE}/sync`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.warn('API getSync unreachable, using cached/fallback state', e);
            return null;
        }
    },

    async pushSync(payload: { creators: CreatorProfile[]; clients: ClientProfile[]; adminPassword?: string }): Promise<boolean> {
        try {
            const res = await fetch(`${API_BASE}/sync/push`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            return res.ok;
        } catch (e) {
            console.error('API pushSync error:', e);
            return false;
        }
    },

    async createCreator(data: Partial<CreatorProfile>): Promise<CreatorProfile | null> {
        try {
            const res = await fetch(`${API_BASE}/creators`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error('API createCreator error:', e);
            return null;
        }
    },

    async updateCreator(id: string, data: Partial<CreatorProfile>): Promise<CreatorProfile | null> {
        try {
            const res = await fetch(`${API_BASE}/creators/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error('API updateCreator error:', e);
            return null;
        }
    },

    async deleteCreator(id: string): Promise<boolean> {
        try {
            const res = await fetch(`${API_BASE}/creators/${id}`, {
                method: 'DELETE'
            });
            return res.ok;
        } catch (e) {
            console.error('API deleteCreator error:', e);
            return false;
        }
    },

    async setAdminPassword(password: string): Promise<boolean> {
        try {
            const res = await fetch(`${API_BASE}/settings/admin-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            return res.ok;
        } catch (e) {
            console.error('API setAdminPassword error:', e);
            return false;
        }
    },

    async updateClient(id: string, data: Partial<ClientProfile>): Promise<ClientProfile | null> {
        try {
            const res = await fetch(`${API_BASE}/clients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error('API updateClient error:', e);
            return null;
        }
    },

    async sendChatMessage(payload: {
        sessionId: string;
        creatorId?: string;
        clientId?: string;
        clientName?: string;
        message: {
            id: string;
            senderId: string;
            receiverId: string;
            text: string;
            timestamp: number;
            isRead: boolean;
        };
    }): Promise<ChatSession | null> {
        try {
            const res = await fetch(`${API_BASE}/chats/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            console.error('API sendChatMessage error:', e);
            return null;
        }
    }
};
