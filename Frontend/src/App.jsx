import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Provider } from 'react-redux';
import appStore from './utils/appStore';
import { Toaster } from 'react-hot-toast';

import Body from './component/Body';
import Login from './component/Login';
import Signup from './component/Signup';
import Feed from './component/Feed';
import Profile from './component/Profile';
import Connections from './component/Connections';
import Requests from './component/Requests';
import Premium from './component/Premium';
import ChatWindow from './component/ChatWindow';
import Landing from './component/Landing';
import AIChat from './component/AIChat';
import ForgotPassword from './component/ForgotPassword';
import ResetPassword from './component/ResetPassword';
import AdminLayout from './component/Admin/AdminLayout';
import AdminDashboard from './component/Admin/AdminDashboard';
import AdminUsers from './component/Admin/AdminUsers';
import AdminCalls from './component/Admin/AdminCalls';

function App() {
  return (
    <Provider store={appStore}>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <BrowserRouter basename='/'>
        <Routes>
          {/* Public standalone pages */}
          <Route path='home' element={<Landing />} />
          <Route path='forgot-password' element={<ForgotPassword />} />
          <Route path='reset-password' element={<ResetPassword />} />

          {/* Admin panel (standalone layout) */}
          <Route path='admin' element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path='users' element={<AdminUsers />} />
            <Route path='calls' element={<AdminCalls />} />
          </Route>

          {/* Main app with navbar/footer */}
          <Route path='/' element={<Body />}>
            <Route index element={<Feed />} />
            <Route path='feed' element={<Feed />} />
            <Route path='login' element={<Login />} />
            <Route path='signup' element={<Signup />} />
            <Route path='profile' element={<Profile />} />
            <Route path='connections' element={<Connections />} />
            <Route path='requests' element={<Requests />} />
            <Route path='premium' element={<Premium />} />
            <Route path='chat/:userId' element={<ChatWindow />} />
            <Route path='ai-chat' element={<AIChat />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

