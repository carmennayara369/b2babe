import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Eye, MousePointer2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAppStore } from '../store';
import './Landing.css';

const Landing = () => {
    const scrollContainer = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { creators, currentClientId, loginClient, registerClient, logoutClient } = useAppStore();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisteringClient, setIsRegisteringClient] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainer.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainer.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <>
            <div className="landing-page animate-fade-in">

            {/* HERO SECTION */}
            <section className="hero-section">
                <div className="hero-left">
                    <img src="/hero_model.png" alt="Hero Model" className="hero-img" />
                    <div className="hero-brand">
                        <div style={{ display: 'flex', flexDirection: 'column', width: '200px' }}>
                            <img src="/logo-white.png" alt="B2Babe Logo" style={{ width: '100%', height: 'auto' }} />
                            <div className="b2-logo-subtitle" style={{ color: '#fff', textShadow: 'none', width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>PHOTOS-VIDEOS-CHAT</div>
                        </div>
                    </div>
                </div>

                <div className="hero-right">
                    <h1 className="hero-title">
                        <span className="hover-word">Pic</span><br />
                        <span className="hover-word">Video</span><br />
                        <span className="hover-word">Chat</span>
                    </h1>
                    <div className="hero-actions">
                        <div className="play-icon">
                            <Play size={40} fill="black" />
                        </div>
                        {currentClientId && currentClientId !== 'client-guest' ? (
                            <>
                                <Link to="/client" className="btn btn-solid">My Profile</Link>
                                <button onClick={logoutClient} className="btn btn-solid" style={{ background: '#ef4444', borderColor: '#ef4444', color: '#fff', cursor: 'pointer' }}>Logout</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsLoginModalOpen(true)} className="btn btn-solid" style={{ cursor: 'pointer' }}>Member Access</button>
                                <Link to="/backoffice" className="btn btn-solid">Become a Creator</Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* HORIZONTAL DIVIDER */}
            <div className="dashed-divider"></div>

            {/* DIRECTORY SECTION */}
            <section className="directory-section container">
                <div className="directory-content">

                    <div className="directory-branding">
                        <div className="xplor-group" style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}>
                            <Link to="/explore" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="xplor-text">
                                    <Eye size={48} strokeWidth={3} />
                                    xplor
                                </div>
                            </Link>
                            <Link to="/explore" className="btn btn-solid" style={{ width: '100%', textAlign: 'center', marginBottom: '2rem' }}>
                                See all creators
                            </Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '200px' }}>
                            <img src="/logo.png" alt="B2Babe Logo" style={{ width: '100%', height: 'auto' }} />
                            <div className="b2-logo-subtitle text-black" style={{ width: '100%', textAlign: 'center', margin: '0.5rem 0 2rem 0' }}>PHOTOS-VIDEOS-CHAT</div>
                        </div>
                    </div>

                    <div className="cards-slider-wrapper">
                        <button className="slider-arrow left" onClick={() => scroll('left')}>
                            <ChevronLeft size={32} />
                        </button>
                        <div className="cards-container" ref={scrollContainer}>
                            {creators.slice(0, 8).map((profile) => (
                                <Link to={`/profile/${profile.id}`} key={profile.id} className="profile-card" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                        <button className="slider-arrow right" onClick={() => scroll('right')}>
                            <ChevronRight size={32} />
                        </button>
                    </div>

                </div>
            </section>

            {/* HORIZONTAL DIVIDER */}
            <div className="dashed-divider"></div>

            {/* CTA SPLIT SECTION */}
            <section className="cta-section" id="member">
                <div className="cta-images-row">
                    <div 
                        className="cta-left" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            if (currentClientId && currentClientId !== 'client-guest') {
                                navigate('/client');
                            } else {
                                setIsLoginModalOpen(true);
                            }
                        }}
                    >
                        <img src="/male_member.png" alt="Member" className="cta-img" />
                        <div className="cta-left-mask"></div>
                        <MousePointer2 size={120} color="black" strokeWidth={2.5} className="cta-cursor" />
                    </div>

                    <div className="cta-right">
                        <img src="/female_creator.png" alt="Creator" className="cta-img" />
                        <div className="cta-right-content">
                            <button 
                                className="register-black-btn"
                                onClick={() => navigate('/backoffice')}
                            >
                                Register
                            </button>
                            <div className="creator-heading">
                                BECOME<br />
                                <div className="creator-sub"><span className="creator-sub-a">a</span> Creator</div>
                            </div>
                            <div className="premium-text">
                                <span className="premium-stars">★★★★</span>
                                PREMIUM
                            </div>
                        </div>
                    </div>
                </div>
                <div 
                    className="cta-bottom-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                        if (currentClientId && currentClientId !== 'client-guest') {
                            navigate('/client');
                        } else {
                            setIsLoginModalOpen(true);
                        }
                    }}
                >
                    <div className="cta-bottom-left">MEMBER</div>
                    <div className="cta-bottom-right"><span className="cta-bottom-right-text">ACCESS</span></div>
                </div>
            </section>
            </div>

            {/* Client Login Modal */}
            {isLoginModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#000' }}>{isRegisteringClient ? 'Create Client Account' : 'Client Login'}</h2>
                            <button onClick={() => setIsLoginModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#000' }}>&times;</button>
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
                                    navigate('/client');
                                }
                            } else {
                                if (email && password) {
                                    const ok = loginClient(email, password);
                                    if (ok) {
                                        setIsLoginModalOpen(false);
                                        setPassword('');
                                        navigate('/client');
                                    }
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

export default Landing;
