import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer footer-horizontal bg-base-300 text-base-content px-8 py-4 fixed bottom-0 left-0 right-0 flex items-center justify-between text-sm border-t border-base-200">
            <div className="flex items-center gap-2 font-semibold text-primary">
                <Heart size={16} className="fill-primary" />
                LOVENest
            </div>
            <p className="text-base-content/40 text-xs hidden sm:block">
                &copy; {new Date().getFullYear()} LoveNest. Made with 💕
            </p>
            <nav className="flex gap-4">
                <a className="link link-hover text-xs text-base-content/50">Privacy</a>
                <a className="link link-hover text-xs text-base-content/50">Terms</a>
                <a className="link link-hover text-xs text-base-content/50">Contact</a>
            </nav>
        </footer>
    );
};

export default Footer;
