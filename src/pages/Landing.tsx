import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, MousePointer2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAppStore } from '../store';
import './Landing.css';

const Landing = () => {
    const scrollContainer = useRef<HTMLDivElement>(null);
    const { creators } = useAppStore();

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainer.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainer.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
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
                        <a href="#member" className="btn btn-solid">Member Access</a>
                        <Link to="/backoffice" className="btn btn-solid">Become a Creator</Link>
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
                    <div className="cta-left">
                        <img src="/male_member.png" alt="Member" className="cta-img" />
                        <div className="cta-left-mask"></div>
                        <MousePointer2 size={120} color="black" strokeWidth={2.5} className="cta-cursor" />
                    </div>

                    <div className="cta-right">
                        <img src="/female_creator.png" alt="Creator" className="cta-img" />
                        <div className="cta-right-content">
                            <button className="register-black-btn">Register</button>
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
                <div className="cta-bottom-row">
                    <div className="cta-bottom-left">MEMBER</div>
                    <div className="cta-bottom-right"><span className="cta-bottom-right-text">ACCESS</span></div>
                </div>
            </section>

        </div>
    );
};

export default Landing;
