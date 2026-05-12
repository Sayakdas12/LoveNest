import React from 'react';
import { motion } from 'framer-motion';
import { Heart, X, MapPin, Sparkles } from 'lucide-react';

const Usercard = ({ user, onIgnore, onInterested }) => {
    const { firstName, lastName, photoUrl, age, gender, About, Skills } = user || {};

    if (!user) return (
        <div className="flex items-center justify-center h-96">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -200, rotate: -10 }}
            transition={{ duration: 0.3 }}
            className="card w-80 md:w-96 shadow-2xl overflow-hidden rounded-3xl bg-base-100 border border-base-200"
        >
            {/* Photo with gradient overlay */}
            <div className="relative">
                <img
                    src={photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((firstName||'U')+' '+(lastName||''))}&size=400&background=random&color=fff&bold=true`}
                    alt={`${firstName} ${lastName}`}
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((firstName||'U')+' '+(lastName||''))}&size=400&background=random&color=fff&bold=true`;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-2xl font-bold drop-shadow">{firstName} {lastName}</h2>
                    {age && gender && (
                        <p className="text-sm opacity-90 flex items-center gap-1 mt-0.5">
                            <MapPin size={13} />
                            {age} &bull; {gender}
                        </p>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="card-body p-5">
                {About ? (
                    <p className="text-sm text-base-content/70 line-clamp-2">{About}</p>
                ) : (
                    <p className="text-sm text-base-content/30 italic">No bio yet...</p>
                )}
                {Skills && Skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Sparkles size={14} className="text-primary" />
                        {Skills.slice(0, 4).map((skill, i) => (
                            <span key={i} className="badge badge-primary badge-outline text-xs">{skill}</span>
                        ))}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-center gap-8 mt-5">
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onIgnore}
                        className="btn btn-circle btn-lg btn-error btn-outline shadow-lg"
                        title="Skip"
                    >
                        <X size={26} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onInterested}
                        className="btn btn-circle btn-lg btn-primary shadow-lg"
                        title="Interested"
                    >
                        <Heart size={26} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default Usercard;

