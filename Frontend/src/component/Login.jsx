import React from 'react'
import { useState } from 'react'
import axios from 'axios';
import { setUser } from '../utils/userSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BaseUrl } from '../utils/constance';

const Login = () => {
    const [emailId, setEmailId] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const Navigate = useNavigate();
  
    const handleLogin = async () => {
        console.log("Login button clicked");

        try {
            const res = await axios.post(BaseUrl + "/login", {
                emailId,
                password,
            }, { withCredentials: true });     // Ensure credentials are sent with the request

            console.log("Login successful:", res.data);
            dispatch(setUser(res.data));
            Navigate("/");  // Redirect to home page after successful login

        } catch (error) {
            console.error("Login failed:", error);
            // alert("Login failed. Please check your credentials.");
        }
    };



    return (
        <div className="flex justify-center mt-30">
            <div className="card bg-base-300 w-96 shadow-xl mx-auto mt-10">
                <div className="card-body">
                    <h2 className="card-title justify-center text-xl mb-6">Login</h2>
                    <div className="form-control mb-6">
                        <label className="input validator">
                            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <g
                                    stroke-linejoin="round"
                                    stroke-linecap="round"
                                    stroke-width="2.5"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                </g>
                            </svg>
                            <input type="email"
                                value={emailId}
                                required
                                onChange={(e) => setEmailId(e.target.value)}
                            />
                        </label>
                        <div class="validator-hint hidden py-4">Enter valid email address</div>
                    </div>
                    <div className="form-control mb-6">
                        <label className="input validator">
                            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <g
                                    stroke-linejoin="round"
                                    stroke-linecap="round"
                                    stroke-width="2.5"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path
                                        d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                                    ></path>
                                    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                                </g>
                            </svg>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minlength="8"
                                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                title="Must be more than 8 characters, including number, lowercase letter, uppercase letter"
                            />
                        </label>
                        <p className="validator-hint hidden">
                            Must be more than 8 characters, including
                            <br />At least one number <br />At least one lowercase letter <br />At least one uppercase letter
                        </p>
                    </div>
                    <div className="card-actions justify-center">
                        <button className="btn btn-primary" onClick={handleLogin}>Login Now</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login