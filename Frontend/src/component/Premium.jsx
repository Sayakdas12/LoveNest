import React from "react";
import axios from "axios";
import { BaseUrl } from "../utils/constance";
import { useDispatch } from "react-redux";
import { setUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { Crown, Check, Zap, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const PLANS = [
    {
        id: "Essential",
        label: "Essential",
        icon: <Zap size={22} className="text-amber-400" />,
        price: "₹1,000",
        period: "/ 30 days",
        tagline: "Perfect to get started",
        accent: "from-amber-400 to-orange-500",
        shadowColor: "shadow-amber-500/20",
        features: [
            "Unlimited profile swipes",
            "See who liked you",
            "Priority in feed",
            "Real-time chat",
            "Ad-free experience",
        ],
    },
    {
        id: "Premium",
        label: "Premium",
        icon: <Crown size={22} className="text-white" />,
        price: "₹2,000",
        period: "/ 90 days",
        tagline: "Best value — 3× longer!",
        accent: "from-primary to-pink-500",
        shadowColor: "shadow-primary/25",
        featured: true,
        features: [
            "Everything in Essential",
            "Boost profile visibility",
            "Advanced filters",
            "Read receipts in chat",
            "Exclusive Premium badge",
            "Early access to new features",
        ],
    },
];

const Premium = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleBuyClick = async (plan) => {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
            alert("Razorpay SDK failed to load. Please check your internet connection.");
            return;
        }
        try {
            const response = await axios.post(
                `${BaseUrl}/payment/create`,
                { membershipType: plan },
                { withCredentials: true }
            );
            const { amount, orderId, notes, currency } = response.data.payment;
            const { keyid } = response.data;

            const options = {
                key: keyid,
                amount,
                currency,
                name: "LoveNest",
                description: "Connect with your loved ones",
                order_id: orderId,
                prefill: {
                    name: notes.firstName + " " + notes.lastName,
                    email: notes.emailId,
                    contact: notes.contact || "",
                },
                theme: { color: "#ec4899" },
                handler: async () => {
                    try {
                        const verifyRes = await axios.get(`${BaseUrl}/profile/view`, { withCredentials: true });
                        dispatch(setUser(verifyRes.data));
                        navigate("/feed");
                    } catch (err) {
                        alert("Payment successful! Please refresh the page.");
                    }
                },
            };
            new window.Razorpay(options).open();
        } catch (err) {
            console.error("Payment error:", err);
            alert("Something went wrong while initiating payment.");
        }
    };

    return (
        <div className="min-h-screen pb-32">
            {/* Hero */}
            <div className="relative overflow-hidden py-14 px-4 text-center"
                style={{ background: 'linear-gradient(135deg, hsl(var(--p)/0.12) 0%, hsl(var(--b2)) 40%, rgba(236,72,153,0.10) 100%)' }}>
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20"
                    style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
                <div className="relative z-10 max-w-xl mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Crown size={24} className="text-primary" />
                        <h1 className="text-4xl font-extrabold"
                            style={{ background: 'linear-gradient(135deg, hsl(var(--p)), #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Go Premium
                        </h1>
                        <Crown size={24} className="text-primary" />
                    </div>
                    <p className="text-base-content/60 text-sm">Unlock more features and connect with your perfect match faster</p>
                </div>
            </div>

            {/* Cards */}
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="grid md:grid-cols-2 gap-6">
                    {PLANS.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12 }}
                            className={`relative flex flex-col rounded-3xl border overflow-hidden shadow-xl ${plan.featured ? 'border-primary/40' : 'border-base-300'} ${plan.shadowColor}`}
                        >
                            {plan.featured && (
                                <div className="absolute top-4 right-4 badge text-white border-0 text-xs font-bold px-3 py-2"
                                    style={{ background: 'linear-gradient(135deg, hsl(var(--p)), #ec4899)' }}>
                                    <Sparkles size={11} className="mr-1" /> BEST VALUE
                                </div>
                            )}

                            {/* Card header */}
                            <div className={`p-6 bg-gradient-to-br ${plan.accent} ${plan.featured ? '' : 'opacity-90'}`}>
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${plan.featured ? 'bg-white/20' : 'bg-white/30'}`}>
                                    {plan.icon}
                                </div>
                                <h2 className="text-2xl font-bold text-white">{plan.label}</h2>
                                <p className="text-white/70 text-sm mt-1">{plan.tagline}</p>
                                <div className="mt-4 flex items-end gap-1">
                                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                    <span className="text-white/60 text-sm mb-1">{plan.period}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="flex-1 p-6 bg-base-100 flex flex-col gap-5">
                                <ul className="space-y-3">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm text-base-content/80">
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                                style={{ background: 'linear-gradient(135deg, hsl(var(--p)/0.2), rgba(236,72,153,0.2))' }}>
                                                <Check size={11} className="text-primary" strokeWidth={3} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleBuyClick(plan.id)}
                                    className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-lg mt-auto border-0 ${plan.featured ? 'text-white' : 'text-white'}`}
                                    style={{
                                        background: plan.featured
                                            ? 'linear-gradient(135deg, hsl(var(--p)), #ec4899)'
                                            : 'linear-gradient(135deg, #f59e0b, #f97316)',
                                        boxShadow: plan.featured ? '0 8px 24px rgba(236,72,153,0.3)' : '0 8px 24px rgba(245,158,11,0.3)',
                                    }}
                                >
                                    Get {plan.label}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <p className="text-center text-xs text-base-content/30 mt-8 flex items-center justify-center gap-1">
                    <Heart size={11} className="text-primary fill-primary/50" />
                    Secure payments powered by Razorpay
                </p>
            </div>
        </div>
    );
};

export default Premium;
