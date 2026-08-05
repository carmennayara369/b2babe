import { useState } from 'react';
import { useAppStore } from '../../store';
import { ArrowLeft, User, DollarSign, Lock, CreditCard, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ClientProfile = () => {
    const { currentClientId, clients, updateClientProfile, logoutClient, rechargeWallet } = useAppStore();
    const navigate = useNavigate();

    const client = clients.find(c => c.id === currentClientId);

    const [name, setName] = useState(client?.name || '');
    const [email, setEmail] = useState(client?.email || '');
    const [password, setPassword] = useState('');
    const [isRechargeOpen, setIsRechargeOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleRecharge = (amount: number) => {
        setIsProcessing(true);
        setTimeout(() => {
            if (currentClientId) {
                rechargeWallet(currentClientId, amount);
            }
            setIsProcessing(false);
            setIsRechargeOpen(false);
            alert(`Successfully added €${amount} to your wallet! ✅`);
        }, 1500);
    };

    const handleSave = () => {
        if (currentClientId) {
            updateClientProfile(currentClientId, { name, email, password: password || client?.password });
            alert("Profile updated successfully");
        }
    };

    if (!client) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#fff' }}>
                <h2>Client not found or not logged in.</h2>
                <Link to="/explore" style={{ color: '#aaa' }}>Return to Xplor</Link>
            </div>
        );
    }

    return (
        <>
            <div style={{ backgroundColor: '#111', minHeight: '100vh', color: '#fff', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
                <Link to="/explore" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#aaa', textDecoration: 'none', marginBottom: '2rem' }}>
                    <ArrowLeft size={20} /> Back to Xplor
                </Link>

                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <h1 style={{ fontWeight: 900, fontSize: '2.5rem', margin: 0 }}>My Client Account</h1>

                    <div style={{ background: '#222', padding: '2rem', borderRadius: '12px' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
                            <User size={24} /> Profile Details
                        </h2>
                        <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '400px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#aaa', fontSize: '0.9rem' }}>New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
                                    placeholder="******"
                                />
                            </div>
                            <button onClick={handleSave} style={{ marginTop: '1rem', background: '#fff', color: '#000', padding: '0.8rem', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Save Profile
                            </button>
                        </div>
                    </div>

                    <div style={{ background: '#222', padding: '2rem', borderRadius: '12px' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
                            <DollarSign size={24} /> Wallet & Credits
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#333', padding: '1.5rem', borderRadius: '8px' }}>
                            <div>
                                <div style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Available Balance</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>€{client.balance}</div>
                            </div>
                            <button onClick={() => setIsRechargeOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#d4af37', color: '#000', padding: '1rem 2rem', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>
                                <CreditCard size={20} /> Add Funds
                            </button>
                        </div>
                    </div>

                    <div style={{ background: '#222', padding: '2rem', borderRadius: '12px' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem' }}>
                            <Lock size={24} /> Purchased Media
                        </h2>
                        {client.purchasedMedia.length === 0 ? (
                            <p style={{ color: '#888' }}>You haven't unlocked any private media yet.</p>
                        ) : (
                            <p style={{ color: '#888' }}>You have unlocked {client.purchasedMedia.length} private media items.</p>
                        )}
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <button
                            onClick={() => {
                                logoutClient();
                                navigate('/explore');
                            }}
                            style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
                        >
                            Sign out of Client Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Recharge Wallet Modal */}
            {
                isRechargeOpen && (
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
                                Add funds securely to unlock private media, and chat. Current balance: <strong>€{client?.balance || 0}</strong>
                            </p>

                            {isProcessing ? (
                                <div style={{ padding: '2rem 0' }}>
                                    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #333', borderTopColor: '#ffd700', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
                                    <p style={{ marginTop: '1rem', color: '#fff' }}>Connecting to Stripe...</p>
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
                                🔒 Secure Stripe Payment Sandbox
                            </p>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default ClientProfile;
