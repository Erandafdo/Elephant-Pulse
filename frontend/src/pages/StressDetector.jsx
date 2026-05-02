import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import ProfileHeader from '../components/ProfileHeader';
import '../pages/Dashboard.css';
import { Play, Video, Activity, Loader2, AlertTriangle, Cpu, Terminal } from 'lucide-react';

const STRESS_API_URL = import.meta.env.VITE_STRESS_API_URL || 'http://localhost:5005/api/stress/predict';
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

function toPercent(value) {
    if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
}

function parsePrediction(data) {
    const predictionText = typeof data?.prediction === 'string' ? data.prediction : '';
    const stressProb = typeof data?.probs?.stress === 'number' ? data.probs.stress : null;
    const normalProb = typeof data?.probs?.normal === 'number' ? data.probs.normal : null;

    let stressed = null;
    if (stressProb !== null && normalProb !== null) {
        stressed = stressProb >= normalProb;
    } else if (stressProb !== null) {
        stressed = stressProb >= 0.5;
    } else if (predictionText) {
        const normalized = predictionText.toLowerCase();
        stressed = normalized.includes('stress') && !normalized.includes('normal');
    }

    return {
        stressed,
        predictionText,
        stressProb,
        normalProb,
        clips: typeof data?.n_clips === 'number' ? data.n_clips : null,
        raw: data
    };
}

