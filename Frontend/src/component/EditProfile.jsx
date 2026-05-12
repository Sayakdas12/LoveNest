import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import { setUser } from '../utils/userSlice';
import Usercard from './Usercard';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';

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

    return (
        <div className="flex flex-col lg:flex-row gap-5 p-6 max-w-7xl mx-auto min-h-screen pb-60">
            {/* Form Section */}
            <div className="flex-1">
                <div className="bg-base-300 shadow-lg rounded-lg p-8">
                    <h2 className="text-2xl font-semibold text-center mb-6">Edit Profile</h2>

                    <div className="space-y-5">
                        <div>
                            <label className="block font-medium mb-1">First Name</label>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input input-bordered w-full" />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Last Name</label>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input input-bordered w-full" />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Age</label>
                            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="input input-bordered w-full" />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Gender</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value)} className="select select-bordered w-full">
                                <option value="" disabled>Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-medium mb-1">About</label>
                            <textarea value={About} onChange={(e) => setAbout(e.target.value)} className="textarea textarea-bordered w-full" rows={3} />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Skills <span className="text-xs text-base-content/40">(comma-separated)</span></label>
                            <input type="text" value={Skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. hiking, cooking, music" className="input input-bordered w-full" />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&size=80&background=random&color=fff&bold=true`}
                                        alt="preview"
                                        className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 btn btn-circle btn-xs btn-primary"
                                    >
                                        <Camera size={12} />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="file-input file-input-bordered file-input-sm w-full"
                                        onChange={handlePhotoChange}
                                    />
                                    <p className="text-xs text-base-content/40 mt-1">Or enter a photo URL below</p>
                                    <input
                                        type="text"
                                        value={photoUrl}
                                        onChange={(e) => { setPhotoUrl(e.target.value); setPhotoPreview(e.target.value); setPhotoFile(null); }}
                                        placeholder="https://..."
                                        className="input input-bordered input-sm w-full mt-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button className="btn btn-primary w-full" onClick={handleSave} disabled={saving}>
                            {saving ? <span className="loading loading-spinner loading-sm"></span> : 'Update Profile'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="flex-1">
                <Usercard user={{ firstName, lastName, age, gender, About, Skills: Skills.trim() ? Skills.split(',').map(s => s.trim()).filter(Boolean) : [], photoUrl: photoPreview || photoUrl }} />
            </div>
        </div>
    );
};

export default EditProfile;
