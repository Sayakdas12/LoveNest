import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import { clearUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import Connections from './Connections';

const NavBar = () => {
    const user = useSelector((state) => state.user);
    console.log("User in NavBar:", user);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(BaseUrl + '/logout',
                { withCredentials: true });
            dispatch(clearUser());
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <div className="navbar bg-base-300 shadow-sm">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost text-xl">LOVENest 💕</Link>
            </div>
            <div className="flex gap-2 items-center">
                <input type="text" placeholder="Search" className="input input-bordered w-24 md:w-auto" />

                <div className="dropdown dropdown-end mx-5">
                    <p>Hello, {user?.firstName || 'Guest'}</p>

                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            <img
                                alt="User Photo"
                                src={
                                    user?.photoUrl ||
                                    "https://w7.pngwing.com/pngs/910/606/png-transparent-head-the-dummy-avatar-man-tie-jacket-user-thumbnail.png"
                                }
                            />
                        </div>
                    </div>

                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                    >
                        {user ? (
                            <>
                                <li>
                                    <Link className="justify-between" to="/profile">
                                        Profile
                                        <span className="badge">New</span>
                                    </Link>
                                </li>
                                <li><Link to="/feed">Feed</Link></li>
                                <li><Link to="/Premium">Payment Options</Link></li>

                                <li><Link to="/Connections">Connections</Link></li>
                                <li><button onClick={handleLogout}>Logout</button></li>
                            </>
                        ) : (
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
