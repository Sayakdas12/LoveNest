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

function App() {
  return (
    <Provider store={appStore}>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <BrowserRouter basename='/'>
        <Routes>
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
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

