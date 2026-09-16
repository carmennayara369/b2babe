import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'b2babe.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS creators (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            bio TEXT,
            location TEXT,
            views INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            aiEnabled INTEGER DEFAULT 0,
            vip INTEGER DEFAULT 0,
            phone TEXT,
            email TEXT,
            password TEXT DEFAULT 'b2babe123',
            age INTEGER DEFAULT 24,
            height TEXT DEFAULT '170 cm',
            weight TEXT DEFAULT '54 kg',
            measurements TEXT DEFAULT '90-60-90',
            hairColor TEXT DEFAULT 'Brunette',
            eyeColor TEXT DEFAULT 'Brown',
            imageUrl TEXT,
            services TEXT,
            mediaImages TEXT,
            premiumMedia TEXT,
            aiPersona TEXT,
            createdAt INTEGER,
            updatedAt INTEGER
        );

        CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            password TEXT DEFAULT 'b2babe123',
            balance INTEGER DEFAULT 0,
            phone TEXT,
            avatar TEXT,
            status TEXT DEFAULT 'active',
            purchasedMedia TEXT,
            subscribedCreators TEXT,
            createdAt INTEGER
        );

        CREATE TABLE IF NOT EXISTS chat_sessions (
            id TEXT PRIMARY KEY,
            creatorId TEXT NOT NULL,
            clientId TEXT NOT NULL,
            clientName TEXT NOT NULL,
            aiEnabled INTEGER DEFAULT 0,
            lastMessageTimestamp INTEGER,
            messages TEXT
        );
    `);

    const adminPass = db.prepare('SELECT value FROM settings WHERE key = ?').get('adminPassword');
    if (!adminPass) {
        db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('adminPassword', 'admin2026');
    }

    const creatorCount = db.prepare('SELECT COUNT(*) as count FROM creators').get();
    if (creatorCount.count === 0) {
        seedInitialData();
    }
}

function seedInitialData() {
    console.log('Seeding initial database data...');

    const initialCreators = [
        {
            id: 'c1',
            name: 'Anna Smith',
            bio: "Hi, I'm Anna. I offer exclusive dates and private moments.",
            location: 'Paris, France',
            views: 1200,
            status: 'active',
            aiEnabled: 1,
            vip: 1,
            phone: '12345678',
            email: 'anna@b2babe.com',
            password: 'b2babe123',
            age: 25,
            height: '172 cm',
            weight: '53 kg',
            measurements: '90-61-90',
            hairColor: 'Brunette',
            eyeColor: 'Hazel',
            imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400',
            mediaImages: JSON.stringify([
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400',
                'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400'
            ]),
            premiumMedia: JSON.stringify([
                { id: 'media_1_c1', url: 'https://images.unsplash.com/photo-1611042553365-9b101441c135?auto=format&fit=crop&q=80&w=500&h=600', price: 15 },
                { id: 'media_2_c1', url: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&q=80&w=500&h=600', price: 25 }
            ]),
            services: JSON.stringify({
                meet: { enabled: false, price: null },
                pic: { enabled: true, price: 15 },
                video: { enabled: true, price: 50 },
                chat: { enabled: true, price: 5 }
            }),
            aiPersona: JSON.stringify({
                basePrompt: "You are Anna, a friendly and flirty 25-year-old girl from Paris. You love fashion, traveling, and good wine.",
                customInstructions: "Always be polite but playful. Always redirect them to buy private pics or chat. Use emojis occasionally."
            }),
            createdAt: Date.now(),
            updatedAt: Date.now()
        },
        {
            id: 'c2',
            name: 'Chloe Paris',
            bio: "Let's create unforgettable memories together.",
            location: 'London, UK',
            views: 450,
            status: 'inactive',
            aiEnabled: 0,
            vip: 0,
            phone: '87654321',
            email: 'chloe@b2babe.com',
            password: 'b2babe123',
            age: 23,
            height: '168 cm',
            weight: '50 kg',
            measurements: '88-59-89',
            hairColor: 'Blonde',
            eyeColor: 'Blue',
            imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400',
            mediaImages: JSON.stringify([]),
            premiumMedia: JSON.stringify([]),
            services: JSON.stringify({
                meet: { enabled: false, price: null },
                pic: { enabled: false, price: null },
                video: { enabled: true, price: 100 },
                chat: { enabled: true, price: 10 }
            }),
            aiPersona: JSON.stringify(null),
            createdAt: Date.now(),
            updatedAt: Date.now()
        },
        {
            id: 'c3',
            name: 'Lea Dupont',
            bio: "Fun, bubbly and ready for adventure.",
            location: 'Berlin, Germany',
            views: 3200,
            status: 'active',
            aiEnabled: 1,
            vip: 0,
            phone: '11223344',
            email: 'lea@b2babe.com',
            password: 'b2babe123',
            age: 26,
            height: '175 cm',
            weight: '56 kg',
            measurements: '92-62-92',
            hairColor: 'Auburn',
            eyeColor: 'Green',
            imageUrl: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&q=80&w=400&h=400',
            mediaImages: JSON.stringify([]),
            premiumMedia: JSON.stringify([]),
            services: JSON.stringify({
                meet: { enabled: false, price: null },
                pic: { enabled: true, price: 10 },
                video: { enabled: false, price: null },
                chat: { enabled: true, price: 5 }
            }),
            aiPersona: JSON.stringify(null),
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
    ];

    const insertCreator = db.prepare(`
        INSERT INTO creators (
            id, name, bio, location, views, status, aiEnabled, vip, phone, email, password,
            age, height, weight, measurements, hairColor, eyeColor, imageUrl, services, mediaImages, premiumMedia, aiPersona, createdAt, updatedAt
        ) VALUES (
            @id, @name, @bio, @location, @views, @status, @aiEnabled, @vip, @phone, @email, @password,
            @age, @height, @weight, @measurements, @hairColor, @eyeColor, @imageUrl, @services, @mediaImages, @premiumMedia, @aiPersona, @createdAt, @updatedAt
        )
    `);

    for (const c of initialCreators) {
        insertCreator.run(c);
    }

    const insertClient = db.prepare(`
        INSERT INTO clients (id, name, email, password, balance, phone, avatar, status, purchasedMedia, subscribedCreators, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertClient.run(
        'client_john@example.com',
        'John Doe',
        'john@example.com',
        'b2babe123',
        500,
        '',
        '',
        'active',
        JSON.stringify([]),
        JSON.stringify([]),
        Date.now()
    );

    const insertChat = db.prepare(`
        INSERT INTO chat_sessions (id, creatorId, clientId, clientName, aiEnabled, lastMessageTimestamp, messages)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertChat.run(
        'session-c1-clientA',
        'c1',
        'clientA',
        'Client A',
        1,
        Date.now() - 120000,
        JSON.stringify([
            { id: 'm1', senderId: 'clientA', receiverId: 'c1', text: 'Hi, are you available this evening?', timestamp: Date.now() - 180000, isRead: true },
            { id: 'm2', senderId: 'c1', receiverId: 'clientA', text: 'Hi! Yes I am, what do you have in mind? (AI automated)', timestamp: Date.now() - 120000, isRead: true }
        ])
    );

    console.log('Database initialized successfully with default data.');
}
