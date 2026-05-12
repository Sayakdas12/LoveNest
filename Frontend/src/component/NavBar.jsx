import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import { clearUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { Heart, LogOut, User, Rss, Crown, Users, Bell } from 'lucide-react';

const NavBar = () => {
    const user = useSelector((state) => state.user);
    console.log("User in NavBar:", user);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(BaseUrl + '/logout',
                {}, { withCredentials: true });
            dispatch(clearUser());
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <div className="navbar bg-base-300 shadow-md px-4 sticky top-0 z-50">
            <div className="flex-1">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                    <Heart size={22} className="fill-primary" />
                    LOVENest
                </Link>
            </div>
            <div className="flex gap-2 items-center">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full ring ring-primary/30">
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
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-56 p-2 shadow-xl border border-base-200"
                    >
                        {user ? (
                            <>
                                <li className="menu-title text-xs px-3 py-1 text-base-content/40">
                                    Hello, {user.firstName} 👋
                                </li>
                                <li>
                                    <Link to="/profile"><User size={15} /> Profile</Link>
                                </li>
                                <li>
                                    <Link to="/feed"><Rss size={15} /> Feed</Link>
                                </li>
                                <li>
                                    <Link to="/connections"><Users size={15} /> Connections</Link>
                                </li>
                                <li>
                                    <Link to="/requests"><Bell size={15} /> Requests</Link>
                                </li>
                                <li>
                                    <Link to="/premium"><Crown size={15} /> Premium</Link>
                                </li>
                                <div className="divider my-1"></div>
                                <li>
                                    <button onClick={handleLogout} className="text-error">
                                        <LogOut size={15} /> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li><Link to="/login">Login</Link></li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
