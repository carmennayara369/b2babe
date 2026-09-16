import { useState } from 'react';
import {
    Users, MessageSquare, Bot, LayoutDashboard,
    Search, Plus, Edit2, ShieldAlert, Cpu, X, User,
    LogOut, Lock, ArrowLeft, Trash2, Database, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore, type CreatorProfile, type ClientProfile } from '../store';
import './Admin.css';

const AdminGlobal = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const {
        creators, pendingCreators, approveCreator, rejectCreator,
        clients, chatSessions, toggleAiForSession, sendMessage,
        updateCreatorProfile, updateClientProfile,
        addCreatorProfile, deleteCreatorProfile,
        pushLocalToDatabase,
        isAdminAuthenticated, loginAdmin, logoutAdmin
    } = useAppStore();

    const [adminPasswordInput, setAdminPasswordInput] = useState('');

    // Stats calculations
    const activeProfilesCount = creators.filter(c => c.status === 'active').length;
    const totalViews = creators.reduce((acc, c) => acc + c.views, 0);

    const [interceptMessage, setInterceptMessage] = useState('');
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    const [editingProfile, setEditingProfile] = useState<CreatorProfile | null>(null);
    const [formData, setFormData] = useState<Partial<CreatorProfile>>({});

    const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
    const [clientFormData, setClientFormData] = useState<Partial<ClientProfile>>({});

    const handleEditClick = (profile: CreatorProfile) => {
        setEditingProfile(profile);
        setFormData(JSON.parse(JSON.stringify(profile)));
    };

    const handleCreateNewClick = () => {
        const blankProfile: CreatorProfile = {
            id: 'new',
            name: '',
            bio: '',
            location: '',
            views: 0,
            status: 'active',
            aiEnabled: true,
            vip: false,
            phone: '',
            email: '',
            password: 'b2babe123',
            age: 24,
            height: '170 cm',
            weight: '54 kg',
            measurements: '90-60-90',
            hairColor: 'Brunette',
            eyeColor: 'Brown',
            mediaImages: [],
            imageUrl: '',
            services: {
                meet: { enabled: false, price: null },
                pic: { enabled: true, price: 15 },
                video: { enabled: true, price: 50 },
                chat: { enabled: true, price: 5 }
            }
        };
        setEditingProfile(blankProfile);
        setFormData(blankProfile);
    };

    const handleEditClientClick = (client: ClientProfile) => {
        setEditingClient(client);
        setClientFormData({ ...client, password: '' });
    };

    const handleSaveClient = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (editingClient) {
            updateClientProfile(editingClient.id, clientFormData);
            setEditingClient(null);
            setClientFormData({});
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isMedia: boolean = false) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const max_size = 600; // Optimized for localStorage quota safety

                    if (width > height && width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    } else if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality (~40KB)

                    if (isMedia) {
                        setFormData(prev => ({ ...prev, mediaImages: [...(prev.mediaImages || []), compressedDataUrl] }));
                    } else {
                        setFormData(prev => ({ ...prev, imageUrl: compressedDataUrl }));
                    }
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteMedia = (index: number) => {
        const newMedia = [...(formData.mediaImages || [])];
        newMedia.splice(index, 1);
        setFormData({ ...formData, mediaImages: newMedia });
    };

    const handleSaveProfile = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        if (editingProfile) {
            try {
                if (editingProfile.id === 'new') {
                    if (!formData.name?.trim()) {
                        alert("Please enter a name for the new profile.");
                        return;
                    }
                    addCreatorProfile(formData);
                    alert("New creator profile created successfully!");
                } else {
                    updateCreatorProfile(editingProfile.id, formData);
                    alert("Profile updated successfully!");
                }
                setEditingProfile(null);
                setFormData({});
            } catch (err) {
                console.error(err);
                alert("Failed to save changes. The image might still be too large or local storage is full.");
                setEditingProfile(null);
                setFormData({});
            }
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="admin-fade-in">
                        <div className="admin-header-title">
                            <h1>Overview</h1>
                            <p>Global Platform Administration.</p>
                        </div>

                        <div className="admin-stats-grid">
                            <div className="admin-stat-card">
                                <div className="stat-title">Active Profiles</div>
                                <div className="stat-value">{activeProfilesCount}</div>
                                <div className="stat-change positive">+2 this month</div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="stat-title">Total Profile Views</div>
                                <div className="stat-value">{totalViews}</div>
                                <div className="stat-change positive">Trending up</div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="stat-title">AI Handled Chats</div>
                                <div className="stat-value">{(chatSessions.filter(s => s.aiEnabled).length / Math.max(chatSessions.length, 1) * 100).toFixed(0)}%</div>
                                <div className="stat-change neutral">Stable</div>
                            </div>
                        </div>

                        <div className="admin-panel mt-4">
                            <h3 className="panel-title">System Alerts / Recent Activity</h3>
                            <div className="activity-list">
                                <div className="activity-item">
                                    <ShieldAlert size={18} color="#f59e0b" />
                                    <div className="activity-text">
                                        <strong>New user</strong> registration attempt flagged for review.
                                    </div>
                                    <button className="btn-small">Review</button>
                                </div>
                                {chatSessions.filter(s => s.aiEnabled).slice(0, 2).map((s) => {
                                    const creator = creators.find(c => c.id === s.creatorId);
                                    return (
                                        <div key={`act-${s.id}`} className="activity-item">
                                            <Cpu size={18} color="#3b82f6" />
                                            <div className="activity-text">
                                                <strong>{creator?.name || 'Creator'}</strong> AI bot successfully responded to {s.clientName}.
                                            </div>
                                            <button className="btn-small outline" onClick={() => { setActiveTab('chat_intercept'); setSelectedSessionId(s.id); }}>View Chat</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {pendingCreators.length > 0 && (
                            <div className="admin-panel mt-4" style={{ borderColor: '#f59e0b' }}>
                                <h3 className="panel-title" style={{ color: '#f59e0b' }}>Action Required: Pending Approvals</h3>
                                <p style={{ color: '#aaa', marginBottom: '1rem' }}>You have {pendingCreators.length} incoming creator registration request(s) waiting for approval.</p>
                                <button className="btn-primary" onClick={() => setActiveTab('pending')} style={{ background: '#f59e0b', color: '#000' }}>Review Applications</button>
                            </div>
                        )}
                    </div>
                );
            case 'profiles':
                return (
                    <div className="admin-fade-in">
                        <div className="admin-header-title flex-between">
                            <div>
                                <h1>Profile Management</h1>
                                <p>Create and edit creator accounts and generic profiles.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <button
                                    className="flex-center gap-2"
                                    onClick={async () => {
                                        setIsSyncing(true);
                                        const success = await pushLocalToDatabase();
                                        setIsSyncing(false);
                                        if (success) {
                                            setSyncSuccess(true);
                                            setTimeout(() => setSyncSuccess(false), 3000);
                                        } else {
                                            alert("La synchronisation a échoué. Assurez-vous que le serveur Node.js est bien démarré.");
                                        }
                                    }}
                                    disabled={isSyncing}
                                    style={{
                                        background: syncSuccess ? '#16a34a' : isSyncing ? '#065f46' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        cursor: isSyncing ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                                        transition: 'all 0.2s ease',
                                        display: 'inline-flex',
                                        alignItems: 'center'
                                    }}
                                    title="Enregistrer toutes les modifications du navigateur actuel dans la base de données serveur"
                                >
                                    {syncSuccess ? <Check size={18} color="#ffffff" /> : <Database size={18} color="#ffffff" />}
                                    <span>{syncSuccess ? 'Enregistré sur la Base !' : isSyncing ? 'Synchronisation...' : 'Sauvegarder sur la Base'}</span>
                                </button>
                                <button className="btn-primary flex-center gap-2" onClick={handleCreateNewClick}>
                                    <Plus size={18} /> New Profile
                                </button>
                            </div>
                        </div>

                        <div className="admin-panel">
                            <div className="panel-search">
                                <Search size={18} color="#888" />
                                <input type="text" placeholder="Search a profile..." />
                            </div>

                            <div className="table-responsive">
                                <table className="super-admin-table">
                                    <thead>
                                        <tr>
                                            <th>Creator</th>
                                            <th>Status</th>
                                            <th>AI Bot</th>
                                            <th>Views</th>
                                            <th>Location</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {creators.map(p => (
                                            <tr key={p.id}>
                                                <td className="font-bold">{p.name}</td>
                                                <td>
                                                    <span className={`status-badge ${p.status === 'active' ? 'success' : 'neutral'}`}>
                                                        {p.status === 'active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${p.aiEnabled ? 'ai-active' : 'ai-inactive'}`}>
                                                        {p.aiEnabled ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </td>
                                                <td>{p.views}</td>
                                                <td>
                                                    {p.location}
                                                </td>
                                                <td>
                                                    <button className="icon-action-btn" title="Edit Profile" onClick={() => handleEditClick(p)}><Edit2 size={16} /></button>
                                                    <button 
                                                        className="icon-action-btn" 
                                                        title="Delete Profile" 
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to delete profile "${p.name}"?`)) {
                                                                deleteCreatorProfile(p.id);
                                                            }
                                                        }}
                                                        style={{ color: '#ff5252' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'pending':
                return (
                    <div className="admin-fade-in">
                        <div className="admin-header-title">
                            <h1>Pending Registrations</h1>
                            <p>Review and approve new creator applications.</p>
                        </div>
                        <div className="admin-panel">
                            {pendingCreators.length === 0 ? (
                                <p style={{ color: '#aaa' }}>No pending applications currently.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="super-admin-table">
                                        <thead>
                                            <tr>
                                                <th>Email</th>
                                                <th>Name</th>
                                                <th>Location</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingCreators.map((p, index) => (
                                                <tr key={index}>
                                                    <td>{p.email}</td>
                                                    <td>{p.name || '-'}</td>
                                                    <td>{p.location || '-'}</td>
                                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className="btn-small" style={{ background: '#22c55e', color: '#000' }} onClick={() => approveCreator(index)}>Approve</button>
                                                        <button className="btn-small outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => rejectCreator(index)}>Reject</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'clients':
                return (
                    <div className="admin-fade-in">
                        <div className="admin-header-title">
                            <h1>Client Management</h1>
                            <p>Overview of registered client accounts and their balances.</p>
                        </div>
                        <div className="admin-panel">
                            {clients.length === 0 ? (
                                <p style={{ color: '#aaa' }}>No registered clients currently.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="super-admin-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Balance</th>
                                                <th>Media Unlocked</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clients.map(c => (
                                                <tr key={c.id}>
                                                    <td className="font-bold">{c.name}</td>
                                                    <td>{c.email}</td>
                                                    <td style={{ color: '#22c55e', fontWeight: 'bold' }}>€{c.balance}</td>
                                                    <td>{c.purchasedMedia.length} items</td>
                                                    <td>
                                                        <span className={`status-badge ${c.status === 'active' ? 'success' : 'neutral'}`}>
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="icon-action-btn" title="Edit Client" onClick={() => handleEditClientClick(c)}><Edit2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'chat_intercept': {
                const selectedSession = chatSessions.find(s => s.id === selectedSessionId) || chatSessions[0];
                const selectedCreator = creators.find(c => c.id === selectedSession?.creatorId);

                return (
                    <div className="admin-fade-in chat-interception-layout">
                        <div className="chat-intercept-sidebar">
                            <div className="sidebar-title">
                                <h3>Active Chats</h3>
                                <div className="filter-chips">
                                    <span className="chip active">All</span>
                                    <span className="chip">Human</span>
                                    <span className="chip ai">AI</span>
                                </div>
                            </div>
                            <div className="intercept-chat-list">
                                {chatSessions.map((c) => {
                                    const creator = creators.find(cr => cr.id === c.creatorId);
                                    const lastMsg = c.messages[c.messages.length - 1]?.text || 'No messages';
                                    return (
                                        <div
                                            key={c.id}
                                            className={`intercept-chat-item ${selectedSessionId === c.id || (!selectedSessionId && chatSessions[0].id === c.id) ? 'active' : ''}`}
                                            onClick={() => setSelectedSessionId(c.id)}
                                        >
                                            <div className="chat-item-header">
                                                <span className="profile-name">{creator?.name}</span>
                                            </div>
                                            <div className="client-name">with <strong>{c.clientName}</strong></div>
                                            <div className="last-msg">{lastMsg}</div>
                                            {c.aiEnabled && <div className="managed-by-ai"><Cpu size={12} /> Guided by AI</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {selectedSession && selectedCreator ? (
                            <div className="chat-intercept-main">
                                <div className="intercept-main-header flex-between">
                                    <div>
                                        <h3>Interception: {selectedCreator.name} ↔ {selectedSession.clientName}</h3>
                                        <div className="ai-status">
                                            {selectedSession.aiEnabled ? "AI is currently managing this conversation." : "Human takes over."}
                                        </div>
                                    </div>
                                    <button
                                        className="btn-danger"
                                        onClick={() => toggleAiForSession(selectedSession.id, !selectedSession.aiEnabled)}
                                    >
                                        {selectedSession.aiEnabled ? 'Take Control (Disable AI)' : 'Enable AI'}
                                    </button>
                                </div>

                                <div className="intercept-messages">
                                    {selectedSession.messages.map(m => (
                                        <div key={m.id} className={`msg-bubble ${m.senderId === selectedSession.clientId ? 'client' : 'ai-reply'}`}>
                                            <div className="msg-sender">
                                                {m.senderId === selectedSession.clientId ? selectedSession.clientName : <><Cpu size={12} /> {selectedCreator.name}</>}
                                            </div>
                                            {m.text}
                                        </div>
                                    ))}
                                </div>

                                <div className="intercept-input" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span className="warning-text" style={{ marginBottom: '0.5rem' }}>Sending a message here will send it to the client as if you were the creator.</span>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        {['❤️', '😍', '🔥', '😘', '🍆', '💦', '🍑'].map((emoji) => (
                                            <button
                                                key={emoji}
                                                style={{ background: 'transparent', border: '1px solid #ddd', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
                                                onClick={() => setInterceptMessage(prev => prev + emoji)}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="input-row">
                                        <input
                                            type="text"
                                            placeholder={`Reply as ${selectedCreator.name}...`}
                                            value={interceptMessage}
                                            onChange={(e) => setInterceptMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && interceptMessage.trim()) {
                                                    e.preventDefault();
                                                    sendMessage(selectedSession.id, selectedCreator.id, selectedSession.clientId, interceptMessage.trim());
                                                    setInterceptMessage('');
                                                }
                                            }}
                                        />
                                        <button
                                            className="btn-primary"
                                            onClick={() => {
                                                if (interceptMessage.trim()) {
                                                    sendMessage(selectedSession.id, selectedCreator.id, selectedSession.clientId, interceptMessage.trim());
                                                    setInterceptMessage('');
                                                }
                                            }}
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="chat-intercept-main flex-center" style={{ color: '#aaa' }}>
                                <h3>Select a discussion to intercept</h3>
                            </div>
                        )}
                    </div>
                );
            }
            case 'ai_config':
                return (
                    <div className="admin-fade-in">
                        <div className="admin-header-title">
                            <h1>AI Configuration (Chatbots)</h1>
                            <p>Customize system-wide behavior and fallback prompts for creators.</p>
                        </div>

                        <div className="admin-panel">
                            <h3>Global Default System Prompt</h3>
                            <p className="hint-text">This serves as base context. It is extended individually per profile.</p>
                            <textarea
                                className="full-width-textarea"
                                rows={6}
                                defaultValue="You are an escort/brand ambassador for B2Babe. You should behave seductively, guide users toward premium packages or dates, and handle booking queries elegantly."
                            />
                            <div className="mt-4">
                                <h3>Automated Interventions</h3>
                                <div className="toggle-row">
                                    <span>Enable AI auto-reply for creators who are idle &gt; 1h</span>
                                    <label className="switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="toggle-row">
                                    <span>Auto-block offensive clients using AI sentiment analysis</span>
                                    <label className="switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                            <button className="btn-primary mt-4">Save AI Settings</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!isAdminAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#0a0a0a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Inter, sans-serif',
                padding: '1.5rem'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '420px',
                    background: '#141414',
                    border: '1px solid #2a2a2a',
                    borderRadius: '16px',
                    padding: '2.5rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <img src="/logo-white.png" alt="B2Babe" style={{ width: '130px', marginBottom: '0.8rem' }} />
                        <div style={{
                            display: 'inline-block',
                            background: '#222',
                            color: '#ffd700',
                            padding: '0.2rem 0.8rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            marginBottom: '1rem'
                        }}>
                            SUPER ADMIN PORTAL
                        </div>
                        <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>Restricted Access</h2>
                        <p style={{ color: '#777', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            Please enter your master password to access the platform administration.
                        </p>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (loginAdmin(adminPasswordInput)) {
                            setAdminPasswordInput('');
                        }
                    }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.85rem' }}>
                                Master Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    placeholder="Enter admin password..."
                                    value={adminPasswordInput}
                                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                                    autoFocus
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.85rem 1rem',
                                        background: '#202020',
                                        border: '1px solid #333',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '0.9rem',
                                background: '#ffd700',
                                color: '#000',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Lock size={18} /> Access Dashboard
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link to="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <ArrowLeft size={16} /> Return to public site
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="super-admin-layout">
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}
            <aside className={`super-admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="super-admin-brand" style={{ position: 'relative' }}>
                    <img src="/logo-white.png" alt="B2Babe" style={{ width: '120px' }} />
                    <span className="super-badge">GLOBAL ADM</span>
                    <button className="mobile-menu-btn close-sidebar" style={{ display: 'none', position: 'absolute', top: '1rem', right: '1rem', color: 'white' }} onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="super-nav">
                    <button className={`super-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}>
                        <LayoutDashboard size={20} /> Overview
                    </button>
                    <button className={`super-nav-item ${activeTab === 'profiles' ? 'active' : ''}`} onClick={() => { setActiveTab('profiles'); setIsSidebarOpen(false); }}>
                        <Users size={20} /> Profiles & Mocks
                    </button>
                    <button className={`super-nav-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => { setActiveTab('pending'); setIsSidebarOpen(false); }}>
                        <ShieldAlert size={20} /> Pending {pendingCreators.length > 0 && <span style={{ background: '#f59e0b', color: '#000', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', marginLeft: 'auto', fontWeight: 'bold' }}>{pendingCreators.length}</span>}
                    </button>
                    <button className={`super-nav-item ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => { setActiveTab('clients'); setIsSidebarOpen(false); }}>
                        <User size={20} /> Clients
                    </button>
                    <button className={`super-nav-item ${activeTab === 'chat_intercept' ? 'active' : ''}`} onClick={() => { setActiveTab('chat_intercept'); setIsSidebarOpen(false); }}>
                        <MessageSquare size={20} /> Chat Interception
                    </button>
                    <button className={`super-nav-item ${activeTab === 'ai_config' ? 'active' : ''}`} onClick={() => { setActiveTab('ai_config'); setIsSidebarOpen(false); }}>
                        <Bot size={20} /> AI Configuration
                    </button>

                    <div className="nav-divider"></div>

                    <button className="super-nav-item" onClick={logoutAdmin} style={{ color: '#ff5555' }}>
                        <LogOut size={20} /> Sign Out
                    </button>

                    <Link to="/" className="super-nav-item text-muted" style={{ textDecoration: 'none' }}>
                        Return to site
                    </Link>
                </nav>
            </aside>
            <main className="super-admin-main">
                <header className="super-admin-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="mobile-menu-btn" style={{ display: 'none' }} onClick={() => setIsSidebarOpen(true)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <div className="header-search">
                            <Search size={18} color="#888" />
                            <input type="text" placeholder="Global search..." />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div className="header-admin-profile">
                            <div className="avatar">AD</div>
                            <span>Head Admin</span>
                        </div>
                        <button
                            onClick={logoutAdmin}
                            title="Sign Out"
                            style={{
                                background: 'rgba(255, 68, 68, 0.15)',
                                border: '1px solid rgba(255, 68, 68, 0.3)',
                                color: '#ff6b6b',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                            }}
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </header>
                <div className="super-admin-content-wrapper">
                    {renderContent()}
                </div>
            </main>
            {editingProfile && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#1e1e1e', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%', border: '1px solid #333' }}>
                        <div className="flex-between mb-4" style={{ marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                {editingProfile.id === 'new' ? 'Create New Profile' : `Edit Profile: ${editingProfile.name}`}
                            </h2>
                            <button onClick={() => setEditingProfile(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div className="custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Image Preview</label>
                                {formData.imageUrl && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <img src={formData.imageUrl} alt="Profile" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%' }} />
                                    </div>
                                )}
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Name</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Location</label>
                                <input
                                    type="text"
                                    value={formData.location || ''}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Bio</label>
                                <textarea
                                    rows={3}
                                    value={formData.bio || ''}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Email</label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Password (leave blank to remain unchanged)</label>
                                <input
                                    type="password"
                                    placeholder="******"
                                    value={formData.password || ''}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone || ''}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* Physical Attributes & Measurements */}
                            <div style={{ marginBottom: '1.5rem', border: '1px solid #333', padding: '1rem', borderRadius: '8px', background: '#191919' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: '#ffd700', fontSize: '0.95rem' }}>Physical Attributes & Stats</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#888', fontSize: '0.8rem' }}>Age</label>
                                        <input
                                            type="number"
                                            value={formData.age || ''}
                                            onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                                            placeholder="e.g. 24"
                                            style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#888', fontSize: '0.8rem' }}>Height (Taille)</label>
                                        <input
                                            type="text"
                                            value={formData.height || ''}
                                            onChange={e => setFormData({ ...formData, height: e.target.value })}
                                            placeholder="e.g. 172 cm"
                                            style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#888', fontSize: '0.8rem' }}>Weight (Poids)</label>
                                        <input
                                            type="text"
                                            value={formData.weight || ''}
                                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                                            placeholder="e.g. 54 kg"
                                            style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#888', fontSize: '0.8rem' }}>Measurements (Mensurations)</label>
                                        <input
                                            type="text"
                                            value={formData.measurements || ''}
                                            onChange={e => setFormData({ ...formData, measurements: e.target.value })}
                                            placeholder="e.g. 90-60-90"
                                            style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#888', fontSize: '0.8rem' }}>Hair Color (Cheveux)</label>
                                        <input
                                            type="text"
                                            value={formData.hairColor || ''}
                                            onChange={e => setFormData({ ...formData, hairColor: e.target.value })}
                                            placeholder="e.g. Brunette / Blonde"
                                            style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', color: '#888', fontSize: '0.8rem' }}>Eye Color (Yeux)</label>
                                        <input
                                            type="text"
                                            value={formData.eyeColor || ''}
                                            onChange={e => setFormData({ ...formData, eyeColor: e.target.value })}
                                            placeholder="e.g. Brown / Hazel"
                                            style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, false)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                />
                                <small style={{ color: '#888', display: 'block', marginTop: '0.5rem' }}>Or alternatively, keep or put an Image URL below:</small>
                                <input
                                    type="text"
                                    value={formData.imageUrl || ''}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box', marginTop: '0.5rem' }}
                                    placeholder="Image URL"
                                />
                            </div>

                            <div style={{ marginBottom: '1rem', borderTop: '1px solid #444', paddingTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Offered Services & Pricing</label>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    {['pic', 'video', 'chat'].map(key => {
                                        const sKey = key as keyof NonNullable<CreatorProfile['services']>;
                                        // safely handle missing services gracefully
                                        const defaultServices = { meet: { enabled: false, price: null }, pic: { enabled: false, price: null }, video: { enabled: false, price: null }, chat: { enabled: true, price: 10 } };
                                        const safeServices = formData.services || defaultServices;
                                        const service = safeServices[sKey] || defaultServices[sKey];

                                        return (
                                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#333', padding: '0.75rem', borderRadius: '4px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={service.enabled}
                                                    onChange={e => setFormData({ ...formData, services: { ...safeServices, [sKey]: { ...service, enabled: e.target.checked } } })}
                                                    style={{ width: '1rem', height: '1rem' }}
                                                />
                                                <div style={{ width: '60px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', color: 'white' }}>{key}</div>
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>€</span>
                                                    <input
                                                        type="number"
                                                        disabled={!service.enabled}
                                                        value={service.price || ''}
                                                        onChange={e => setFormData({ ...formData, services: { ...safeServices, [sKey]: { ...service, price: e.target.value ? Number(e.target.value) : null } } })}
                                                        style={{ width: '80px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white' }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem', borderTop: '1px solid #444', paddingTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Media Gallery Images</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {(formData.mediaImages || []).map((imgUrl, i) => (
                                        <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                                            <img src={imgUrl} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button
                                                onClick={() => handleDeleteMedia(i)}
                                                style={{ position: 'absolute', top: 4, right: 4, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, true)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#aaa', fontSize: '0.9rem' }}>
                                    <span>AI Enabled</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.aiEnabled || false}
                                        onChange={e => setFormData({ ...formData, aiEnabled: e.target.checked })}
                                        style={{ width: '1.25rem', height: '1.25rem' }}
                                    />
                                </label>
                            </div>

                            {formData.aiEnabled && (
                                <div style={{ marginBottom: '1rem', borderTop: '1px solid #444', paddingTop: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>AI Base Persona</label>
                                    <textarea
                                        rows={3}
                                        value={formData.aiPersona?.basePrompt || ''}
                                        onChange={e => setFormData({ ...formData, aiPersona: { ...(formData.aiPersona || { basePrompt: '', customInstructions: '' }), basePrompt: e.target.value } })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', resize: 'vertical', boxSizing: 'border-box' }}
                                    />
                                    <label style={{ display: 'block', marginBottom: '0.5rem', marginTop: '1rem', color: '#aaa', fontSize: '0.9rem' }}>AI Custom Instructions</label>
                                    <textarea
                                        rows={4}
                                        value={formData.aiPersona?.customInstructions || ''}
                                        onChange={e => setFormData({ ...formData, aiPersona: { ...(formData.aiPersona || { basePrompt: '', customInstructions: '' }), customInstructions: e.target.value } })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', resize: 'vertical', boxSizing: 'border-box' }}
                                    />
                                </div>
                            )}

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#aaa', fontSize: '0.9rem' }}>
                                    <span>VIP Highlight Status</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.vip || false}
                                        onChange={e => setFormData({ ...formData, vip: e.target.checked })}
                                        style={{ width: '1.25rem', height: '1.25rem' }}
                                    />
                                </label>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Status</label>
                                <select
                                    value={formData.status || 'inactive'}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
                            <button className="btn-secondary" onClick={() => setEditingProfile(null)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveProfile}>
                                {editingProfile.id === 'new' ? 'Create Profile' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingClient && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '500px', border: '1px solid #333' }}>
                        <div className="flex-between mb-4" style={{ marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Edit Client: {editingClient.name}</h2>
                            <button onClick={() => setEditingClient(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div className="custom-scrollbar" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Name</label>
                                <input
                                    type="text"
                                    value={clientFormData.name || ''}
                                    onChange={e => setClientFormData({ ...clientFormData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Email</label>
                                <input
                                    type="email"
                                    value={clientFormData.email || ''}
                                    onChange={e => setClientFormData({ ...clientFormData, email: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    placeholder="******"
                                    value={clientFormData.password || ''}
                                    onChange={e => setClientFormData({ ...clientFormData, password: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Balance (€)</label>
                                <input
                                    type="number"
                                    value={clientFormData.balance || 0}
                                    onChange={e => setClientFormData({ ...clientFormData, balance: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Status</label>
                                <select
                                    value={clientFormData.status || 'active'}
                                    onChange={e => setClientFormData({ ...clientFormData, status: e.target.value as 'active' | 'suspended' })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white', boxSizing: 'border-box' }}
                                >
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
                            <button className="btn-secondary" onClick={() => setEditingClient(null)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveClient}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGlobal;
