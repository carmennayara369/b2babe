import { useState } from 'react';
import { Eye, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import './Explore.css';

const Explore = () => {
    const { creators, currentClientId, loginClient, registerClient, logoutClient, clients } = useAppStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisteringClient, setIsRegisteringClient] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const filteredProfiles = creators.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="explore-page animate-fade-in">
            {/* Header */}
            <header className="explore-header">
                <Link to="/" className="b2-logo" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '120px' }}>
                        <img src="/logo-white.png" alt="B2Babe Logo" style={{ width: '100%', height: 'auto', filter: 'invert(1)' }} />
                        <div className="b2-logo-subtitle text-black" style={{ width: '100%', textAlign: 'center', marginTop: '0.2rem', fontSize: '0.7rem', textDecoration: 'none' }}>PHOTOS-VIDEOS-CHAT</div>
                    </div>
                </Link>
                <div className="header-actions">
                    {currentClientId === 'client-guest' || !currentClientId ? (
                        <button onClick={() => setIsLoginModalOpen(true)} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Client Login</button>
                    ) : (
                        <div className="header-auth-group">
                            <Link to="/client" style={{ fontSize: '0.9rem', color: '#666', textDecoration: 'none', fontWeight: 'bold' }}>
                                My Profile ({clients.find(c => c.id === currentClientId)?.name || 'Member'})
                            </Link>
                            <button onClick={logoutClient} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}>Logout</button>
                        </div>
                    )}
                    <Link to="/backoffice" className="nav-link">Creator Login</Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="explore-main container">

                {/* Title Section */}
                <div className="explore-title-section">
                    <div className="xplor-header">
                        <Eye size={36} strokeWidth={3} />
                        <h1>Xplor</h1>
                    </div>
                    <p className="explore-subtitle">Discover premium creators offering private photos, custom videos, and direct chat.</p>
                </div>

                {/* Filters Row */}
                <div className="explore-filters">
                    <div className="search-box">
                        <Search size={20} color="#666" />
                        <input
                            type="text"
                            placeholder="Search by name or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="filter-btn">
                        <Filter size={20} />
                        Filters
                    </button>
                </div>

                {/* Grid */}
                <div className="profiles-grid">
                    {filteredProfiles.map((profile) => (
                        <Link to={`/profile/${profile.id}`} key={profile.id} className="profile-card profile-card-explore">
                            {profile.vip && <div className="vip-badge" style={{ background: '#f59e0b', color: 'black' }}>VIP</div>}
                            <div className="profile-img-container">
                                <img src={profile.imageUrl} alt={profile.name} className="profile-img" />
                            </div>
                            <div className="profile-info">
                                <h3 className="profile-name" style={{ color: 'white' }}>{profile.name}</h3>
                                <div className="profile-tags-container">
                                    <span className={profile.services?.pic?.enabled ? 'service-active' : 'service-inactive'}>PIC</span>
                                    <span className={profile.services?.video?.enabled ? 'service-active' : 'service-inactive'}>VIDEO</span>
                                    <span className={profile.services?.chat?.enabled ? 'service-active' : 'service-inactive'}>CHAT</span>
                                </div>
                                <div className="profile-location">{profile.location}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredProfiles.length === 0 && (
                    <div className="no-results" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                        <p>No creators found matching your search.</p>
                    </div>
                )}
            </main>
            </div>

            {/* Client Login Modal */}
            {isLoginModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{isRegisteringClient ? 'Create Client Account' : 'Client Login'}</h2>
                            <button onClick={() => setIsLoginModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                        </div>
                        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            {isRegisteringClient ? 'Please fill in your details to create an account.' : 'Enter your email and password to access premium features.'}
                        </p>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (isRegisteringClient) {
                                if (name && email && password) {
                                    registerClient({ name, email, password });
                                    setIsLoginModalOpen(false);
                                }
                            } else {
                                if (email && password) {
                                    loginClient(email, password);
                                    setIsLoginModalOpen(false); // Can be kept open if login fails, but store.ts alert handles it for now
                                }
                            }
                        }}>
                            {isRegisteringClient && (
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', color: '#000' }}
                                    required
                                />
                            )}
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', color: '#000' }}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', border: '1px solid #ccc', borderRadius: '8px', boxSizing: 'border-box', color: '#000' }}
                                required
                            />
                            <button type="submit" style={{ width: '100%', padding: '1rem', background: '#000', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>
                                {isRegisteringClient ? 'Register' : 'Secure Login'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsRegisteringClient(!isRegisteringClient)}
                                style={{ width: '100%', marginTop: '1rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                {isRegisteringClient ? 'Already have an account? Login' : 'Need an account? Register'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Explore;
