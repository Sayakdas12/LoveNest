import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { BaseUrl } from '../utils/constance';

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        emailId: '',
        password: '',
        age: '',
        gender: '',
        about: '',
        photo: null,
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async () => {
        try {
            let url = isLogin ? `${BaseUrl}/login` : `${BaseUrl}/signup`;
            let payload;
            let config = {};

            if (isLogin) {
                payload = {
                    emailId: formData.emailId,
                    password: formData.password,
                };
            } else {
                payload = new FormData();
                payload.append('firstName', formData.firstName);
                payload.append('lastName', formData.lastName);
                payload.append('emailId', formData.emailId);
                payload.append('password', formData.password);
                payload.append('age', formData.age);
                payload.append('gender', formData.gender);
                payload.append('about', formData.about);
                if (formData.photo) payload.append('photo', formData.photo);

                config.headers = {
                    'Content-Type': 'multipart/form-data',
                };
            }

            const response = await axios.post(url, payload, {
                ...config,
                withCredentials: true,
            });

            dispatch(setUser(response.data));
            navigate('/Feed');
        } catch (err) {
            console.error(`${isLogin ? 'Login' : 'Signup'} error:`, err);
            alert(err.response?.data?.message || 'Something went wrong!');
        }
    };

    return (
        <div className="flex justify-center mt-20">
            <div className="card bg-base-200 w-full max-w-md p-6 rounded-xl shadow-md">
                <h2 className="text-center text-xl font-bold mb-4">
                    {isLogin ? 'Login to Your Account' : 'Create an Account'}
                </h2>

                {/* Signup fields */}
                {!isLogin && (
                    <>
                        <input
                            name="firstName"
                            type="text"
                            placeholder="First Name"
                            className="input input-bordered w-full mb-3"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="lastName"
                            type="text"
                            placeholder="Last Name"
                            className="input input-bordered w-full mb-3"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </>
                )}

                {/* Common fields */}
                <input
                    name="emailId"
                    type="email"
                    placeholder="Email"
                    className="input input-bordered w-full mb-3"
                    value={formData.emailId}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="input input-bordered w-full mb-3"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {/* Signup extra fields */}
                {!isLogin && (
                    <>
                        <input
                            name="age"
                            type="number"
                            placeholder="Age"
                            className="input input-bordered w-full mb-3"
                            value={formData.age}
                            onChange={handleChange}
                            required
                        />

                        <select
                            name="gender"
                            className="select select-bordered w-full mb-3"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Select Gender
                            </option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>

                        <textarea
                            name="about"
                            className="textarea textarea-bordered w-full mb-3"
                            placeholder="About you"
                            value={formData.about}
                            onChange={handleChange}
                            required
                        />

                        <input
                            name="photo"
                            type="file"
                            className="file-input file-input-bordered w-full mb-3"
                            onChange={handleChange}
                            accept="image/*"
                        />
                    </>
                )}

                <button
                    className="btn btn-primary w-full mb-4"
                    onClick={handleSubmit}
                >
                    {isLogin ? 'Login' : 'Signup'}
                </button>

                {/* Toggle form link */}
                <p className="text-center text-sm">
                    {isLogin
                        ? "New user? "
                        : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 underline ml-1"
                    >
                        {isLogin ? "Sign up here" : "Login here"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;
