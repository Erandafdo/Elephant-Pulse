import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User as UserIcon } from "lucide-react";
import visitorApi from "../utils/visitorApi";

export default function VisitorPublicPage() {
    const [status, setStatus] = useState({ open: false, text: "Loading..." });
    const [aiInsight, setAiInsight] = useState(null);
    const [liveEvents, setLiveEvents] = useState([]);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await visitorApi.get("/visitors/park-status");
                if (res.data.status === "success") {
                    setStatus({ open: res.data.park.is_open, text: res.data.park.status_text });
                    setAiInsight(res.data.ai_insight);
                }
            } catch (err) {
                setStatus({ open: false, text: "Park Status Unavailable" });
            }
        };
        const fetchEvents = async () => {
            try {
                const res = await visitorApi.get("/events/");
                if (res.data.status === "success") {
                    setLiveEvents(res.data.daily_timetable.slice(0, 3));
                }
            } catch (err) { }
        };
        checkStatus();
        fetchEvents();
        const interval = setInterval(() => {
            checkStatus();
            fetchEvents();
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ background: '#0D2B1A', color: '#FEFAE0', minHeight: '100vh' }}>
            {/* Hero Section */}
            <section style={{ height: '80vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1rem' }}>
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>Experience the Majesty of Pinnawala</h1>
                    <p style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#D4A373' }}>Witness the largest captive herd of wild Asian elephants in the world.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn" style={{ background: '#D4A373', padding: '1rem 2rem' }}>Buy Tickets</button>
                        <button className="btn btn-outline" style={{ padding: '1rem 2rem' }}>View Schedule</button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="glass-card">
                        <h2 style={{ color: status.open ? '#4caf50' : '#ff4081' }}>
                            Park {status.open ? 'Open' : 'Closed'}
                        </h2>
                        <p>{status.text}</p>
                    </div>
                    <div className="glass-card">
                        <h3>Best Time to Visit</h3>
                        <p style={{ fontSize: '2rem' }}>{aiInsight ? aiInsight.time : "Loading prediction..."}</p>
                        {aiInsight && <p style={{ color: '#4caf50' }}>{aiInsight.prediction}</p>}
                    </div>
                </div>
            </section>

            {/* Live Events Section */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 style={{ marginBottom: '2rem' }}>Live Experiences</h2>
                <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {liveEvents.map((evt, idx) => (
                        <div key={idx} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ color: '#D4A373' }}>{evt.category}</h4>
                                <h3>{evt.event_name}</h3>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p>{evt.current_count} Visitors</p>
                                <div style={{ width: '100px', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
                                    <div style={{ width: `${(evt.current_count / evt.capacity) * 100}%`, height: '100%', background: '#4caf50', borderRadius: '5px' }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
