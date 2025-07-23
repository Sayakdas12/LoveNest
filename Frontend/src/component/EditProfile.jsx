import React from 'react'
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import { setUser } from '../utils/userSlice';
import Usercard from './Usercard';


const EditProfile = ({ user }) => {

    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [age, setAge] = useState(user.age);
    const [gender, setGender] = useState(user.gender);
    const [About, setAbout] = useState(user.About);
    const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
    const [showToast, setShowToast] = useState(false);

    const dispatch = useDispatch();


    const handleLogin = async () => {
        console.log("Login button clicked");


        try {
            const res = await axios.patch(BaseUrl + "/profile/edit", {
                firstName,
                lastName,
                age,
                gender,
                About,
                photoUrl,
            }, { withCredentials: true }); // Important for sending cookies

            console.log("Login successful:", res.data);
            dispatch(setUser(res?.data?.data));
            setShowToast(true);
            const i = setTimeout(() => {
                setShowToast(false);
            }, 3000); // Hide toast after 3 seconds
        }
        catch (error) {
            console.error("Login failed:", error.response ? error.response.data : error.message);
        }
    };


    return (
        <>
            <div className="flex flex-col lg:flex-row gap-5 p-6 max-w-7xl mx-auto min-h-screen pb-60">      {/* Form Section */}
                <div className="flex-1">
                    <div className="bg-base-300 shadow-lg rounded-lg p-8">
                        <h2 className="text-2xl font-semibold text-center mb-6">Edit Profile</h2>

                        {/* Input Fields */}
                        <div className="space-y-5">
                            <div>
                                <label className="block font-medium mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-1">Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-1">Gender</label>
                                <input
                                    type="text"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-1">About</label>
                                <textarea
                                    value={About}
                                    onChange={(e) => setAbout(e.target.value)}
                                    className="textarea textarea-bordered w-full"
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-1">Photo URL</label>
                                <input
                                    type="text"
                                    value={photoUrl}
                                    onChange={(e) => setPhotoUrl(e.target.value)}
                                    className="input input-bordered w-full"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 flex justify-center">
                            <button className="btn btn-primary w-full" onClick={handleLogin}>
                                Update Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="flex-1">
                    <Usercard
                        user={{ firstName, lastName, age, gender, About, photoUrl }}
                    />
                </div>
            </div>
            {showToast && (
                <div className="toast toast-top toast-center">

                    <div className="alert alert-success">
                        <span>Profile save successfully.</span>
                    </div>
                </div>
            )}
        </>

    );
};


export default EditProfile;
