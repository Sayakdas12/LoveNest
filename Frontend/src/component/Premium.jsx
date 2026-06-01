import React, { useState } from "react";
import axios from "axios";
import { BaseUrl } from "../utils/constance";
import { useDispatch } from "react-redux";
import { setUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { Crown, Check, Zap, Sparkles, Heart, CreditCard, X, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        price: "1,000",
        amount: 1000,
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
        price: "2,000",
        amount: 2000,
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

const modalOverlay = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};
const modalSheet = {
    hidden: { y: 80, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 22, stiffness: 260 } },
    exit: { y: 80, opacity: 0, transition: { duration: 0.2 } },
};

const Premium = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [selectedPlan, setSelectedPlan] = useState(null);

    const openModal = (plan) => {
        setSelectedPlan(plan);
    };
    const closeModal = () => setSelectedPlan(null);

    // â”€â”€ Razorpay flow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleRazorpay = async () => {
        const loaded = await loadRazorpayScript();
        if (!loaded) { alert("Razorpay SDK failed to load. Check your internet."); return; }
        try {
            const response = await axios.post(`${BaseUrl}/payment/create`, { membershipType: selectedPlan.id }, { withCredentials: true });
            const { amount, orderId, notes, currency } = response.data.payment;
            const { keyid } = response.data;

            const options = {
                key: keyid,
                amount,
                currency,
                name: "LoveNest",
                description: `${selectedPlan.label} Membership`,
                order_id: orderId,
                prefill: {
                    name: notes.firstName + " " + notes.lastName,
                    email: notes.emailId,
                    contact: notes.contact || "",
                },
                theme: { color: "#8a3fa0" },
                handler: async (rzpResponse) => {
                    try {
                        await axios.post(`${BaseUrl}/payment/verify`, {
                            razorpay_order_id: rzpResponse.razorpay_order_id,
                            razorpay_payment_id: rzpResponse.razorpay_payment_id,
                            razorpay_signature: rzpResponse.razorpay_signature,
                        }, { withCredentials: true });
                        const profileRes = await axios.get(`${BaseUrl}/profile/view`, { withCredentials: true });
                        dispatch(setUser(profileRes.data));
                        navigate("/feed");
                    } catch {
                        alert("Payment received! Please refresh the page to activate your membership.");
                    }
                },
            };
            closeModal();
            new window.Razorpay(options).open();
        } catch {
            alert("Something went wrong while initiating payment.");
        }
    };

    return (
        <div className="min-h-screen pb-32">
            {/* Hero */}
            <div className="relative overflow-hidden py-14 px-4 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(138,63,160,0.15) 0%, rgba(12,4,22,0.95) 40%, rgba(196,120,154,0.10) 100%)' }}>
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20"
                    style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
                <div className="relative z-10 max-w-xl mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Crown size={24} style={{ color: '#c4789a' }} />
                        <h1 className="text-4xl font-extrabold"
                            style={{ background: 'linear-gradient(135deg, #f0d6e8, #c4789a, #8a3fa0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Go Premium
                        </h1>
                        <Crown size={24} style={{ color: '#c4789a' }} />
                    </div>
                    <p className="text-sm" style={{ color: 'rgba(220,180,200,0.55)' }}>Unlock more features and connect with your perfect match faster</p>
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
                            className={`relative flex flex-col rounded-3xl overflow-hidden shadow-xl ${plan.shadowColor}`}
                            style={{ border: plan.featured ? '1px solid rgba(138,63,160,0.4)' : '1px solid rgba(196,120,154,0.18)' }}
                        >
                            {plan.featured && (
                                <div className="absolute top-4 right-4 badge text-white border-0 text-xs font-bold px-3 py-2"
                                    style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)' }}>
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
                                    <div className="flex items-end gap-0.5">
                                        <IndianRupee size={28} strokeWidth={2.5} className="text-white mb-0.5" />
                                        <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                    </div>
                                    <span className="text-white/60 text-sm mb-1">{plan.period}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="flex-1 p-6 flex flex-col gap-5" style={{ background: 'rgba(18,6,28,0.92)' }}>
                                <ul className="space-y-3">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(220,180,200,0.78)' }}>
                                            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                                style={{ background: 'rgba(138,63,160,0.25)' }}>
                                                <Check size={11} style={{ color: '#c4789a' }} strokeWidth={3} />
                                            </div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => openModal(plan)}
                                    className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-lg mt-auto border-0 text-white`}
                                    style={{
                                        background: plan.featured
                                            ? 'linear-gradient(135deg, #8a3fa0, #c4789a)'
                                            : 'linear-gradient(135deg, #f59e0b, #f97316)',
                                        boxShadow: plan.featured ? '0 8px 24px rgba(138,63,160,0.35)' : '0 8px 24px rgba(245,158,11,0.3)',
                                    }}
                                >
                                    Get {plan.label}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <p className="text-center text-xs mt-8 flex items-center justify-center gap-1" style={{ color: 'rgba(220,180,200,0.3)' }}>
                    <Heart size={11} style={{ color: '#c4789a', fill: 'rgba(196,120,154,0.5)' }} />
                    Secure payments via Razorpay
                </p>
            </div>

            {/* â”€â”€ Payment method modal â”€â”€ */}
            <AnimatePresence>
                {selectedPlan && (
                    <motion.div
                        key="overlay"
                        variants={modalOverlay}
                        initial="hidden" animate="visible" exit="hidden"
                        onClick={closeModal}
                        className="fixed inset-0 z-50 flex items-end justify-center"
                        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
                    >
                        <motion.div
                            key="sheet"
                            variants={modalSheet}
                            initial="hidden" animate="visible" exit="exit"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-t-3xl overflow-hidden"
                            style={{ background: 'rgba(18,6,28,0.98)', border: '1px solid rgba(196,120,154,0.2)', borderBottom: 'none' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-6 pb-4"
                                style={{ borderBottom: '1px solid rgba(196,120,154,0.1)' }}>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(196,120,154,0.6)' }}>Complete your purchase</p>
                                    <p className="text-white font-bold text-lg flex items-center gap-1">
                                        {selectedPlan.label} —&nbsp;
                                        <IndianRupee size={16} strokeWidth={2.5} />
                                        {selectedPlan.price}
                                    </p>
                                </div>
                                <button onClick={closeModal} className="w-8 h-8 rounded-full flex items-center justify-center border-0"
                                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <X size={15} style={{ color: 'rgba(220,180,200,0.6)' }} />
                                </button>
                            </div>

                            {/* Razorpay payment */}
                            <div className="px-6 pb-8 mt-5">
                                <p className="text-sm mb-5" style={{ color: 'rgba(220,180,200,0.5)' }}>
                                    Pay with Card, UPI, Net Banking, or Wallet. Powered by Razorpay.
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    onClick={handleRazorpay}
                                    className="w-full py-3.5 rounded-2xl font-bold text-white border-0"
                                    style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 8px 24px rgba(138,63,160,0.4)' }}
                                >
                                    Pay <IndianRupee size={15} strokeWidth={2.5} style={{ display: 'inline', verticalAlign: 'middle', marginBottom: '2px' }} />{selectedPlan.price} via Razorpay
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Premium;
