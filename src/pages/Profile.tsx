import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Star, MessageCircle, Calendar, ShieldCheck, Heart, Grid, Lock, Unlock, X } from 'lucide-react';
import { useAppStore, MYPOS_PAYLINKS } from '../store';
import './Profile.css';

const Profile = () => {
    const id = useParams().id;
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { creators, currentClientId, chatSessions, sendMessage, clients, purchasePremiumMedia, rechargeWallet, subscribeToCreator } = useAppStore();

    // Find the correct profile from the store
    const profile = creators.find(p => p.id === id) || creators[0];

    const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Chat modal state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');

    // Recharge modal state
    const [isRechargeOpen, setIsRechargeOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const clientId = currentClientId || 'client-guest';
    const sessionId = `session-${profile.id}-${clientId}`;
    const session = chatSessions.find(s => s.id === sessionId);

    const handleSendMessage = () => {
        if (!chatInput.trim()) return;
        sendMessage(sessionId, clientId, profile.id, chatInput.trim());
        setChatInput('');
    };

    const clientProfile = clients.find(c => c.id === clientId);
    const isSubscribed = clientProfile?.subscribedCreators?.includes(profile.id) || false;

    const handlePurchaseMedia = (mediaId: string, price: number) => {
        if (!clientProfile) {
            alert("Please log in to purchase media.");
            return;
        }
        if (confirm(`Unlock this private media for €${price}?`)) {
            const success = purchasePremiumMedia(clientId, mediaId, price);
            if (success) {
                alert("Media unlocked! 🔓");
            } else {
                setIsRechargeOpen(true);
            }
        }
    };

    useEffect(() => {
        const success = searchParams.get('success');
        const amountStr = searchParams.get('amount');
        if (success === 'true' && amountStr && clientId) {
            const amount = Number(amountStr);
            if (!isNaN(amount) && amount > 0) {
                rechargeWallet(clientId, amount);
                alert(`Successfully added €${amount} to your wallet! ✅`);
                if (id) {
                    navigate(`/profile/${id}`, { replace: true });
                }
            }
        }
    }, [searchParams, clientId, rechargeWallet, navigate, id]);

    const handleRecharge = (amount: number) => {
        setIsProcessing(true);
        const payLink = MYPOS_PAYLINKS[amount];
        if (payLink) {
            // Redirect to myPOS PayLink Checkout
            window.location.assign(payLink);
        } else {
            setIsProcessing(false);
            alert("This recharge amount is not configured with a myPOS PayLink yet.");
        }
    };

    if (!profile) return <div>Profile not found</div>;

    return (
        <>
            <div className="profile-page animate-fade-in" style={{ position: 'relative' }}>
                <Link to="/explore" className="profile-back-btn">
                    <ArrowLeft size={30} strokeWidth={2.5} />
                </Link>

                <section className="profile-split-layout">
                    {/* Left Side: Hero Image */}
                    <div className="profile-split-left">
                        <img src={profile.imageUrl} alt={profile.name} className="profile-main-img" />

                        <div className="profile-stats-overlay">
                            <div className="overlay-stat"><Heart size={20} fill="currentColor" /> {profile.views * 12} Likes</div>
                            <div className="overlay-stat"><Grid size={20} /> {profile.mediaImages?.length || 0} Media</div>
                        </div>
                    </div>

                    {/* Right Side: Details & Actions */}
                    <div className="profile-split-right">
                        <div className="profile-details-scroll">

                            <div className="pd-header">
                                <h1 className="pd-name">
                                    {profile.name}
                                    {profile.status === 'active' && <ShieldCheck size={32} color="var(--primary)" fill="currentColor" stroke="white" className="vip-icon" style={{ marginLeft: '0.5rem' }} />}
                                </h1>
                                <div className="pd-meta">
                                    <div className="pd-meta-item"><MapPin size={18} /> {profile.location}</div>
                                    <div className="pd-meta-item text-yellow-500"><Star size={18} fill="currentColor" /> 4.9 (124)</div>
                                </div>
                            </div>

                            <p className="pd-bio">{profile.bio}</p>

                            <div className="pd-stats-row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div className="pd-stat-box"><span>Height</span><strong>{profile.height || '170 cm'}</strong></div>
                                <div className="pd-stat-box"><span>Weight</span><strong>{profile.weight || '54 kg'}</strong></div>
                                {profile.age && <div className="pd-stat-box"><span>Age</span><strong>{profile.age}</strong></div>}
                                {profile.measurements && <div className="pd-stat-box"><span>Figure</span><strong>{profile.measurements}</strong></div>}
                                <div className="pd-stat-box"><span>Eyes</span><strong>{profile.eyeColor || 'Brown'}</strong></div>
                                {profile.hairColor && <div className="pd-stat-box"><span>Hair</span><strong>{profile.hairColor}</strong></div>}
                            </div>

                            {/* Subscription & Action Cards */}
                            <div className="pd-actions">
                                <button className="pd-btn-subscribe">
                                    <span className="sub-price">€29.99</span>
                                    <span className="sub-text">/ month</span>
                                    <Unlock size={20} style={{ marginLeft: 'auto' }} />
                                </button>

                                <div className="pd-btn-row">
                                    {isSubscribed ? (
                                        <button className="pd-btn-secondary" onClick={() => setIsChatOpen(true)}>
                                            <MessageCircle size={20} /> Chat Now
                                        </button>
                                    ) : (
                                        <button className="pd-btn-secondary" style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                                            <Lock size={20} /> Free Message
                                        </button>
                                    )}
                                    <button className="pd-btn-secondary outline">
                                        <Lock size={20} /> Request Private
                                    </button>
                                </div>
                                {clientProfile && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <button
                                            className="pd-btn-secondary"
                                            onClick={() => setIsRechargeOpen(true)}
                                            style={{ background: '#222', borderColor: '#222', color: '#ffd700', width: '100%' }}
                                        >
                                            <Lock size={16} /> Wallet: €{clientProfile.balance}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FULL WIDTH SERVICES & MEDIA */}
                <section className="profile-full-width-section">
                    <div className="pd-section-title" style={{ marginTop: '2rem' }}>Available Services</div>
                    <div className="pd-services-grid">
                        {profile.services.meet.enabled && (
                            <div className="service-card">
                                <div className="sc-header">
                                    <div className="sc-title-block">
                                        <h4>MEET</h4>
                                        <div className="sc-price">{profile.services.meet.price ? `€${profile.services.meet.price}` : 'Price on request'} {profile.services.meet.price && <span>/ HOUR</span>}</div>
                                    </div>
                                    <Calendar className="sc-icon" size={56} strokeWidth={1.5} />
                                </div>
                                <hr />
                                <p className="sc-desc">In-person meeting for dinner, events, or companionship in {profile.location} area.</p>
                                <button className="sc-btn">BOOK NOW &rarr;</button>
                            </div>
                        )}

                        {profile.services.pic.enabled && (
                            <div className="service-card">
                                <div className="sc-header">
                                    <div className="sc-title-block">
                                        <h4>PIC</h4>
                                        <div className="sc-price">{profile.services.pic.price ? `€${profile.services.pic.price}` : 'Price on request'} {profile.services.pic.price && <span>/ PIC</span>}</div>
                                    </div>
                                    <Grid className="sc-icon" size={56} strokeWidth={1.5} />
                                </div>
                                <hr />
                                <p className="sc-desc">Exclusive & custom pictures sent directly to your private inbox.</p>
                                <button className="sc-btn">REQUEST PICS &rarr;</button>
                            </div>
                        )}

                        {profile.services.video.enabled && (
                            <div className="service-card">
                                <div className="sc-header">
                                    <div className="sc-title-block">
                                        <h4>VIDEO</h4>
                                        <div className="sc-price">{profile.services.video.price ? `€${profile.services.video.price}` : 'Price on request'} {profile.services.video.price && <span>/ VIDEO</span>}</div>
                                    </div>
                                    <Grid className="sc-icon" size={56} strokeWidth={1.5} />
                                </div>
                                <hr />
                                <p className="sc-desc">Personalized video clips tailored for you.</p>
                                <button className="sc-btn">REQUEST VIDEO &rarr;</button>
                            </div>
                        )}

                        {profile.services.chat.enabled && (
                            <div className="service-card">
                                <div className="sc-header">
                                    <div className="sc-title-block">
                                        <h4>CHAT</h4>
                                        <div className="sc-price">{profile.services.chat.price ? `€${profile.services.chat.price}` : 'Price on request'} {profile.services.chat.price && <span>/ MIN</span>}</div>
                                    </div>
                                    <MessageCircle className="sc-icon" size={56} strokeWidth={1.5} />
                                </div>
                                <hr />
                                <p className="sc-desc">Live text or voice chat. I'm online now!</p>
                                {isSubscribed ? (
                                    <button className="sc-btn" onClick={() => setIsChatOpen(true)}>START CHAT <MessageCircle size={16} fill="currentColor" /></button>
                                ) : (
                                    <button className="sc-btn" onClick={() => {
                                        if (clientProfile) {
                                            subscribeToCreator(clientId, profile.id);
                                            alert(`You are now subscribed to ${profile.name}! You can now chat.`);
                                        } else {
                                            alert("Please log in or register to subscribe.");
                                        }
                                    }} style={{ background: '#d4af37', color: '#000', border: 'none' }}>
                                        DISPO WITH SUBSCRIPTION <Lock size={16} fill="currentColor" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pd-media-tabs" style={{ marginTop: '2rem' }}>
                        <button className={`tab ${activeTab === 'images' ? 'active' : ''}`} onClick={() => setActiveTab('images')}>Images ({profile.mediaImages?.length + (profile.premiumMedia?.length || 0) || 0})</button>
                        <button className={`tab ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>Video (0)</button>
                    </div>

                    <div className="pm-grid" style={{ marginBottom: '2rem' }}>
                        {(profile.mediaImages || []).map((imgUrl, i) => (
                            <div
                                key={`public-${i}`}
                                className="pm-img-container"
                                style={{ aspectRatio: '1', width: '100%', overflow: 'hidden', borderRadius: '12px', cursor: 'pointer' }}
                                onClick={() => setSelectedImage(imgUrl)}
                            >
                                <img src={imgUrl} alt={`Media ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            </div>
                        ))}

                        {(profile.premiumMedia || []).map((media, i) => {
                            const isUnlocked = clientProfile?.purchasedMedia.includes(media.id);

                            return (
                                <div
                                    key={`premium-${media.id}`}
                                    className="pm-img-container"
                                    style={{
                                        aspectRatio: '1', width: '100%', overflow: 'hidden', borderRadius: '12px', cursor: 'pointer',
                                        position: 'relative'
                                    }}
                                    onClick={() => {
                                        if (isUnlocked) {
                                            setSelectedImage(media.url);
                                        } else {
                                            handlePurchaseMedia(media.id, media.price);
                                        }
                                    }}
                                >
                                    <img src={media.url} alt={`Premium Media ${i}`} style={{
                                        width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s',
                                        filter: isUnlocked ? 'none' : 'blur(15px) brightness(0.7)'
                                    }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                    {!isUnlocked && (
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: '#fff' }}>
                                            <Lock size={32} style={{ marginBottom: '0.5rem' }} />
                                            <span style={{ background: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 'bold' }}>Unblur for €{media.price}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {(profile.mediaImages?.length === 0 && (!profile.premiumMedia || profile.premiumMedia.length === 0)) && (
                            <>
                                <div className="pm-locked-item"><Lock size={32} color="#aaa" /></div>
                                <div className="pm-locked-item"><Lock size={32} color="#aaa" /></div>
                                <div className="pm-locked-item"><Lock size={32} color="#aaa" /></div>
                                <div className="pm-locked-item"><Lock size={32} color="#aaa" /></div>
                            </>
                        )}
                    </div>
                </section>
            </div>

            {/* Chat Overlay Modal */}
            {isChatOpen && (
                <div className="public-chat-modal" style={{
                    position: 'fixed', bottom: '2rem', right: '2rem',
                    width: '380px', height: '500px', background: '#fff',
                    borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column', zIndex: 1000
                }}>
                    <div className="chat-modal-header" style={{
                        padding: '1rem', background: '#000', color: '#fff',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderTopLeftRadius: '16px', borderTopRightRadius: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <img src={profile.imageUrl} alt={profile.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                            <span style={{ fontWeight: 700 }}>{profile.name}</span>
                        </div>
                        <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div className="chat-modal-messages" style={{
                        flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#f9f9f9'
                    }}>
                        {session?.messages.length ? (
                            session.messages.map((m) => (
                                <div key={m.id} style={{
                                    maxWidth: '80%', padding: '0.8rem 1rem', borderRadius: '12px',
                                    alignSelf: m.senderId === clientId ? 'flex-end' : 'flex-start',
                                    background: m.senderId === clientId ? '#000' : '#e2e8f0',
                                    color: m.senderId === clientId ? '#fff' : '#000',
                                    fontSize: '0.9rem'
                                }}>
                                    {m.text}
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', marginTop: '2rem', color: '#888' }}>
                                Send a message to {profile.name}!
                            </div>
                        )}
                    </div>

                    <div className="chat-modal-input" style={{
                        padding: '1rem', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', justifyContent: 'center' }}>
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
                                placeholder="Type..."
                                style={{
                                    flex: 1, padding: '0.8rem', border: '1px solid #ddd', borderRadius: '20px', outline: 'none'
                                }}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                style={{
                                    background: '#000', color: '#fff', border: 'none', borderRadius: '50%',
                                    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Fullscreen Modal */}
            {selectedImage && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.9)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column'
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '1rem' }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Zoomed media"
                        style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Recharge Wallet Modal */}
            {isRechargeOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 10001,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => !isProcessing && setIsRechargeOpen(false)}>
                    <div style={{
                        background: '#1e1e1e', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '90%',
                        border: '1px solid #333', color: 'white', position: 'relative', textAlign: 'center'
                    }} onClick={e => e.stopPropagation()}>

                        {!isProcessing && (
                            <button onClick={() => setIsRechargeOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        )}

                        <h2 style={{ marginBottom: '0.5rem', color: '#ffd700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Lock size={24} /> Recharge Wallet
                        </h2>
                        <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.9rem' }}>
                            Add funds securely to unlock private media, and chat. Current balance: <strong>€{clientProfile?.balance || 0}</strong>
                        </p>

                        {isProcessing ? (
                            <div style={{ padding: '2rem 0' }}>
                                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #333', borderTopColor: '#ffd700', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                                <p style={{ marginTop: '1rem', color: '#fff' }}>Connecting to myPOS...</p>
                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                {[20, 50, 100, 250].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => handleRecharge(amount)}
                                        style={{
                                            background: '#333', color: 'white', border: '1px solid #555', padding: '1rem',
                                            borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#444'}
                                        onMouseOut={e => e.currentTarget.style.background = '#333'}
                                    >
                                        Add €{amount}
                                    </button>
                                ))}
                            </div>
                        )}
                        <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                            🔒 Secure myPOS Checkout Integration
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;
