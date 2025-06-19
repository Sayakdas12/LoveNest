import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import NavBar from './component/NavBar'
import Body from './component/Body'
import Login from './component/Login'
import Footer from './component/Footer'
import { Provider } from 'react-redux'
import appStore from './utils/appStore'

function App() {
  return (
    <>
    <Provider store={appStore}>
      <BrowserRouter basename='/'>
       <NavBar />
        <Routes>
          <Route path='/' element={<Body />} />
          <Route path='/login' element={<Login />} />
          {/* <Route path='/register' element={<Register />} /> */}
        </Routes>
        <Footer />
      </BrowserRouter>
       </Provider>
    </>
  )
}

export default App