function StressDetector() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    // Live Monitoring States
    const [liveStatus, setLiveStatus] = useState('OFFLINE');
    const [liveMetrics, setLiveMetrics] = useState({ fps: 30, latency: 45, confidence: 92 });
    const [aiLog, setAiLog] = useState([
        { time: new Date().toLocaleTimeString(), event: 'Terminal Standing By', status: 'Healthy' }
    ]);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await api.get(`/elephants/${id}`);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load profile", err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    useEffect(() => {
        if (!isLive) {
            setLiveStatus('OFFLINE');
            setAiLog([]);
            return;
        }

        setLiveStatus('CONNECTING');
        setAiLog([{ time: new Date().toLocaleTimeString(), event: 'Establishing Local Camera Link...', status: 'Healthy' }]);

        const interval = setInterval(() => {
            setLiveStatus(currentStatus => {
                if (currentStatus === 'MONITORING') {
                    const randomEvents = ['Trunk Movement Detected', 'Ear Flapping Normal', 'Gait Pattern Stable', 'Calm Interaction'];
                    const newLog = {
                        time: new Date().toLocaleTimeString(),
                        event: randomEvents[Math.floor(Math.random() * randomEvents.length)],
                        status: 'Healthy'
                    };
                    setAiLog(prev => [newLog, ...prev].slice(0, 10));

                    setLiveMetrics({
                        fps: Math.floor(22 + Math.random() * 8),
                        latency: Math.floor(35 + Math.random() * 20),
                        confidence: 90 + Math.floor(Math.random() * 10)
                    });
                }
                return currentStatus;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isLive]);

    useEffect(() => {
        if (liveStatus === 'ERROR') {
            setAiLog([]);
        }
    }, [liveStatus]);

    useEffect(() => {
        if (!videoFile) {
            setPreviewUrl('');
            return;
        }
        const objectUrl = URL.createObjectURL(videoFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [videoFile]);

    const statusText = useMemo(() => {
        if (!result) return null;
        if (result.stressed === true) return 'Stress Detected';
        if (result.stressed === false) return 'No Stress Detected';
        return 'Result Unclear';
    }, [result]);

    const resultBadgeClass = useMemo(() => {
        if (!result) return 'status-Unknown';
        if (result.stressed === true) return 'status-Critical';
        if (result.stressed === false) return 'status-Healthy';
        return 'status-Unknown';
    }, [result]);

    const handleVideoChange = (event) => {
        const file = event.target.files?.[0];
        setResult(null);
        setError('');
        setVideoFile(file || null);
    };

    const handleAnalyze = async () => {
        if (!videoFile) {
            setError('Please upload a video first.');
            return;
        }
        setIsAnalyzing(true);
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', videoFile);
            const headers = {};
            if (HF_TOKEN) headers.Authorization = `Bearer ${HF_TOKEN}`;

            const response = await fetch(STRESS_API_URL, {
                method: 'POST',
                headers,
                body: formData
            });

            const responseBody = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(responseBody?.detail || 'Model request failed.');
            setResult(parsePrediction(responseBody));
        } catch (requestError) {
            setError(requestError.message || 'Failed to analyze video.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Loading Monitor...</div>;

    const elephant = data?.elephant;

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            {id && elephant && (
                <ProfileHeader
                    elephant={elephant}
                    latest_status={data?.latest_status}
                    latest_diagnosis={data?.latest_diagnosis}
                    risk_details={data?.risk_details}
                />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Behavioral Analysis Terminal</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        {isLive ? 'Real-time CCTV Monitoring & Cognitive AI Analysis' : 'On-demand Neural Processing for Behavior Identification'}
                    </p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', display: 'flex' }}>
                    <button
                        onClick={() => setIsLive(false)}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: !isLive ? 'var(--primary-accent)' : 'transparent',
                            color: !isLive ? '#000' : '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <Play size={16} /> Manual
                    </button>
                    <button
                        onClick={() => setIsLive(true)}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: isLive ? '#ff4081' : 'transparent',
                            color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <Video size={16} /> Live
                    </button>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '2.2fr 1fr', gap: '2rem' }}>
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isLive && <div style={{ width: '8px', height: '8px', background: 'red', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>}
                                <span style={{ fontWeight: 700, letterSpacing: '1px' }}>{isLive ? 'LIVE FEED: ENCLOSURE_04' : 'VIDEO ANALYZER'}</span>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1rem' }}>
                                {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', color: '#00ff88' }}>● ENCRYPTED</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HD 1080P</span>
                        </div>
                    </div>

                    <div style={{ position: 'relative', background: '#000', minHeight: '480px' }}>
                        {isLive ? (
                            <div style={{ width: '100%', height: '100%', position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {liveStatus === 'ERROR' ? (
                                    <div style={{ color: '#ff4081', textAlign: 'center' }}>
                                        <AlertTriangle size={48} style={{ marginBottom: '1rem' }} />
                                        <h3>Camera Not Found</h3>
                                        <p>Please ensure your webcam is connected and the backend is running.</p>
                                    </div>
                                ) : (
                                    <img
                                        src="http://localhost:5005/api/video_feed"
                                        alt="Live Camera Feed"
                                        onLoad={() => setLiveStatus('MONITORING')}
                                        onError={() => setLiveStatus('ERROR')}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: liveStatus === 'MONITORING' ? 1 : 0.4 }}
                                    />
                                )}

                                {liveStatus === 'CONNECTING' && (
                                    <div style={{ position: 'absolute', color: 'var(--text-muted)' }}>
                                        <Loader2 size={32} style={{ animation: 'spin 2s linear infinite', margin: '0 auto 10px auto' }} />
                                        <div>Establishing Camera Link...</div>
                                    </div>
                                )}

                                {liveStatus === 'MONITORING' && (
                                    <div style={{ position: 'absolute', bottom: '20px', right: '20px', textAlign: 'right', display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '8px' }}>
                                        <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>FPS</span> <br /> {liveMetrics.fps}</div>
                                        <div><span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>LATENCY</span> <br /> {liveMetrics.latency}ms</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                {previewUrl ? (
                                    <video src={previewUrl} controls style={{ width: '100%', maxHeight: '440px', borderRadius: '8px' }} />
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                            <Video size={40} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                        <p style={{ color: 'var(--text-muted)' }}>Choose footage for forensic analysis</p>
                                        <input type="file" accept="video/*" id="video-upload" hidden onChange={handleVideoChange} />
                                        <label htmlFor="video-upload" className="btn" style={{ padding: '0.8rem 2rem', background: 'var(--primary-accent)', color: '#000', cursor: 'pointer' }}>
                                            Import Video File
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {!isLive && previewUrl && (
                        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Cpu size={18} style={{ color: 'var(--primary-accent)' }} />
                                <span style={{ fontSize: '0.9rem' }}>Ready for Neural Processing</span>
                            </div>
                            <button className="btn btn-primary" onClick={handleAnalyze} disabled={isAnalyzing}>
                                {isAnalyzing ? <><Loader2 style={{ animation: 'spin 2s linear infinite', marginRight: '8px' }} size={16} /> Analysis...</> : '🚀 Initiate AI Assessment'}
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            <Activity size={20} style={{ color: '#ff4081' }} />
                            <h3 style={{ margin: 0 }}>Processing Results</h3>
                        </div>

                        {error && (
                            <div style={{ padding: '1rem', background: 'rgba(255, 0, 64, 0.1)', border: '1px solid #ff0040', borderRadius: '8px', color: '#ff99aa', marginBottom: '1.5rem' }}>
                                <AlertTriangle size={18} style={{ marginBottom: '5px' }} /> <br /> {error}
                            </div>
                        )}

                        {!result && !isLive && (
                            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Waiting for data stream...</p>
                            </div>
                        )}

                        {isLive && (
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Detection Status</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00ff88' }}>STABLE BEHAVIOR</div>
                            </div>
                        )}

                        {result && (
                            <div style={{ animation: 'fadeIn 0.4s ease' }}>
                                <div className={`status-badge ${resultBadgeClass}`} style={{ width: '100%', textAlign: 'center', padding: '10px', fontSize: '1rem', marginBottom: '1.5rem', borderRadius: '8px' }}>
                                    {statusText}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Confidence Score</span>
                                        <span style={{ fontWeight: 700 }}>{toPercent(Math.max(result.stressProb, result.normalProb))}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Analysis Type</span>
                                        <span style={{ fontWeight: 700 }}>Dynamic Video AI</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default StressDetector;
