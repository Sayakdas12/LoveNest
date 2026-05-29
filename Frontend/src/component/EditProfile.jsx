import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import { setUser } from '../utils/userSlice';
import Usercard from './Usercard';
import toast from 'react-hot-toast';
import { Camera, Scan, Lock, Save, Eye, EyeOff } from 'lucide-react';
import FaceEnrollDialog from './FaceLock/FaceEnrollDialog';
import { motion } from 'framer-motion';

const FIELD_STYLE = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(196,120,154,0.2)',
    borderRadius: '12px',
    padding: '11px 14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    caretColor: '#c4789a',
    transition: 'border-color 0.2s',
};

const LABEL_STYLE = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(196,120,154,0.65)',
    marginBottom: '7px',
};

const EditProfile = ({ user }) => {
    const [firstName, setFirstName] = useState(user.firstName || '');
    const [lastName, setLastName] = useState(user.lastName || '');
    const [age, setAge] = useState(user.age || '');
    const [gender, setGender] = useState(user.gender || '');
    const [About, setAbout] = useState(user.About || '');
    const [Skills, setSkills] = useState((user.Skills || []).join(', '));
    const [photoUrl, setPhotoUrl] = useState(user.photoUrl || '');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(user.photoUrl || '');
    const [saving, setSaving] = useState(false);
    const [showFaceEnroll, setShowFaceEnroll] = useState(false);
    const [showChatLockSetup, setShowChatLockSetup] = useState(false);
    const [chatLockPwd, setChatLockPwd] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const fileInputRef = useRef(null);

    const dispatch = useDispatch();

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let res;
            if (photoFile) {
                const fd = new FormData();
                fd.append('firstName', firstName);
                fd.append('lastName', lastName);
                fd.append('age', age);
                fd.append('gender', gender);
                fd.append('About', About);
                if (Skills.trim()) fd.append('Skills', Skills);
                fd.append('photo', photoFile);
                res = await axios.patch(BaseUrl + '/profile/edit', fd, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                res = await axios.patch(BaseUrl + '/profile/edit', {
                    firstName,
                    lastName,
                    age,
                    gender,
                    About,
                    Skills: Skills.trim() ? Skills.split(',').map(s => s.trim()).filter(Boolean) : [],
                    photoUrl,
                }, { withCredentials: true });
            }
            dispatch(setUser(res?.data?.data));
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || error.response?.data || 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&size=200&background=8a3fa0&color=fff&bold=true`;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 pb-40">
            {/* Page header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-black" style={{ background: 'linear-gradient(135deg,#f0d6e8,#c4789a,#8a3fa0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Edit Profile
                </h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(220,180,200,0.45)' }}>Keep your profile fresh and authentic</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* ── Form ── */}
                <div className="flex-1 w-full rounded-3xl p-7 relative overflow-hidden"
                    style={{ background: 'rgba(18,6,28,0.82)', border: '1px solid rgba(196,120,154,0.18)', backdropFilter: 'blur(24px)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                        style={{ background: 'radial-gradient(circle,rgba(138,63,160,0.18),transparent)' }} />

                    {/* Avatar upload */}
                    <div className="flex flex-col items-center mb-7">
                        <div className="relative">
                            <div className="p-[3px] rounded-full" style={{ background: 'linear-gradient(135deg,#8a3fa0,#c4789a)' }}>
                                <img src={photoPreview || fallback} alt="avatar"
                                    onError={e => { e.target.onerror = null; e.target.src = fallback; }}
                                    className="w-24 h-24 rounded-full object-cover block"
                                    style={{ background: 'rgba(22,8,32,0.9)' }} />
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                style={{ background: 'linear-gradient(135deg,#8a3fa0,#c4789a)', boxShadow: '0 4px 12px rgba(138,63,160,0.5)' }}>
                                <Camera size={14} className="text-white" />
                            </button>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                            className="mt-3 text-xs transition-all hover:brightness-125"
                            style={{ color: 'rgba(196,120,154,0.65)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            Upload new photo
                        </button>
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label style={LABEL_STYLE}>First Name</label>
                                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                                    style={FIELD_STYLE} placeholder="First name"
                                    onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'} />
                            </div>
                            <div>
                                <label style={LABEL_STYLE}>Last Name</label>
                                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                                    style={FIELD_STYLE} placeholder="Last name"
                                    onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label style={LABEL_STYLE}>Age</label>
                                <input type="number" value={age} min="18" max="80" onChange={e => setAge(e.target.value)}
                                    style={FIELD_STYLE} placeholder="25"
                                    onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'} />
                            </div>
                            <div>
                                <label style={LABEL_STYLE}>Gender</label>
                                <select value={gender} onChange={e => setGender(e.target.value)}
                                    style={{ ...FIELD_STYLE, color: gender ? '#fff' : 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'}>
                                    <option value="" style={{ background: '#1e0d30' }}>Select gender</option>
                                    <option value="male" style={{ background: '#1e0d30' }}>Male</option>
                                    <option value="female" style={{ background: '#1e0d30' }}>Female</option>
                                    <option value="other" style={{ background: '#1e0d30' }}>Other</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={LABEL_STYLE}>About</label>
                            <textarea value={About} onChange={e => setAbout(e.target.value)} rows={3}
                                placeholder="Tell others about yourself…"
                                style={{ ...FIELD_STYLE, resize: 'vertical', minHeight: '80px' }}
                                onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'} />
                        </div>
                        <div>
                            <label style={LABEL_STYLE}>Interests <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 'normal' }}>(comma-separated)</span></label>
                            <input type="text" value={Skills} onChange={e => setSkills(e.target.value)}
                                placeholder="e.g. hiking, cooking, music"
                                style={FIELD_STYLE}
                                onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'} />
                        </div>
                        <div>
                            <label style={LABEL_STYLE}>Photo URL <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 'normal' }}>(or upload above)</span></label>
                            <input type="text" value={photoUrl}
                                onChange={e => { setPhotoUrl(e.target.value); setPhotoPreview(e.target.value); setPhotoFile(null); }}
                                placeholder="https://…" style={FIELD_STYLE}
                                onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'} />
                        </div>
                    </div>

                    {/* Security */}
                    <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(196,120,154,0.12)' }}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
                            style={{ color: 'rgba(196,120,154,0.55)' }}>
                            <Lock size={12} /> Security
                        </p>
                        <div className="flex flex-col gap-2">
                            <button type="button" onClick={() => setShowFaceEnroll(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-125"
                                style={{ background: 'rgba(138,63,160,0.1)', border: '1px solid rgba(138,63,160,0.25)', color: 'rgba(196,120,154,0.8)' }}>
                                <Scan size={15} /> Set Up Face ID
                            </button>
                            <button type="button" onClick={() => setShowChatLockSetup(v => !v)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-125"
                                style={{ background: 'rgba(138,63,160,0.1)', border: '1px solid rgba(138,63,160,0.25)', color: 'rgba(196,120,154,0.8)' }}>
                                <Lock size={15} /> Set Chat Lock Password
                            </button>
                            {showChatLockSetup && (
                                <div className="flex gap-2 mt-1">
                                    <div className="relative flex-1">
                                        <input type={showPwd ? 'text' : 'password'} value={chatLockPwd}
                                            onChange={e => setChatLockPwd(e.target.value)}
                                            placeholder="New chat lock password"
                                            style={{ ...FIELD_STYLE, paddingRight: '40px' }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(196,120,154,0.55)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(196,120,154,0.2)'} />
                                        <button type="button" onClick={() => setShowPwd(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                            style={{ color: 'rgba(196,120,154,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    <button type="button"
                                        onClick={async () => {
                                            if (!chatLockPwd.trim()) return;
                                            try {
                                                await axios.post(`${BaseUrl}/profile/chat-lock/set`, { password: chatLockPwd }, { withCredentials: true });
                                                toast.success('Chat lock password set!');
                                                setChatLockPwd(''); setShowChatLockSetup(false);
                                            } catch { toast.error('Failed to set chat lock'); }
                                        }}
                                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                                        style={{ background: 'linear-gradient(135deg,#8a3fa0,#c4789a)', whiteSpace: 'nowrap' }}>
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={handleSave} disabled={saving}
                        className="w-full mt-7 py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg,#8a3fa0,#c4789a)', boxShadow: '0 8px 24px rgba(138,63,160,0.4)' }}>
                        {saving
                            ? <><span className="loading loading-spinner loading-sm" /> Saving…</>
                            : <><Save size={16} /> Save Changes</>}
                    </motion.button>
                </div>

                {/* ── Preview ── */}
                <div className="flex flex-col items-center gap-4 lg:sticky lg:top-24">
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(196,120,154,0.5)' }}>Live Preview</p>
                    <Usercard user={{
                        firstName, lastName, age, gender, About,
                        Skills: Skills.trim() ? Skills.split(',').map(s => s.trim()).filter(Boolean) : [],
                        photoUrl: photoPreview || photoUrl,
                    }} />
                </div>
            </div>

            {showFaceEnroll && <FaceEnrollDialog onClose={() => setShowFaceEnroll(false)} />}
        </div>
    );
};

export default EditProfile;
