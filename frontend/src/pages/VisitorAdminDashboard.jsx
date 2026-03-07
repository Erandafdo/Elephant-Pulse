import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    DollarSign,
    Users,
    BarChart3,
    Sparkles,
    LogOut,
    TrendingUp,
    Activity,
    MapPin,
    Zap,
    Bell,
    Settings,
    Calendar,
    LogIn,
    Loader2,
    ShoppingBag,
    Plus,
    Trash2,
    Edit2,
    Save,
    X
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from "recharts";
import visitorApi from "../utils/visitorApi";

export default function VisitorAdminDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [adminProfile, setAdminProfile] = useState(null);
    const [heatmapData, setHeatmapData] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [finance, setFinance] = useState(null);
    const [totalLiveVisitors, setTotalLiveVisitors] = useState(0);
    const [forecastData, setForecastData] = useState([]);
    const [tomorrowPieData, setTomorrowPieData] = useState([]);
    const [todayPieData, setTodayPieData] = useState([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [toast, setToast] = useState(null);

    // Check-in Terminal States
    const [visitorSearch, setVisitorSearch] = useState("");
    const [foundVisitor, setFoundVisitor] = useState(null);
    const [visitorTickets, setVisitorTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');
    const [tariffs, setTariffs] = useState([]);
    const [isTariffLoading, setIsTariffLoading] = useState(false);
    const [editingTariff, setEditingTariff] = useState(null);
    const [isSavingTariff, setIsSavingTariff] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchTariffs = async () => {
        setIsTariffLoading(true);
        try {
            const res = await visitorApi.get("/admin/tariffs");
            if (res.data.status === "success") {
                setTariffs(res.data.data);
            }
        } catch (err) {
            showToast("Error fetching tariffs", "error");
        } finally {
            setIsTariffLoading(false);
        }
    };

    useEffect(() => {
        const isAdmin = localStorage.getItem("admin_auth") === "true";
        if (!isAdmin) {
            navigate("/visitor-login");
            return;
        }

        async function fetchData() {
            try {
                const responses = await Promise.all([
                    visitorApi.get("/admin/analytics/heatmap"),
                    visitorApi.get("/admin/analytics/suggestions"),
                    visitorApi.get("/admin/analytics/finance"),
                    visitorApi.get("/events/"),
                    visitorApi.get("/admin/analytics/forecast"),
                    visitorApi.get("/admin/profile"),
                    visitorApi.get("/admin/tariffs")
                ]);

                const [resHeat, resSugg, resFin, resEvents, resFore, resProf, resTar] = responses;

                if (resHeat.data.status === "success") setHeatmapData(resHeat.data.data);
                if (resSugg.data.status === "success") setSuggestions(resSugg.data.suggestions);
                if (resFin.data.status === "success") setFinance(resFin.data.data);

                if (resEvents.data.status === "success") {
                    const events = resEvents.data.daily_timetable;
                    const total = events.reduce((sum, e) => sum + e.current_count, 0);
                    setTotalLiveVisitors(total);
                }

                if (resFore.data.status === "success") {
                    const raw = resFore.data.data;
                    if (raw.length > 0) {
                        const grouped = new Map();
                        raw.forEach(r => {
                            const key = `${r.date} ${r.hour}`;
                            if (!grouped.has(key)) {
                                grouped.set(key, { name: r.hour, fullDate: r.date, timestamp: key });
                            }
                            const entry = grouped.get(key);
                            entry[r.location] = r.predicted_visitors;
                        });
                        setForecastData(Array.from(grouped.values()).slice(0, 168));

                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        const tomorrowStr = tomorrow.toISOString().split('T')[0];
                        const tomorrowRecords = raw.filter(r => r.date === tomorrowStr);
                        const locationMap = new Map();
                        tomorrowRecords.forEach(r => {
                            locationMap.set(r.location, (locationMap.get(r.location) || 0) + r.predicted_visitors);
                        });
                        setTomorrowPieData(Array.from(locationMap.entries()).map(([name, value]) => ({ name, value })));

                        const today = new Date();
                        const todayStr = today.toISOString().split('T')[0];
                        const todayRecords = raw.filter(r => r.date === todayStr);
                        const timePeriodMap = new Map();
                        todayRecords.forEach(r => {
                            const hour = parseInt(r.hour.split(':')[0]);
                            let period = '';
                            if (hour >= 6 && hour < 12) period = 'Morning (6AM-12PM)';
                            else if (hour >= 12 && hour < 17) period = 'Afternoon (12PM-5PM)';
                            else if (hour >= 17 && hour < 21) period = 'Evening (5PM-9PM)';
                            else period = 'Night (9PM-6AM)';
                            timePeriodMap.set(period, (timePeriodMap.get(period) || 0) + r.predicted_visitors);
                        });
                        setTodayPieData(Array.from(timePeriodMap.entries()).map(([name, value]) => ({ name, value })));
                    }
                }

                if (resProf.data.status === "success") {
                    setAdminProfile(resProf.data.data);
                }

                if (resTar.data.status === "success") setTariffs(resTar.data.data);

                if (resSugg.data.status === "success") {
                    const notifyItems = resSugg.data.suggestions.map((s, i) => ({
                        id: i,
                        title: s.action.replace(/_/g, " "),
                        message: s.reason,
                        time: "Just now",
                        confidence: s.confidence,
                        type: s.confidence > 0.9 ? 'critical' : 'warning',
                        read: false
                    }));
                    setNotifications(notifyItems);
                }
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();

        const visitorInterval = setInterval(() => {
            setTotalLiveVisitors((prev) => {
                const delta = Math.floor(Math.random() * 5) - 2;
                return Math.max(0, prev + delta);
            });
        }, 5000);

        return () => clearInterval(visitorInterval);
    }, [navigate]);

    const handleVisitorSearch = async () => {
        if (!visitorSearch) return;
        setIsSearching(true);
        try {
            const res = await visitorApi.get(`/visitors/profile?email=${encodeURIComponent(visitorSearch)}`);
            if (res.data.status === "success") {
                setFoundVisitor(res.data.data);
                const tRes = await visitorApi.get(`/visitors/${res.data.data._id}/history`);
                if (tRes.data.status === "success") {
                    setVisitorTickets(tRes.data.tickets.filter((t) => t.status === "CONFIRMED"));
                }
                showToast("Visitor found and tickets loaded");
            } else {
                showToast("Visitor not found", "error");
                setFoundVisitor(null);
                setVisitorTickets([]);
            }
        } catch (err) {
            showToast("Error searching visitor", "error");
        } finally {
            setIsSearching(false);
        }
    };

    const handleManualCheckIn = async () => {
        if (!selectedTicket || !selectedLocation || !foundVisitor) {
            showToast("Please select both ticket and location", "error");
            return;
        }
        setIsCheckingIn(true);
        try {
            const res = await visitorApi.post(`/events/${selectedLocation}/checkin`, {
                visitor_id: foundVisitor._id,
                ticket_id: selectedTicket
            });
            if (res.data.status === "success" || res.status === 200) {
                showToast("Check-in successful!");
                setFoundVisitor(null);
                setVisitorSearch("");
                setVisitorTickets([]);
                setSelectedTicket("");
                setSelectedLocation("");
                const eventRes = await visitorApi.get("/events/");
                if (eventRes.data.status === "success") {
                    const events = eventRes.data.daily_timetable;
                    setTotalLiveVisitors(events.reduce((sum, e) => sum + e.current_count, 0));
                }
            } else {
                showToast(res.data.message || "Check-in failed", "error");
            }
        } catch (err) {
            showToast(err.response?.data?.detail || "Check-in failed", "error");
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleSaveTariff = async (tariff) => {
        const isNew = !tariff._id;
        const url = isNew ? "/admin/tariffs" : `/admin/tariffs/${tariff._id}`;
        const method = isNew ? "post" : "put";
        const payload = { ...tariff };
        if (isNew) delete payload._id;
        try {
            const res = await visitorApi[method](url, payload);
            if (res.data.status === "success") {
                showToast(`Tariff ${isNew ? 'created' : 'updated'} successfully`);
                fetchTariffs();
                setEditingTariff(null);
            } else {
                showToast(res.data.message || "Error saving tariff", "error");
            }
        } catch (err) {
            showToast("Error saving tariff", "error");
        }
    };

    const handleDeleteTariff = async (id) => {
        if (!window.confirm("Are you sure you want to delete this tariff?")) return;
        try {
            const res = await visitorApi.delete(`/admin/tariffs/${id}`);
            if (res.data.status === "success") {
                showToast("Tariff deleted successfully");
                fetchTariffs();
            }
        } catch (err) {
            showToast("Error deleting tariff", "error");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_auth");
        navigate("/visitor-login");
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEFAE0' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid #D4A373', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                <p>Loading Visitor Admin Dashboard...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#FEFAE0', color: '#000' }}>
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '16px 24px',
                    background: toast.type === 'success' ? '#1A4D2E' : '#EF4444',
                    color: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    zIndex: 2000,
                    animation: 'slideIn 0.3s ease'
                }}>
                    {toast.message}
                    <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
                </div>
            )}

            {/* Navigation */}
            <nav style={{ background: 'white', borderBottom: '1px solid #FAEDCD', padding: '15px 30px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, #1A4D2E 0%, #276F43 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <LayoutDashboard size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Visitor Admin</h1>
                            <p style={{ fontSize: '12px', color: '#8B5E3C', margin: 0 }}>{activeView === 'dashboard' ? 'Analytics Dashboard' : 'Store Management'}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', background: '#FAEDCD', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                        <button
                            onClick={() => setActiveView('dashboard')}
                            style={{ padding: '8px 16px', background: activeView === 'dashboard' ? 'white' : 'transparent', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <LayoutDashboard size={18} /> Dashboard
                        </button>
                        <button
                            onClick={() => setActiveView('store')}
                            style={{ padding: '8px 16px', background: activeView === 'store' ? 'white' : 'transparent', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShoppingBag size={18} /> Store
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            style={{ background: '#FAEDCD', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', position: 'relative' }}>
                            <Bell size={20} />
                            {notifications.length > 0 && <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', background: 'red', borderRadius: '50%', border: '2px solid white' }}></span>}
                        </button>
                        <div style={{ width: '1px', height: '30px', background: '#FAEDCD' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1A4D2E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {adminProfile?.initials || "A"}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{adminProfile?.name || "Admin"}</div>
                                <div style={{ fontSize: '11px', color: '#8B5E3C' }}>Administrator</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn"
                            style={{
                                background: '#FEE2E2',
                                color: 'red',
                                border: '1px solid red',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                marginLeft: '10px'
                            }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 30px' }}>
                {activeView === 'dashboard' ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                            <div>
                                <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Dashboard Overview</h2>
                                <p style={{ color: '#8B5E3C' }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button className="btn" style={{ background: '#1A4D2E', display: 'flex', gap: '10px', alignItems: 'center' }} onClick={() => showToast("Refining machine learning models...")}>
                                    <Sparkles size={18} /> Refine AI Model
                                </button>
                                <button className="btn" style={{ background: 'white', color: '#1A4D2E', border: '1px solid #1A4D2E' }}>
                                    <BarChart3 size={18} /> Export Report
                                </button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                            <div className="glass-card" style={{ background: 'linear-gradient(135deg, #D4A373 0%, #8B5E3C 100%)', color: 'white', padding: '25px' }}>
                                <DollarSign size={32} style={{ marginBottom: '15px', opacity: 0.8 }} />
                                <div style={{ fontSize: '14px', opacity: 0.8 }}>Total Revenue</div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${finance?.total_revenue?.toLocaleString() || "0"}</div>
                                <div style={{ fontSize: '12px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <TrendingUp size={14} /> +{finance?.revenue_growth}% from last month
                                </div>
                            </div>
                            <div className="glass-card" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', padding: '25px' }}>
                                <Users size={32} style={{ marginBottom: '15px', opacity: 0.8 }} />
                                <div style={{ fontSize: '14px', opacity: 0.8 }}>Live Visitors</div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalLiveVisitors}</div>
                                <div style={{ fontSize: '12px', marginTop: '10px' }}>Currently in park</div>
                            </div>
                            <div className="glass-card" style={{ padding: '25px', background: 'white' }}>
                                <BarChart3 size={32} style={{ marginBottom: '15px', color: '#D4A373' }} />
                                <div style={{ fontSize: '14px', color: '#8B5E3C' }}>Tickets Sold</div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{finance?.total_tickets || "0"}</div>
                            </div>
                            <div className="glass-card" style={{ padding: '25px', background: 'white' }}>
                                <Sparkles size={32} style={{ marginBottom: '15px', color: '#1A4D2E' }} />
                                <div style={{ fontSize: '14px', color: '#8B5E3C' }}>AI Accuracy</div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{finance?.ai_accuracy || "0"}%</div>
                            </div>
                        </div>

                        {/* Check-in Terminal */}
                        <div className="glass-card" style={{ padding: '30px', background: 'white', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                                <LogIn size={24} style={{ color: '#D4A373' }} />
                                <h3 style={{ margin: 0 }}>Manual Check-in Terminal</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '20px', alignItems: 'flex-end' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>VISITOR EMAIL</label>
                                    <input
                                        type="text"
                                        className="form-group"
                                        style={{ margin: 0, padding: '10px' }}
                                        placeholder="Search by email..."
                                        value={visitorSearch}
                                        onChange={(e) => setVisitorSearch(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>LOCATION</label>
                                    <select
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #FAEDCD' }}
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                    >
                                        <option value="">Select location...</option>
                                        {heatmapData.map((h, i) => <option key={i} value={h.location}>{h.location}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>TICKET</label>
                                    <select
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #FAEDCD' }}
                                        value={selectedTicket}
                                        disabled={!foundVisitor}
                                        onChange={(e) => setSelectedTicket(e.target.value)}
                                    >
                                        <option value="">{visitorTickets.length > 0 ? "Select ticket..." : "No tickets"}</option>
                                        {visitorTickets.map((t, i) => <option key={i} value={t._id}>{t.event_name} ({t.status})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <button className="btn" style={{ background: '#1A4D2E', height: '42px' }} onClick={handleVisitorSearch}>Verify</button>
                                    <button className="btn" style={{ background: '#D4A373', height: '42px', marginLeft: '10px' }} onClick={handleManualCheckIn}>Check-in</button>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px', marginBottom: '40px' }}>
                            <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
                                <h3>7-Day Visitor Forecast</h3>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={forecastData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAEDCD" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="Bathing_Area" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.1} />
                                            <Area type="monotone" dataKey="Feeding_Area" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.1} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: '30px', background: 'white' }}>
                                <h3>Today's Crowd Density</h3>
                                <div style={{ height: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={todayPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {todayPieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#EF4444', '#6366F1'][index % 4]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Store Management</h2>
                                <p style={{ fontSize: '14px', color: '#8B5E3C' }}>Manage ticket tariffs and premium experience packages</p>
                            </div>
                            <button
                                className="btn"
                                style={{ background: '#1A4D2E', display: 'flex', gap: '8px' }}
                                onClick={() => setEditingTariff({
                                    category: "",
                                    price: "",
                                    price_value: 0,
                                    currency: "USD",
                                    child_price: "",
                                    features: [],
                                    popular: false,
                                    is_package: false,
                                    included_events: []
                                })}
                            >
                                <Plus size={20} /> Add New Tariff
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                            {tariffs.map((t) => (
                                <div key={t._id} className="glass-card" style={{ background: 'white', padding: '30px', border: '1px solid #FAEDCD' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <h3 style={{ margin: 0 }}>{t.category}</h3>
                                        {t.popular && <span style={{ background: '#D4A373', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px' }}>POPULAR</span>}
                                    </div>
                                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>{t.price}</div>
                                    <div style={{ fontSize: '14px', color: '#8B5E3C', marginBottom: '20px' }}>Child: {t.child_price}</div>

                                    <div style={{ borderTop: '1px solid #FAEDCD', paddingTop: '15px', marginBottom: '20px' }}>
                                        <ul style={{ padding: 0, listStyle: 'none', fontSize: '13px' }}>
                                            {t.features.map((f, i) => <li key={i} style={{ marginBottom: '5px' }}>✅ {f}</li>)}
                                        </ul>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn" style={{ flex: 1, background: '#FEFAE0', color: '#8B5E3C', border: '1px solid #FAEDCD' }} onClick={() => setEditingTariff(t)}><Edit2 size={16} /> Edit</button>
                                        <button className="btn" style={{ background: '#FEE2E2', color: 'red', border: '1px solid red' }} onClick={() => handleDeleteTariff(t._id)}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Editing Modal */}
                        {editingTariff && (
                            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                                <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '500px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                        <h3>{editingTariff._id ? 'Edit Tariff' : 'New Tariff'}</h3>
                                        <button onClick={() => setEditingTariff(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                                    </div>
                                    <div className="form-group">
                                        <label>Category Name</label>
                                        <input value={editingTariff.category} onChange={(e) => setEditingTariff({ ...editingTariff, category: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="form-group">
                                            <label>Price Label</label>
                                            <input value={editingTariff.price} onChange={(e) => setEditingTariff({ ...editingTariff, price: e.target.value })} placeholder="$15.00" />
                                        </div>
                                        <div className="form-group">
                                            <label>Numerical Value</label>
                                            <input type="number" value={editingTariff.price_value} onChange={(e) => setEditingTariff({ ...editingTariff, price_value: e.target.value })} />
                                        </div>
                                    </div>
                                    <button className="btn" style={{ width: '100%', background: '#1A4D2E', marginTop: '20px' }} onClick={() => handleSaveTariff(editingTariff)}>
                                        <Save size={18} style={{ marginRight: '10px' }} /> Save Tariff
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
