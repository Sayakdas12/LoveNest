import React, { useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import { useDispatch, useSelector } from 'react-redux';
import { addConnections } from '../utils/connectionSlice';
import { motion } from 'framer-motion';
import { Heart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Connections = () => {
    const connections = useSelector((store) => store.connection);
    const dispatch = useDispatch();

    const fetchConnections = async () => {
        try {
            const res = await axios.get(`${BaseUrl}/user/connections`, { withCredentials: true });
            dispatch(addConnections(res.data.data));
        } catch (error) {
            console.error("Error fetching connections:", error);
        }
    };

    useEffect(() => {
        fetchConnections();
    }, []);

    return (
        <div className="max-w-2xl mx-auto px-4 py-10 mb-32">
            <h1 className="text-3xl font-bold text-center mb-1">My Connections</h1>
            <p className="text-center text-base-content/40 text-sm mb-8">
                People you've matched with
                {connections.length > 0 && (
                    <span className="ml-2 badge badge-primary badge-sm">{connections.length}</span>
                )}
            </p>

            {!connections || connections.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                    <Users size={64} className="text-base-content/20" />
                    <h2 className="text-xl font-semibold text-base-content/50">No connections yet</h2>
                    <p className="text-base-content/40 text-sm">Start swiping to find your matches!</p>
                    <Link to="/feed" className="btn btn-primary btn-sm mt-2">Find Matches</Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {connections.map((user, index) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="relative shrink-0">
                                <img
                                    src={user.photoUrl || 'https://bbdu.ac.in/wp-content/uploads/2021/11/dummy-image1.jpg'}
                                    alt={user.firstName}
                                    className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/30"
                                />
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-base-100"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-semibold truncate">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-sm text-base-content/50 truncate">
                                    {user.About || 'No bio available.'}
                                </p>
                                {user.age && user.gender && (
                                    <p className="text-xs text-base-content/40 mt-0.5">
                                        {user.age} &bull; {user.gender}
                                    </p>
                                )}
                            </div>
                            <Heart size={18} className="text-primary/40 shrink-0" />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Connections;

