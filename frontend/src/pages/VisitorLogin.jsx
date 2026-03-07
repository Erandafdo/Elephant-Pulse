import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import visitorApi from "../utils/visitorApi";

export default function VisitorLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("admin@pinnawala.lk");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await visitorApi.post("/admin/login", { email, password });

            if (res.data.status === "success") {
                localStorage.setItem("admin_auth", "true");
                navigate("/visitor-admin");
            } else {
                setError(res.data.message || "Invalid credentials. Try 'admin123'");
                setLoading(false);
            }
        } catch (err) {
            setError("Server connection failed. Make sure the Visitor backend is running on port 8000.");
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: '#FEFAE0'
        }}>
            <div style={{ width: '100%', maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        margin: '0 auto 20px',
                        borderRadius: '18px',
                        background: 'linear-gradient(135deg, #1A4D2E 0%, #276F43 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(13, 43, 26, 0.2)'
                    }}>
                        <Lock style={{ width: '35px', height: '35px', color: 'white' }} />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0D2B1A', margin: '0 0 8px 0' }}>
                        Visitor Admin Portal
                    </h1>
                </div>
                <div className="glass-card" style={{ padding: '40px', background: 'white' }}>
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', color: '#000' }}>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', color: '#000' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
                                required
                            />
                        </div>
                        {error && (
                            <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn"
                            style={{ width: '100%', background: '#1A4D2E' }}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <Link to="/" style={{ color: '#1A4D2E', textDecoration: 'none', fontWeight: '500' }}>← Back to home portal</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
