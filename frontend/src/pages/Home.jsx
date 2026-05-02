import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="landing-page">
            <header className="hero-section">
                <div className="container hero-content">
                    <h1>Integrated AI Solution for <br /><span>Elephant Orphanage</span></h1>
                    <p>A multi-dimensional monitoring system designed to protect our gentle giants through healthcare AI and optimize visitor experiences through analytics.</p>
                    <div className="hero-buttons">
                        <Link to="/login" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            🐘 Vet Portal
                        </Link>
                        <a href="http://localhost:3001" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            👁️ Admin Portal
                        </a>
                        <a href="http://localhost:3000" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            🎟️ Visitor App
                        </a>
                    </div>
                </div>
            </header>

            <section id="features" className="features-section">
                <div className="container">
                    <h2 className="section-title">How to Use the System</h2>
                    <div className="feature-grid">
                        <div className="feature-card">
                            <div className="icon">🩺</div>
                            <h3>Vet Portal (Care System)</h3>
                            <p>Log in using a registered veterinarian account. Manage elephant profiles, log daily vitals, predict health statuses via AI, and generate tailored food plans.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon">⚙️</div>
                            <h3>Admin Portal (Management)</h3>
                            <p>Access the centralized dashboard to review live park analytics, update ticket pricing, monitor revenue, and manage visitor flows in real-time.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon">📱</div>
                            <h3>Visitor App (Public)</h3>
                            <p>A mobile-friendly application for guests. Register an account to book tickets, check current park crowding, and follow the timeline of events.</p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="landing-footer">
                <div className="container">
                    <p>&copy; 2025 Elephant Orphanage. Powered by AI.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
