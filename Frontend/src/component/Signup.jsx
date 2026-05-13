import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../utils/userSlice';
import { useNavigate, Link } from 'react-router-dom';
import { BaseUrl } from '../utils/constance';
import { Eye, EyeOff, User, Mail, Lock, Calendar, Users, FileText, Sparkles, Camera, Heart } from 'lucide-react';

const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(196,120,154,0.18)',
};
const Field = ({ icon: Icon, children }) => (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={inputStyle}>
        <Icon size={15} style={{ color: 'rgba(196,120,154,0.65)', flexShrink: 0 }} />
        {children}
    </div>
);
const inputCls = "bg-transparent outline-none text-white text-sm w-full placeholder-white/25";

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', emailId: '', password: '',
        age: '', gender: '', about: '', skills: '', photo: null,
    });
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleSubmit = async () => {
        try {
            let url = isLogin ? `${BaseUrl}/login` : `${BaseUrl}/signup`;
            let payload;
            let config = {};
            if (isLogin) {
                payload = { emailId: formData.emailId, password: formData.password };
            } else {
                payload = new FormData();
                payload.append('firstName', formData.firstName);
                payload.append('lastName', formData.lastName);
                payload.append('emailId', formData.emailId);
                payload.append('password', formData.password);
                payload.append('age', formData.age);
                payload.append('gender', formData.gender);
                payload.append('about', formData.about);
                if (formData.skills.trim()) payload.append('skills', formData.skills);
                if (formData.photo) payload.append('photo', formData.photo);
                config.headers = { 'Content-Type': 'multipart/form-data' };
            }
            const response = await axios.post(url, payload, { ...config, withCredentials: true });
            dispatch(setUser(response.data));
            navigate('/feed');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Something went wrong!';
            alert(msg);
        }
    };

    return (
        <div className="min-h-[calc(100vh-66px)] flex items-center justify-center p-4 py-10 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.15), transparent 70%)', filter: 'blur(50px)' }} />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(196,120,154,0.12), transparent 70%)', filter: 'blur(50px)' }} />

            <div
                className="w-full max-w-md rounded-3xl p-7 relative z-10"
                style={{
                    background: 'rgba(28,10,42,0.88)',
                    border: '1px solid rgba(196,120,154,0.18)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(24px)',
                }}
            >
                {/* Header */}
                <div className="flex flex-col items-center mb-7">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                        style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 8px 24px rgba(138,63,160,0.5)' }}
                    >
                        <Heart size={24} className="fill-white text-white" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Join LoveNest'}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: 'rgba(220,180,200,0.45)' }}>
                        {isLogin ? 'Sign in to continue your journey' : 'Find your perfect match today'}
                    </p>
                </div>

                <div className="space-y-3">
                    {/* Signup-only fields */}
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field icon={User}>
                                <input name="firstName" type="text" placeholder="First Name"
                                    className={inputCls} value={formData.firstName} onChange={handleChange} required />
                            </Field>
                            <Field icon={User}>
                                <input name="lastName" type="text" placeholder="Last Name"
                                    className={inputCls} value={formData.lastName} onChange={handleChange} required />
                            </Field>
                        </div>
                    )}

                    <Field icon={Mail}>
                        <input name="emailId" type="email" placeholder="Email address"
                            className={inputCls} value={formData.emailId} onChange={handleChange} required />
                    </Field>

                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={inputStyle}>
                        <Lock size={15} style={{ color: 'rgba(196,120,154,0.65)', flexShrink: 0 }} />
                        <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            className={inputCls}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                            style={{ color: 'rgba(196,120,154,0.5)' }} className="hover:brightness-150 transition-all flex-shrink-0">
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>

                    {!isLogin && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <Field icon={Calendar}>
                                    <input name="age" type="number" placeholder="Age"
                                        className={inputCls} value={formData.age} onChange={handleChange} required />
                                </Field>
                                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl" style={inputStyle}>
                                    <Users size={15} style={{ color: 'rgba(196,120,154,0.65)', flexShrink: 0 }} />
                                    <select name="gender" className="bg-transparent outline-none text-sm w-full"
                                        style={{ color: formData.gender ? 'white' : 'rgba(255,255,255,0.25)' }}
                                        value={formData.gender} onChange={handleChange} required>
                                        <option value="" disabled style={{ background: '#1e0d30' }}>Gender</option>
                                        <option value="male" style={{ background: '#1e0d30' }}>Male</option>
                                        <option value="female" style={{ background: '#1e0d30' }}>Female</option>
                                        <option value="other" style={{ background: '#1e0d30' }}>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 px-4 py-2.5 rounded-xl" style={inputStyle}>
                                <FileText size={15} style={{ color: 'rgba(196,120,154,0.65)', flexShrink: 0, marginTop: 2 }} />
                                <textarea name="about" placeholder="About you..." rows={2}
                                    className={`${inputCls} resize-none`} value={formData.about} onChange={handleChange} required />
                            </div>

                            <Field icon={Sparkles}>
                                <input name="skills" type="text" placeholder="Skills (e.g. hiking, cooking)"
                                    className={inputCls} value={formData.skills} onChange={handleChange} />
                            </Field>

                            <label
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all hover:brightness-110"
                                style={inputStyle}
                            >
                                <Camera size={15} style={{ color: 'rgba(196,120,154,0.65)', flexShrink: 0 }} />
                                <span className="text-sm" style={{ color: formData.photo ? '#c4789a' : 'rgba(255,255,255,0.25)' }}>
                                    {formData.photo ? formData.photo.name : 'Upload photo (optional)'}
                                </span>
                                <input name="photo" type="file" className="hidden" onChange={handleChange} accept="image/*" />
                            </label>
                        </>
                    )}
                </div>

                <button
                    className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 mt-5 transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-100"
                    style={{ background: 'linear-gradient(135deg, #8a3fa0, #c4789a)', boxShadow: '0 8px 24px rgba(138,63,160,0.4)' }}
                    onClick={handleSubmit}
                >
                    <Heart size={15} className="fill-white" />
                    {isLogin ? 'Sign In' : 'Create Account'}
                </button>

                <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px" style={{ background: 'rgba(196,120,154,0.15)' }} />
                    <span className="text-xs" style={{ color: 'rgba(220,180,200,0.3)' }}>
                        {isLogin ? 'New here?' : 'Already a member?'}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(196,120,154,0.15)' }} />
                </div>

                <p className="text-center text-sm" style={{ color: 'rgba(220,180,200,0.45)' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)}
                        className="font-semibold transition-colors hover:brightness-125 ml-1" style={{ color: '#c4789a' }}>
                        {isLogin ? 'Create one' : 'Sign in'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;
