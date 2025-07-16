import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Provider } from 'react-redux';
import appStore from './utils/appStore';

import Body from './component/Body';
import Login from './component/Login';
import Feed from './component/Feed';
import Profile from './component/Profile';
// import Register from './component/Register';

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter basename='/'>
        <Routes>
          {/* Layout Route */}
          <Route path='/' element={<Body />}>
            <Route index element={<Feed />} /> {/* Home or default route */}
            <Route path='feed' element={<Feed />} />
            <Route path='login' element={<Login />} />
            <Route path='profile' element={<Profile />} />
          </Route>

          {/* Login outside layout */}
          <Route path='/login' element={<Login />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
