import React, { useState } from 'react';
import axios from 'axios';
import { setUser } from '../utils/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { BaseUrl } from '../utils/constance';
import toast from 'react-hot-toast';
import { Mail, Lock, Heart } from 'lucide-react';

const Login = () => {
    const [emailId, setEmailId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(BaseUrl + "/login", { emailId, password }, { withCredentials: true });
            dispatch(setUser(res.data));
            toast.success(`Welcome back, ${res.data.firstName}! 💕`);
            navigate("/feed");
        } catch (error) {
            toast.error(error.response?.data || "Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-66px)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-1/4 -left-16 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.18), transparent 70%)', filter: 'blur(40px)' }} />
            <div className="absolute bottom-1/4 -right-16 w-80 h-80 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(196,120,154,0.14), transparent 70%)', filter: 'blur(40px)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(80,20,100,0.1), transparent 70%)', filter: 'blur(60px)' }} />

            <div
                className="w-full max-w-md rounded-3xl p-8 relative z-10"
                style={{
                    background: 'rgba(28,10,42,0.88)',
                    border: '1px solid rgba(196,120,154,0.18)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,120,154,0.06)',
                    backdropFilter: 'blur(24px)',
                }}
            >
                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 8px 28px rgba(138,63,160,0.55)' }}
                    >
                        <Heart size={28} className="fill-white text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
                    <p className="text-sm mt-1.5" style={{ color: 'rgba(220,180,200,0.5)' }}>Sign in to find your perfect match</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(196,120,154,0.18)' }}
                    >
                        <Mail size={16} style={{ color: 'rgba(196,120,154,0.7)' }} className="shrink-0" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={emailId}
                            required
                            onChange={(e) => setEmailId(e.target.value)}
                            className="bg-transparent outline-none text-white text-sm w-full"
                            style={{ caretColor: '#c4789a' }}
                        />
                    </div>

                    <div
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(196,120,154,0.18)' }}
                    >
                        <Lock size={16} style={{ color: 'rgba(196,120,154,0.7)' }} className="shrink-0" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent outline-none text-white text-sm w-full"
                            style={{ caretColor: '#c4789a' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 mt-2 transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-100 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 8px 24px rgba(138,63,160,0.4)' }}
                    >
                        {loading
                            ? <span className="loading loading-spinner loading-sm" />
                            : <><Heart size={16} className="fill-white" /> Sign In</>
                        }
                    </button>
                </form>

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px" style={{ background: 'rgba(196,120,154,0.15)' }} />
                    <span className="text-xs" style={{ color: 'rgba(220,180,200,0.35)' }}>New here?</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(196,120,154,0.15)' }} />
                </div>

                <p className="text-center text-sm" style={{ color: 'rgba(220,180,200,0.5)' }}>
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="font-semibold transition-colors hover:brightness-125" style={{ color: '#c4789a' }}>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
