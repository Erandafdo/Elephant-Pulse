import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation({ user, onLogout }) {
    const location = useLocation();

    // ✅ ALL hooks must be called at the top level — BEFORE any conditional returns
    const [isDarkMode, setIsDarkMode] = React.useState(true);

    const handleLogout = () => {
        if (onLogout) onLogout();
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    };

    // Hide main navigation on entry/exit pages or the separate Visitor system pages
    const hideOnPaths = ['/', '/login', '/visitor-login', '/visitor-admin', '/visitor-app'];
    if (hideOnPaths.includes(location.pathname)) {
        return null;
    }

    // Extract ID from path if present
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    const elephantId = !isNaN(lastPart) && lastPart !== '' ? lastPart : null;

    return (
        <nav className="glass-card" style={{ borderRadius: 0, padding: '1rem 2rem', borderLeft: 0, borderRight: 0, borderTop: 0, position: 'sticky', top: 0, zIndex: 100, marginBottom: '2rem' }}>
            <div className="container navbar" style={{ margin: 0, padding: 0, border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                    <div className="logo">Elephant <span>Care System</span></div>
                </Link>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        <Link
                            to="/dashboard"
                            className={`btn ${location.pathname === '/dashboard' ? 'btn-primary' : ''}`}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                color: location.pathname === '/dashboard' ? '#fff' : 'var(--text-muted)',
                                background: location.pathname === '/dashboard' ? 'var(--primary-accent)' : 'transparent',
                                border: 'none',
                                borderRadius: '6px'
                            }}
                        >
                            📊 Dashboard
                        </Link>
                        <Link
                            to={elephantId ? `/profile/${elephantId}` : "/profile"}
                            className={`btn ${(location.pathname.includes('/profile') || location.pathname === '/add' || location.pathname.includes('/edit')) ? 'btn-primary' : ''}`}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                color: (location.pathname.includes('/profile') || location.pathname === '/add' || location.pathname.includes('/edit')) ? '#fff' : 'var(--text-muted)',
                                background: (location.pathname.includes('/profile') || location.pathname === '/add' || location.pathname.includes('/edit')) ? 'var(--primary-accent)' : 'transparent',
                                border: 'none',
                                borderRadius: '6px'
                            }}
                        >
                            🐘 Health Profiles
                        </Link>
                        <Link
                            to={elephantId ? `/stress-detector/${elephantId}` : "/stress-detector"}
                            className={`btn ${location.pathname.includes('/stress-detector') ? 'btn-primary' : ''}`}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                color: location.pathname.includes('/stress-detector') ? '#fff' : 'var(--text-muted)',
                                background: location.pathname.includes('/stress-detector') ? '#ff4081' : 'transparent',
                                border: 'none',
                                borderRadius: '6px'
                            }}
                        >
                            🩺 Stress Detector
                        </Link>
                        <Link
                            to={elephantId ? `/food-chain/${elephantId}` : "/food-chain"}
                            className={`btn ${location.pathname.includes('/food-chain') ? 'btn-primary' : ''}`}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.9rem',
                                color: location.pathname.includes('/food-chain') ? '#fff' : 'var(--text-muted)',
                                background: location.pathname.includes('/food-chain') ? '#4caf50' : 'transparent',
                                border: 'none',
                                borderRadius: '6px'
                            }}
                        >
                            🌿 Food Chain
                        </Link>
                    </div>

                    <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>

                    <button
                        onClick={toggleTheme}
                        className="btn"
                        style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.5rem 0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', cursor: 'pointer' }}
                        title="Toggle dark/light mode"
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>

                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome, {user || 'Vet'}</span>
                    <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Logout</button>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;
