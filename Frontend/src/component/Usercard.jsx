import React from 'react';
import { motion } from 'framer-motion';

const Usercard = ({ user, onIgnore, onInterested }) => {
    const { firstName, lastName, photoUrl, age, gender, About, Skills } = user || {};

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent((firstName || 'U') + ' ' + (lastName || ''))}&size=200&background=8a3fa0&color=fff&bold=true`;

    if (!user) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -220, rotate: -10 }}
            transition={{ duration: 0.3 }}
        >
            <div className="ln-profile-card">

                {/* Banner */}
                <div className="ln-profile-card__img">
                    <img
                        src={photoUrl || fallbackAvatar}
                        alt={firstName}
                        onError={(e) => { e.target.onerror = null; e.target.src = fallbackAvatar; }}
                    />
                </div>

                {/* Circular avatar — centered, overlapping banner */}
                <div className="ln-profile-card__avatar">
                    <img
                        src={photoUrl || fallbackAvatar}
                        alt={firstName}
                        onError={(e) => { e.target.onerror = null; e.target.src = fallbackAvatar; }}
                    />
                </div>

                {/* Name */}
                <span className="ln-profile-card__title">{firstName} {lastName}</span>

                {/* Age • Gender */}
                {age && gender && (
                    <span className="ln-profile-card__subtitle">{age} &bull; {gender}</span>
                )}

                {/* Bio */}
                {About && (
                    <p className="ln-profile-card__bio">{About}</p>
                )}

                {/* Skills */}
                {Skills && Skills.length > 0 && (
                    <div className="ln-profile-card__skills">
                        {Skills.slice(0, 3).map((skill, i) => (
                            <span key={i} className="ln-profile-card__skill">{skill}</span>
                        ))}
                    </div>
                )}

                {/* Action buttons */}
                <div className="ln-profile-card__buttons">
                    <button className="ln-profile-card__btn" onClick={onIgnore}>Skip</button>
                    <button className="ln-profile-card__btn ln-profile-card__btn--solid" onClick={onInterested}>Like ♥</button>
                </div>

            </div>
        </motion.div>
    );
};

export default Usercard;

