import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { db, initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initDatabase();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

function formatCreatorRow(row) {
    if (!row) return null;
    return {
        ...row,
        aiEnabled: Boolean(row.aiEnabled),
        vip: Boolean(row.vip),
        services: row.services ? JSON.parse(row.services) : null,
        mediaImages: row.mediaImages ? JSON.parse(row.mediaImages) : [],
        premiumMedia: row.premiumMedia ? JSON.parse(row.premiumMedia) : [],
        aiPersona: row.aiPersona ? JSON.parse(row.aiPersona) : null,
    };
}

function formatClientRow(row) {
    if (!row) return null;
    return {
        ...row,
        purchasedMedia: row.purchasedMedia ? JSON.parse(row.purchasedMedia) : [],
        subscribedCreators: row.subscribedCreators ? JSON.parse(row.subscribedCreators) : []
    };
}

function formatChatRow(row) {
    if (!row) return null;
    return {
        ...row,
        aiEnabled: Boolean(row.aiEnabled),
        messages: row.messages ? JSON.parse(row.messages) : []
    };
}

// 1. Initial full state sync
app.get('/api/sync', (req, res) => {
    try {
        const creators = db.prepare('SELECT * FROM creators ORDER BY createdAt DESC').all().map(formatCreatorRow);
        const clients = db.prepare('SELECT * FROM clients ORDER BY createdAt DESC').all().map(formatClientRow);
        const chatSessions = db.prepare('SELECT * FROM chat_sessions').all().map(formatChatRow);
        const adminSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('adminPassword');

        res.json({
            creators,
            clients,
            chatSessions,
            adminPassword: adminSetting ? adminSetting.value : 'admin2026'
        });
    } catch (err) {
        console.error('Error fetching sync state:', err);
        res.status(500).json({ error: 'Database read error' });
    }
});

// 2. Creators
app.get('/api/creators', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM creators ORDER BY createdAt DESC').all();
        res.json(rows.map(formatCreatorRow));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/creators', (req, res) => {
    try {
        const data = req.body;
        const id = data.id || `c_${Date.now()}`;
        const name = data.name || 'New Creator';
        const email = data.email || `${id}@b2babe.com`;

        const stmt = db.prepare(`
            INSERT INTO creators (
                id, name, bio, location, views, status, aiEnabled, vip, phone, email, password,
                age, height, weight, measurements, hairColor, eyeColor, imageUrl, services, mediaImages, premiumMedia, aiPersona, createdAt, updatedAt
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `);

        stmt.run(
            id,
            name,
            data.bio || '',
            data.location || 'Paris, France',
            data.views || 0,
            data.status || 'active',
            data.aiEnabled ? 1 : 0,
            data.vip ? 1 : 0,
            data.phone || '',
            email,
            data.password || 'b2babe123',
            data.age || 24,
            data.height || '170 cm',
            data.weight || '54 kg',
            data.measurements || '90-60-90',
            data.hairColor || 'Brunette',
            data.eyeColor || 'Brown',
            data.imageUrl || '',
            JSON.stringify(data.services || {
                meet: { enabled: false, price: null },
                pic: { enabled: true, price: 15 },
                video: { enabled: true, price: 50 },
                chat: { enabled: true, price: 5 }
            }),
            JSON.stringify(data.mediaImages || []),
            JSON.stringify(data.premiumMedia || []),
            JSON.stringify(data.aiPersona || null),
            Date.now(),
            Date.now()
        );

        const created = db.prepare('SELECT * FROM creators WHERE id = ?').get(id);
        res.status(201).json(formatCreatorRow(created));
    } catch (err) {
        console.error('Error creating creator:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/creators/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const existing = db.prepare('SELECT * FROM creators WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Creator not found' });
        }

        const stmt = db.prepare(`
            UPDATE creators SET
                name = COALESCE(?, name),
                bio = COALESCE(?, bio),
                location = COALESCE(?, location),
                views = COALESCE(?, views),
                status = COALESCE(?, status),
                aiEnabled = COALESCE(?, aiEnabled),
                vip = COALESCE(?, vip),
                phone = COALESCE(?, phone),
                email = COALESCE(?, email),
                password = COALESCE(?, password),
                age = COALESCE(?, age),
                height = COALESCE(?, height),
                weight = COALESCE(?, weight),
                measurements = COALESCE(?, measurements),
                hairColor = COALESCE(?, hairColor),
                eyeColor = COALESCE(?, eyeColor),
                imageUrl = COALESCE(?, imageUrl),
                services = COALESCE(?, services),
                mediaImages = COALESCE(?, mediaImages),
                premiumMedia = COALESCE(?, premiumMedia),
                aiPersona = COALESCE(?, aiPersona),
                updatedAt = ?
            WHERE id = ?
        `);

        stmt.run(
            data.name !== undefined ? data.name : null,
            data.bio !== undefined ? data.bio : null,
            data.location !== undefined ? data.location : null,
            data.views !== undefined ? data.views : null,
            data.status !== undefined ? data.status : null,
            data.aiEnabled !== undefined ? (data.aiEnabled ? 1 : 0) : null,
            data.vip !== undefined ? (data.vip ? 1 : 0) : null,
            data.phone !== undefined ? data.phone : null,
            data.email !== undefined ? data.email : null,
            data.password !== undefined ? data.password : null,
            data.age !== undefined ? data.age : null,
            data.height !== undefined ? data.height : null,
            data.weight !== undefined ? data.weight : null,
            data.measurements !== undefined ? data.measurements : null,
            data.hairColor !== undefined ? data.hairColor : null,
            data.eyeColor !== undefined ? data.eyeColor : null,
            data.imageUrl !== undefined ? data.imageUrl : null,
            data.services !== undefined ? JSON.stringify(data.services) : null,
            data.mediaImages !== undefined ? JSON.stringify(data.mediaImages) : null,
            data.premiumMedia !== undefined ? JSON.stringify(data.premiumMedia) : null,
            data.aiPersona !== undefined ? JSON.stringify(data.aiPersona) : null,
            Date.now(),
            id
        );

        const updated = db.prepare('SELECT * FROM creators WHERE id = ?').get(id);
        res.json(formatCreatorRow(updated));
    } catch (err) {
        console.error('Error updating creator:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/creators/:id', (req, res) => {
    try {
        const { id } = req.params;
        db.prepare('DELETE FROM creators WHERE id = ?').run(id);
        res.json({ success: true, id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Super Admin Password Setting
app.post('/api/settings/admin-password', (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: 'Password required' });
        }
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('adminPassword', password);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Clients
app.get('/api/clients', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM clients ORDER BY createdAt DESC').all();
        res.json(rows.map(formatClientRow));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/clients', (req, res) => {
    try {
        const data = req.body;
        const id = data.id || `client_${data.email || Date.now()}`;
        const stmt = db.prepare(`
            INSERT INTO clients (id, name, email, password, balance, phone, avatar, status, purchasedMedia, subscribedCreators, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            id,
            data.name || 'Anonymous',
            data.email || '',
            data.password || 'b2babe123',
            data.balance || 0,
            data.phone || '',
            data.avatar || '',
            data.status || 'active',
            JSON.stringify(data.purchasedMedia || []),
            JSON.stringify(data.subscribedCreators || []),
            Date.now()
        );
        const created = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
        res.status(201).json(formatClientRow(created));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/clients/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const stmt = db.prepare(`
            UPDATE clients SET
                name = COALESCE(?, name),
                email = COALESCE(?, email),
                password = COALESCE(?, password),
                balance = COALESCE(?, balance),
                phone = COALESCE(?, phone),
                avatar = COALESCE(?, avatar),
                status = COALESCE(?, status),
                purchasedMedia = COALESCE(?, purchasedMedia),
                subscribedCreators = COALESCE(?, subscribedCreators)
            WHERE id = ?
        `);
        stmt.run(
            data.name !== undefined ? data.name : null,
            data.email !== undefined ? data.email : null,
            data.password !== undefined ? data.password : null,
            data.balance !== undefined ? data.balance : null,
            data.phone !== undefined ? data.phone : null,
            data.avatar !== undefined ? data.avatar : null,
            data.status !== undefined ? data.status : null,
            data.purchasedMedia !== undefined ? JSON.stringify(data.purchasedMedia) : null,
            data.subscribedCreators !== undefined ? JSON.stringify(data.subscribedCreators) : null,
            id
        );
        const updated = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
        res.json(formatClientRow(updated));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Chat Sessions
app.get('/api/chats', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM chat_sessions').all();
        res.json(rows.map(formatChatRow));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chats/messages', (req, res) => {
    try {
        const { sessionId, creatorId, clientId, clientName, message } = req.body;
        if (!sessionId || !message) {
            return res.status(400).json({ error: 'Missing sessionId or message' });
        }

        const existing = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId);
        if (!existing) {
            const newMessages = [message];
            db.prepare(`
                INSERT INTO chat_sessions (id, creatorId, clientId, clientName, aiEnabled, lastMessageTimestamp, messages)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(sessionId, creatorId || '', clientId || '', clientName || 'Guest', 1, Date.now(), JSON.stringify(newMessages));
        } else {
            const messages = existing.messages ? JSON.parse(existing.messages) : [];
            messages.push(message);
            db.prepare(`
                UPDATE chat_sessions SET
                    messages = ?,
                    lastMessageTimestamp = ?
                WHERE id = ?
            `).run(JSON.stringify(messages), Date.now(), sessionId);
        }

        const updated = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId);
        res.json(formatChatRow(updated));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve static frontend files if production build exists
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req, res, next) => {
        if (!req.path.startsWith('/api') && req.method === 'GET') {
            return res.sendFile(path.join(distPath, 'index.html'));
        }
        next();
    });
}

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
