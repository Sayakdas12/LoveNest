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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-4">
            <div className="card bg-base-100 w-full max-w-md shadow-2xl">
                <div className="card-body p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                            <Heart size={32} className="text-primary fill-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
                        <p className="text-base-content/50 text-sm mt-1">Sign in to find your match</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <label className="input input-bordered flex items-center gap-3 w-full">
                            <Mail size={16} className="opacity-50 shrink-0" />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={emailId}
                                required
                                onChange={(e) => setEmailId(e.target.value)}
                                className="grow"
                            />
                        </label>

                        <label className="input input-bordered flex items-center gap-3 w-full">
                            <Lock size={16} className="opacity-50 shrink-0" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                required
                                onChange={(e) => setPassword(e.target.value)}
                                className="grow"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading
                                ? <span className="loading loading-spinner loading-sm" />
                                : "Sign In"
                            }
                        </button>
                    </form>

                    <div className="divider text-xs text-base-content/30">New here?</div>
                    <p className="text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link to="/signup" className="link link-primary font-semibold">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
