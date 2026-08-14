import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import CallModal from './CallModal';
import IncomingCallModal from './IncomingCallModal';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { setUser } from '../utils/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import { ME_QUERY } from '../graphql/queries';
import { Heart } from 'lucide-react';
import { connectSocket, disconnectSocket } from '../utils/socket';
import Loader from './Loader';
import { setPresence } from '../utils/firebase';
import { useFaceLock } from '../hooks/useFaceLock';
import FaceLockScreen from './FaceLock/FaceLockScreen';
import { AnimatePresence, motion } from 'framer-motion';

// Decorative floating hearts scattered across the background
const BG_HEARTS = [
  { top: '6%',  left: '3%',    size: 20, rotate: '12deg',  opacity: 0.042 },
  { top: '12%', right: '5%',   size: 26, rotate: '-18deg', opacity: 0.036 },
  { top: '28%', left: '1.5%',  size: 15, rotate: '40deg',  opacity: 0.030 },
  { top: '42%', right: '2%',   size: 22, rotate: '-8deg',  opacity: 0.040 },
  { top: '58%', left: '4%',    size: 17, rotate: '28deg',  opacity: 0.034 },
  { top: '72%', right: '6%',   size: 24, rotate: '-25deg', opacity: 0.038 },
  { top: '85%', left: '2.5%',  size: 19, rotate: '15deg',  opacity: 0.030 },
  { top: '22%', left: '48%',   size: 13, rotate: '50deg',  opacity: 0.024 },
  { top: '65%', right: '1.5%', size: 18, rotate: '-12deg', opacity: 0.030 },
  { top: '50%', left: '50%',   size: 11, rotate: '-35deg', opacity: 0.022 },
  { top: '90%', right: '12%',  size: 16, rotate: '20deg',  opacity: 0.032 },
];

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(state => state.user);

  // Routes that are publicly accessible without auth
  const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublicRoute = PUBLIC_PATHS.includes(location.pathname);
  const { locked, unlock } = useFaceLock();

  // Fetch current user profile via GraphQL
  const { data: meData, loading: meLoading } = useQuery(ME_QUERY, {
    skip: !!user, // skip if already hydrated from localStorage
    fetchPolicy: 'network-only',
    onError: (err) => {
      const code = err.graphQLErrors?.[0]?.extensions?.code;
      if (code === "UNAUTHENTICATED" || err.networkError?.statusCode === 401) {
        if (!isPublicRoute) navigate("/home");
      } else {
        console.error("Error fetching user data:", err);
      }
    },
  });

  useEffect(() => {
    if (meData?.me) {
      dispatch(setUser(meData.me));
    }
  }, [meData, dispatch]);

  const appLoading = meLoading && !user;

  // Manage global socket connection based on login state
  useEffect(() => {
    if (user) {
      connectSocket();
      setPresence(user._id, true);
    } else {
      disconnectSocket();
    }
    return () => {
      if (user) setPresence(user._id, false);
    };
  }, [user]);

  /* ── Splash / loading screen ── */
  if (appLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #12061e 0%, #1e0d30 40%, #160820 100%)' }}
      >
        {/* Background glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.14), transparent)' }} />
          <div className="absolute bottom-1/4 -right-24 w-80 h-80 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(196,120,154,0.10), transparent)' }} />
        </div>

        {/* Floating corner hearts */}
        {[
          { top: '10%', left: '8%',   size: 16, opacity: 0.07 },
          { top: '18%', right: '10%', size: 22, opacity: 0.06 },
          { top: '70%', left: '5%',   size: 18, opacity: 0.06 },
          { bottom: '14%', right: '8%', size: 14, opacity: 0.07 },
        ].map((el, i) => (
          <div key={i} className="absolute pointer-events-none" style={{ ...el }}>
            <Heart size={el.size} style={{ color: '#c4789a' }} className="fill-current" />
          </div>
        ))}

        {/* App name */}
        <div className="relative z-10 text-center mb-12">
          <h1
            className="text-5xl font-black tracking-widest mb-2"
            style={{
              background: 'linear-gradient(135deg, #d090c0, #8a3fa0, #c4789a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            LoveNest
          </h1>
          <p className="text-[11px] uppercase tracking-[0.38em]" style={{ color: 'rgba(220,180,200,0.32)' }}>
            Find your perfect match
          </p>
        </div>

        {/* Loader animation */}
        <div className="relative z-10">
          <Loader label="Loading your matches…" />
        </div>
      </div>
    );
  }

  /* ── Main app shell ── */
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #12061e 0%, #1e0d30 40%, #160820 100%)' }}
    >
      {/* Floating background hearts */}
      {BG_HEARTS.map((el, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            top: el.top, left: el.left, right: el.right,
            transform: `rotate(${el.rotate})`,
            opacity: el.opacity,
          }}
        >
          <Heart size={el.size} style={{ color: '#c4789a' }} className="fill-current" />
        </div>
      ))}

      {/* Subtle ambient glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.07), transparent)' }} />
        <div className="absolute top-2/3 -right-24 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(196,120,154,0.05), transparent)' }} />
        <div className="absolute -bottom-10 left-1/3 w-[500px] h-44 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(138,63,160,0.04), transparent)' }} />
      </div>

      {!isPublicRoute && <NavBar />}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!isPublicRoute && <Footer />}
      <CallModal />
      <IncomingCallModal />
      {locked && <FaceLockScreen onUnlock={unlock} />}
    </div>
  );
};

export default Body;
