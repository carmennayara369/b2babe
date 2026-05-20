import { useState, useCallback } from 'react';
import {
    ArrowLeft, ArrowRight, ShieldCheck, Copy,
    LayoutDashboard, User, Image, MessageSquare, Calendar, DollarSign, LogOut, Menu, X, Plus, Trash2, Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import './Backoffice.css';

const Backoffice = () => {
    const navigate = useNavigate();
    const {
        creators, currentCreatorId, loginCreator, logoutCreator, updateCreatorProfile,
        chatSessions, sendMessage, registerCreator
    } = useAppStore();

    const currentCreator = creators.find(c => c.id === currentCreatorId);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Dashboard States
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [regStep, setRegStep] = useState(1);
    const [regName, setRegName] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regLocation, setRegLocation] = useState('');
    const [regBio, setRegBio] = useState('');

    // Profile Edit States
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');
    const [editServices, setEditServices] = useState(currentCreator?.services || {
        meet: { enabled: true, price: 150 },
        pic: { enabled: false, price: null },
        video: { enabled: false, price: null },
        chat: { enabled: true, price: 10 }
    });
    const [editAIPersona, setEditAIPersona] = useState(currentCreator?.aiPersona || {
        basePrompt: "I am a new creator on B2Babe.",
        customInstructions: "Be friendly and encourage clients to see my media."
    });

    // Chat States
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [chatInput, setChatInput] = useState('');

    const syncEditState = useCallback(() => {
        if (currentCreator) {
            setEditName(currentCreator.name);
            setEditBio(currentCreator.bio);
            setEditLocation(currentCreator.location);
            setEditImageUrl(currentCreator.imageUrl);
            if (currentCreator.services) setEditServices(currentCreator.services);
            if (currentCreator.aiPersona) setEditAIPersona(currentCreator.aiPersona);
        }
    }, [currentCreator]);

    const [prevCreatorId, setPrevCreatorId] = useState<string | null>(null);

    if (currentCreatorId !== prevCreatorId) {
        setPrevCreatorId(currentCreatorId);
        if (currentCreator) {
            setEditName(currentCreator.name);
            setEditBio(currentCreator.bio);
            setEditLocation(currentCreator.location);
            setEditImageUrl(currentCreator.imageUrl);
            if (currentCreator.services) setEditServices(currentCreator.services);
            if (currentCreator.aiPersona) setEditAIPersona(currentCreator.aiPersona);
        }
    }

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isRegistering) {
            if (regStep < 3) {
                setRegStep(regStep + 1);
            } else {
                if (email && password && regName) {
                    registerCreator({
                        email,
                        password,
                        name: regName,
                        phone: regPhone,
                        location: regLocation,
                        bio: regBio
                    });
                    alert("Registration submitted! Pending admin approval.");
                    setIsRegistering(false);
                    setRegStep(1);
                }
            }
        } else {
            if (email && password) {
                loginCreator(email);
            }
        }
    };

    const handleSaveProfile = () => {
        if (currentCreatorId) {
            updateCreatorProfile(currentCreatorId, {
                name: editName,
                bio: editBio,
                location: editLocation,
                imageUrl: editImageUrl,
                services: editServices,
                aiPersona: editAIPersona
            });
            alert('Profile saved successfully!');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'public' | 'premium' | 'avatar' = 'avatar') => {
        const file = e.target.files?.[0];
        if (file) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const max_size = 1080; // High quality threshold

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
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85); // 85% quality

                    if (mediaType === 'public' && currentCreatorId && currentCreator) {
                        updateCreatorProfile(currentCreatorId, {
                            mediaImages: [...(currentCreator.mediaImages || []), compressedDataUrl]
                        });
                    } else if (mediaType === 'premium' && currentCreatorId && currentCreator) {
                        const price = prompt("Set a price for this premium media (€):", "15");
                        if (price && !isNaN(Number(price))) {
                            const newMedia = {
                                id: `media_${Date.now()}_${Math.random()}`,
                                url: compressedDataUrl,
                                price: Number(price)
                            };
                            updateCreatorProfile(currentCreatorId, {
                                premiumMedia: [...(currentCreator.premiumMedia || []), newMedia]
                            });
                        }
                    } else if (mediaType === 'avatar') {
                        setEditImageUrl(compressedDataUrl);
                    }
                };
                img.src = fileReader.result as string;
            };
            fileReader.readAsDataURL(file);
        }
    };

    const handleDeleteMedia = (index: number) => {
        if (currentCreatorId && currentCreator) {
            const newMedia = [...(currentCreator.mediaImages || [])];
            newMedia.splice(index, 1);
            updateCreatorProfile(currentCreatorId, { mediaImages: newMedia });
        }
    };

    const handleDeletePremiumMedia = (mediaId: string) => {
        if (currentCreatorId && currentCreator) {
            const newPremium = (currentCreator.premiumMedia || []).filter(m => m.id !== mediaId);
            updateCreatorProfile(currentCreatorId, { premiumMedia: newPremium });
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'media', label: 'Media Library', icon: Image },
        { id: 'chat', label: 'Chat', icon: MessageSquare },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'earnings', label: 'Earnings', icon: DollarSign },
    ];

    const renderDashboardContent = () => {
        if (!currentCreator) return null;
        const myChats = chatSessions.filter(c => c.creatorId === currentCreator.id);

        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="tab-pane animate-fade-in">
                        <div className="admin-welcome">
                            <h1>Overview</h1>
                            <p>Here's what's happening with your account today.</p>
                        </div>

                        <div className="admin-grid">
                            <div className="admin-card stats-card">
                                <h3>Account Stats</h3>
                                <div className="stats-row">
                                    <div className="stat-item">
                                        <div className="stat-val">{currentCreator.views}</div>
                                        <div className="stat-label">Profile Views</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-val">28</div>
                                        <div className="stat-label">Subscribers</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-val">€4.2K</div>
                                        <div className="stat-label">Revenue</div>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-card action-card">
                                <h3>Quick Actions</h3>
                                <button className="admin-btn" onClick={() => { setActiveTab('profile'); syncEditState(); }}>Edit Profile & Rates</button>
                                <button className="admin-btn" onClick={() => setActiveTab('media')}>Upload New Media</button>
                                <button className="admin-btn" onClick={() => setActiveTab('appointments')}>Update Availability</button>
                            </div>

                            <div className="admin-card link-card">
                                <h3>Your Creator Link</h3>
                                <div className="link-box">
                                    <span className="link-text">b2babe.com/profile/{currentCreator.id}</span>
                                    <button className="copy-btn"><Copy size={18} /></button>
                                </div>
                                <p className="link-hint">Share this link anywhere to get more clients.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="tab-pane animate-fade-in">
                        <div className="admin-welcome">
                            <h1>My Profile</h1>
                            <p>Manage your public details and pricing.</p>
                        </div>
                        <div className="profile-form-container admin-card">
                            <div className="form-group">
                                <label>Profile Picture</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <img src={editImageUrl || currentCreator.imageUrl} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Display Name</label>
                                <input type="text" className="admin-input" value={editName} onChange={e => setEditName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea className="admin-textarea" rows={4} value={editBio} onChange={e => setEditBio(e.target.value)}></textarea>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input type="text" className="admin-input" value={editLocation} onChange={e => setEditLocation(e.target.value)} />
                            </div>

                            <hr style={{ borderColor: '#333', margin: '2rem 0' }} />
                            <h3>Offered Services</h3>
                            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>Toggle the services you offer and set a custom price. Leave price blank to show "Price on request".</p>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {['meet', 'pic', 'video', 'chat'].map(key => {
                                    const sKey = key as keyof typeof editServices;
                                    const service = editServices[sKey];
                                    return (
                                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#222', padding: '1rem', borderRadius: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={service.enabled}
                                                onChange={e => setEditServices(prev => ({ ...prev, [sKey]: { ...prev[sKey], enabled: e.target.checked } }))}
                                                style={{ width: '1.2rem', height: '1.2rem' }}
                                            />
                                            <div style={{ width: '80px', fontWeight: 'bold', textTransform: 'uppercase', color: 'white' }}>{key}</div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                                                <span>Price (€)</span>
                                                <input
                                                    type="number"
                                                    className="admin-input"
                                                    style={{ width: '100px', margin: 0 }}
                                                    disabled={!service.enabled}
                                                    value={service.price || ''}
                                                    onChange={e => setEditServices(prev => ({ ...prev, [sKey]: { ...prev[sKey], price: e.target.value ? Number(e.target.value) : null } }))}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <hr style={{ borderColor: '#333', margin: '2rem 0' }} />
                            <h3>AI Chatbot Settings</h3>
                            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>Train your clone. Describe your personality, and set strict instructions for how it replies while you're away.</p>

                            <div className="form-group">
                                <label>Base Persona (Who are you?)</label>
                                <textarea
                                    className="admin-textarea"
                                    rows={3}
                                    placeholder="I am Sofia, 24 years old from Miami. I flirt politely..."
                                    value={editAIPersona.basePrompt}
                                    onChange={e => setEditAIPersona({ ...editAIPersona, basePrompt: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Custom Instructions & Guardrails (Rules)</label>
                                <textarea
                                    className="admin-textarea"
                                    rows={4}
                                    placeholder="Never say yes to meetups under 300€. Always redirect them to buy private pics..."
                                    value={editAIPersona.customInstructions}
                                    onChange={e => setEditAIPersona({ ...editAIPersona, customInstructions: e.target.value })}
                                ></textarea>
                            </div>

                            <button className="save-btn w-100 mt-4" onClick={handleSaveProfile}>Save Changes</button>
                        </div>
                    </div>
                );
            case 'media':
                return (
                    <div className="tab-pane animate-fade-in">
                        <div className="admin-welcome flex-between">
                            <div>
                                <h1>Media Library</h1>
                                <p>Manage your public and private photos/videos.</p>
                            </div>
                            <div className="upload-btn-group" style={{ display: 'flex', gap: '1rem' }}>
                                <label className="save-btn flex-center gap-2" style={{ cursor: 'pointer', margin: 0, background: '#444' }}>
                                    <Plus size={18} /> Public Image
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'public')} />
                                </label>
                                <label className="save-btn flex-center gap-2" style={{ cursor: 'pointer', margin: 0, background: '#a88132' }}>
                                    <Lock size={18} /> Premium Image
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'premium')} />
                                </label>
                            </div>
                        </div>

                        <div className="media-grid">
                            {(currentCreator.mediaImages || []).length === 0 && (currentCreator.premiumMedia || []).length === 0 && <p style={{ color: '#888' }}>No media uploaded yet. Start adding some!</p>}

                            {/* Public Images */}
                            {(currentCreator.mediaImages || []).map((imgUrl, i) => (
                                <div key={`public-${i}`} className="media-item">
                                    <img src={imgUrl} alt={`Media ${i}`} className="media-img" />
                                    <div className="media-actions">
                                        <span className={`media-badge public`}>Public</span>
                                        <button className="icon-btn" onClick={() => handleDeleteMedia(i)} style={{ background: 'rgba(255,0,0,0.7)' }}><Trash2 size={16} color="#fff" /></button>
                                    </div>
                                </div>
                            ))}

                            {/* Premium Images */}
                            {(currentCreator.premiumMedia || []).map((media, i) => (
                                <div key={`premium-${media.id}`} className="media-item">
                                    <img src={media.url} alt={`Premium ${i}`} className="media-img" />
                                    <div className="media-actions">
                                        <span className={`media-badge`} style={{ background: '#a88132', color: '#fff' }}>€{media.price}</span>
                                        <button className="icon-btn" onClick={() => handleDeletePremiumMedia(media.id)} style={{ background: 'rgba(255,0,0,0.7)' }}><Trash2 size={16} color="#fff" /></button>
                                    </div>
                                    <div style={{ position: 'absolute', top: 5, right: 5 }}><Lock size={20} color="#ffd700" /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'chat': {
                const selectedChat = myChats.find(c => c.id === selectedChatId) || myChats[0];

                return (
                    <div className="tab-pane animate-fade-in chat-layout">
                        <div className="chat-sidebar">
                            <div className="chat-header">
                                <h2>Messages</h2>
                            </div>
                            <div className="chat-list">
                                {myChats.length === 0 && <p style={{ padding: '1rem', color: '#888' }}>No messages yet.</p>}
                                {myChats.map(c => {
                                    const isActive = selectedChat?.id === c.id;
                                    const lastMsg = c.messages[c.messages.length - 1];
                                    return (
                                        <div key={c.id} className={`chat-list-item ${isActive ? 'active' : ''}`} onClick={() => setSelectedChatId(c.id)}>
                                            <div className="chat-avatar"></div>
                                            <div className="chat-preview">
                                                <div className="chat-name-row">
                                                    <h4>{c.clientName}</h4>
                                                </div>
                                                <p>{lastMsg ? lastMsg.text : 'New match!'}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        {selectedChat ? (
                            <div className="chat-main">
                                <div className="chat-main-header">
                                    <div className="flex-center gap-3">
                                        <div className="chat-avatar small"></div>
                                        <h3>{selectedChat.clientName}</h3>
                                    </div>
                                </div>
                                <div className="chat-messages">
                                    {selectedChat.messages.map(m => (
                                        <div key={m.id} className={`message ${m.senderId === currentCreator.id ? 'sent' : 'received'}`}>
                                            {m.text}
                                        </div>
                                    ))}
                                </div>
                                <div className="chat-input-area" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        {['❤️', '😍', '🔥', '😘', '🍆', '💦', '🍑'].map((emoji) => (
                                            <button
                                                key={emoji}
                                                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                                                onClick={() => setChatInput(prev => prev + emoji)}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            className="chat-input"
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && chatInput.trim()) {
                                                    e.preventDefault();
                                                    sendMessage(selectedChat.id, currentCreator.id, selectedChat.clientId, chatInput.trim());
                                                    setChatInput('');
                                                }
                                            }}
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            className="save-btn"
                                            onClick={() => {
                                                if (chatInput.trim()) {
                                                    sendMessage(selectedChat.id, currentCreator.id, selectedChat.clientId, chatInput.trim());
                                                    setChatInput('');
                                                }
                                            }}
                                        >Send</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="chat-main flex-center" style={{ color: '#aaa' }}>
                                <h3>Select a discussion to see details</h3>
                            </div>
                        )}
                    </div>
                );
            }
            case 'appointments':
                return (
                    <div className="tab-pane animate-fade-in">
                        <div className="admin-welcome">
                            <h1>Appointments</h1>
                            <p>Upcoming bookings and requests.</p>
                        </div>
                        <div className="appointments-list">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="appointment-card">
                                    <div className="app-date">
                                        <span className="app-day">1{i}</span>
                                        <span className="app-month">Oct</span>
                                    </div>
                                    <div className="app-details">
                                        <h4>Dinner Date with Client {i}</h4>
                                        <p>8:00 PM - 10:00 PM • Paris, FR</p>
                                    </div>
                                    <div className="app-status">
                                        {i === 1 ? <span className="badge badge-pending">Pending</span> : <span className="badge badge-confirmed">Confirmed</span>}
                                    </div>
                                    <div className="app-actions">
                                        <button className="save-btn outline">Details</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'earnings':
                return (
                    <div className="tab-pane animate-fade-in">
                        <div className="admin-welcome">
                            <h1>Earnings</h1>
                            <p>Track your revenue and payouts.</p>
                        </div>
                        <div className="admin-grid mb-4">
                            <div className="admin-card stats-card bg-dark text-white">
                                <h3>Available Balance</h3>
                                <div className="stat-val large">€1,250.00</div>
                                <button className="save-btn mt-4 w-100">Withdraw Funds</button>
                            </div>
                            <div className="admin-card stats-card">
                                <h3>Pending</h3>
                                <div className="stat-val">€400.00</div>
                                <p className="text-muted text-sm mt-2">Will clear in 3-5 days</p>
                            </div>
                            <div className="admin-card stats-card">
                                <h3>Lifetime Earned</h3>
                                <div className="stat-val">€14,800.00</div>
                            </div>
                        </div>
                        <div className="admin-card overflow-hidden">
                            <h3>Recent Transactions</h3>
                            <div className="table-responsive">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Oct 12, 2026</td>
                                            <td>Booking with Client 1</td>
                                            <td className="text-success fw-bold">+ €400.00</td>
                                            <td><span className="badge badge-confirmed">Completed</span></td>
                                        </tr>
                                        <tr>
                                            <td>Oct 10, 2026</td>
                                            <td>Withdrawal to Bank ****1234</td>
                                            <td className="fw-bold">- €850.00</td>
                                            <td><span className="badge badge-pending">Processed</span></td>
                                        </tr>
                                        <tr>
                                            <td>Oct 05, 2026</td>
                                            <td>Private Media Unlock</td>
                                            <td className="text-success fw-bold">+ €50.00</td>
                                            <td><span className="badge badge-confirmed">Completed</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (currentCreator) {
        return (
            <div className="admin-layout">
                {/* Mobile Header Overlay */}
                <div className="mobile-admin-header">
                    <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <img src="/logo-white.png" alt="B2Babe" style={{ height: '24px' }} />
                        <img src={currentCreator.imageUrl} alt="Avatar" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                        <span className="admin-badge">CREATOR</span>
                    </div>
                    <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                </div>

                {/* Sidebar overlay for mobile */}
                {isSidebarOpen && (
                    <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
                )}

                {/* Sidebar */}
                <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <div className="admin-brand">
                            <img src="/logo-white.png" alt="B2Babe" style={{ height: '24px' }} />
                            <span className="admin-badge">CREATOR</span>
                        </div>
                        <button className="close-sidebar d-desktop-none" onClick={() => setIsSidebarOpen(false)}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="sidebar-user">
                        <div className="sidebar-avatar">
                            <img src={currentCreator.imageUrl} alt="User" />
                        </div>
                        <div className="sidebar-user-info">
                            <div className="user-name">{currentCreator.name}</div>
                            <div className="user-status"><span className="status-dot"></span> Online</div>
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsSidebarOpen(false);
                                        if (item.id === 'profile') syncEditState();
                                    }}
                                >
                                    <Icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="sidebar-footer">
                        <button className="nav-item text-danger" onClick={() => {
                            logoutCreator();
                            logoutCreator();
                            navigate('/backoffice');
                        }}>
                            <LogOut size={20} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="admin-content-area">
                    {renderDashboardContent()}
                </main>
            </div>
        );
    }

    // Phone / OTP Code
    return (
        <div className="auth-page animate-fade-in">
            <Link to="/" className="auth-back">
                <ArrowLeft size={24} /> Back to Home
            </Link>

            <div className="auth-container">
                <div className="auth-brand">
                    <img src="/logo-white.png" alt="B2Babe Logo" className="auth-logo" />
                    <div className="auth-subtitle">CREATOR PORTAL</div>
                </div>

                <form className="auth-form" onSubmit={handleLoginSubmit}>
                    <div className="auth-icon-wrapper">
                        <ShieldCheck size={48} strokeWidth={1.5} color="#000" />
                    </div>

                    <h2 className="auth-title">{isRegistering ? `Apply: Step ${regStep} of 3` : 'Welcome Back'}</h2>
                    <p className="auth-desc">
                        {isRegistering
                            ? (regStep === 1 ? 'Step 1: Your essential account details.' : regStep === 2 ? 'Step 2: Contact and location details.' : 'Step 3: Tell us about yourself.')
                            : 'Enter your email and password to securely log in to your creator portal.'}
                    </p>

                    <div className="auth-input-group" style={{ flexDirection: 'column', gap: '1rem', background: 'transparent' }}>
                        {!isRegistering && (
                            <>
                                <input
                                    type="email"
                                    className="auth-input"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', background: '#f5f5f5', borderRadius: '12px', color: '#000' }}
                                    autoFocus
                                    required
                                />
                                <input
                                    type="password"
                                    className="auth-input"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', background: '#f5f5f5', borderRadius: '12px', color: '#000' }}
                                    required
                                />
                            </>
                        )}

                        {isRegistering && regStep === 1 && (
                            <>
                                <input
                                    type="text"
                                    className="auth-input"
                                    placeholder="Full Name"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    style={{ width: '100%', background: '#f5f5f5', borderRadius: '12px', color: '#000' }}
                                    required
                                />
                                <input
                                    type="email"
                                    className="auth-input"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', background: '#f5f5f5', borderRadius: '12px', color: '#000' }}
                                    required
                                />
                                <input
                                    type="password"
                                    className="auth-input"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', background: '#f5f5f5', borderRadius: '12px', color: '#000' }}
                                    required
                                />
                            </>
                        )}

                        {isRegistering && regStep === 2 && (
                            <>
                                <input
                                    type="text"
                                    className="auth-input"
                                    placeholder="Phone Number"
                                    value={regPhone}
                                    onChange={(e) => setRegPhone(e.target.value)}
                                    style={{ width: '100%', background: '#f5f5f5', borderRadius: '12px', color: '#000' }}
                                    required
                                />
                                <input
                                    type="text"
                                    className="auth-input"
                                    placeholder="Location (ex: Paris, FR)"
                                    value={regLocation}
                                    onChange={(e) => setRegLocation(e.target.value)}
                                    style={{ width: '100%', background: '#f5f5f5', borderRadius: '12px', color: '#000' }}
                                    required
                                />
                            </>
                        )}

                        {isRegistering && regStep === 3 && (
                            <>
                                <textarea
                                    className="auth-input"
                                    placeholder="A short bio about yourself..."
                                    value={regBio}
                                    onChange={(e) => setRegBio(e.target.value)}
                                    style={{ width: '100%', background: '#f5f5f5', borderRadius: '12px', color: '#000', resize: 'vertical', minHeight: '100px' }}
                                    required
                                />
                            </>
                        )}
                    </div>

                    <button type="submit" className="auth-btn w-100" style={{ marginTop: '1.5rem' }}>
                        {isRegistering ? (regStep < 3 ? 'Next Step' : 'Submit Application') : 'Secure Login'} <ArrowRight size={20} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isRegistering ? 'Already have an account? Login' : 'New creator? Apply here'}
                    </button>
                </form>
            </div>

            <div className="auth-pattern"></div>
        </div>
    );
};

export default Backoffice;
