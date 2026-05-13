import React from 'react';

/**
 * LoveNest branded loader.
 * @param {string} label  - Optional text shown below the animation
 * @param {string} size   - 'sm' | 'md' (default 'md')
 */
const Loader = ({ label, size = 'md' }) => {
    const scale = size === 'sm' ? 'scale-50' : '';

    return (
        <div className="ln-loader-container">
            <div className={`ln-preloader ${scale}`}>
                <span />
                <span />
                <span />
            </div>
            <div className="ln-shadow" style={size === 'sm' ? { width: 28, height: 6 } : {}} />
            {label && (
                <p className="text-sm mt-1" style={{ color: 'rgba(220,180,200,0.45)' }}>
                    {label}
                </p>
            )}
        </div>
    );
};

export default Loader;
