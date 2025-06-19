import React from 'react'
import NavBar from './NavBar'
import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import { setUser } from '../utils/userSlice'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { BaseUrl } from '../utils/constance';
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();



  // this help to say login user data from server
  const fatchUserData = async () => {
    try {
      const res = await axios.get(BaseUrl + "/profile/view", {
        withCredentials: true,
      });
      dispatch(setUser(res.data));
    } catch (error) {
      if(error.response && error.response.status === 401) {
        // If the user is not authenticated, redirect to login page
        navigate("/login");
        return;
      }
      console.error ("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fatchUserData();
  }, []);

  return (
    <div>
      <Outlet />
    </div>
  )
}

export default Body