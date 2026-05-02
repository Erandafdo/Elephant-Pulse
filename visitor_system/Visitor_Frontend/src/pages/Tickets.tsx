import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/store";
import { ArrowLeft, Check, Info } from "lucide-react";
export default function TicketsPage() {
    const navigate = useNavigate();
    const { visitorId } = useAuth();
    const [tariffs, setTariffs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    useEffect(() => {
        fetch("http://localhost:8000/visitors/tickets/config")
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success") {
                    setTariffs(data.tariffs);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);
    const handleBook = (type: string, price: string, price_value: number) => {
        if (visitorId) {
            navigate(`/checkout?type=${encodeURIComponent(type)}&price=${encodeURIComponent(price)}&val=${price_value}&count=${qty}`);
        } else {
            navigate("/register");
        }
    };
    return (
        <main className="min-h-screen bg-ivory text-jungle-900 font-sans pb-20">
            <nav className="p-6 sticky top-0 bg-ivory/90 backdrop-blur-md z-50 border-b border-jungle-900/5 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-jungle-900 font-bold hover:text-earth-500 transition-colors">
                    <ArrowLeft className="w-5 h-5" /> Return Home
                </Link>
                {!visitorId && (
                    <Link to="/login" className="text-sm font-bold text-earth-500 hover:underline">
                        Already have an account? Log In
                    </Link>
                )}
                {visitorId && (
                    <Link to="/profile" className="text-sm font-bold text-jungle-900 bg-earth-100 px-4 py-2 rounded-full hover:bg-earth-200">
                        My Profile
                    </Link>
                )}
            </nav>
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-16 space-y-4">
                    <span className="bg-earth-100 text-earth-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                        2025 Official Rates
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-jungle-900">
                        Choose Your Experience
                    </h1>
                    <p className="text-xl text-jungle-900/60 max-w-2xl mx-auto">
                        All tickets include full-day access to the orphanage, river bathing sessions, and fruit feeding observation.
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-8 bg-earth-100 p-4 rounded-2xl w-fit mx-auto border border-earth-200">
                        <span className="font-bold text-earth-900">Number of Guests</span>
                        <input 
                            type="number" 
                            min="1" 
                            max="10" 
                            value={qty} 
                            onChange={(e) => setQty(parseInt(e.target.value))}
                            className="bg-white border rounded-xl p-2 w-16 text-center font-bold text-jungle-900 outline-none focus:ring-2 ring-earth-500"
                        />
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-3 text-center py-20 animate-pulse text-jungle-900/50 hidden">
                            Loading official rates...
                        </div>
                    ) : (
                        tariffs.map((tariff: any, index: number) => (
                            <div key={index} className={`p-8 rounded-3xl shadow-xl relative overflow-hidden transition-transform duration-300 ${tariff.popular ? 'bg-jungle-900 text-ivory transform md:-translate-y-4 shadow-2xl border-jungle-800' : 'bg-white border-earth-100 group hover:-translate-y-2'}`}>
                                {tariff.popular && (
                                    <div className="absolute top-0 right-0 bg-earth-500 text-jungle-900 text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className={`text-xl font-bold mb-2 ${tariff.popular ? 'text-ivory' : 'text-jungle-900'}`}>{tariff.category}</h3>
                                <div className="flex items-baseline gap-1 my-6">
                                    <span className={`text-4xl font-serif font-bold ${tariff.popular ? 'text-earth-500' : 'text-jungle-900'}`}>{tariff.price}</span>
                                    <span className={tariff.popular ? 'text-ivory/50' : 'text-gray-500'}>/ adult</span>
                                </div>
                                {tariff.currency === "USD" && (
                                    <p className={`text-xs mb-6 font-mono ${tariff.popular ? 'text-earth-500' : 'text-gray-400'}`}>+ 18% VAT included at checkout</p>
                                )}
                                <ul className={`space-y-3 mb-8 text-sm ${tariff.popular ? 'text-ivory/80' : 'text-gray-600'}`}>
                                    {tariff.features.map((feat: string, i: number) => (
                                        <li key={i} className="flex gap-2">
                                            <Check className={`w-4 h-4 ${tariff.popular ? 'text-earth-500' : 'text-green-500'}`} /> {feat}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => handleBook(tariff.category, tariff.price, tariff.price_value)} className={`block w-full py-3 font-bold text-center rounded-xl transition-colors ${tariff.popular ? 'bg-earth-500 text-jungle-900 hover:bg-earth-400' : 'bg-earth-100 text-earth-900 hover:bg-earth-200'}`}>
                                    {tariff.popular ? "Get Your Ticket" : "Book Now"}
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-16 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex gap-4 items-start">
                    <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-jungle-900">Important Information</h4>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            Tickets are valid only for the date of booking. Please present your digital QR code at the main entrance gate.
                            For SAARC and Local rates, original identification documents (Passport/NIC) must be presented upon entry.
                            Refunds are not available for cancellations made less than 24 hours before the visit.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
