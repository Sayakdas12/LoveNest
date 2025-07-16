import React, { useEffect } from 'react';
import NavBar from './NavBar';
import Footer from './Footer';
import { Outlet, useNavigate } from 'react-router-dom';
import { setUser } from '../utils/userSlice';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const res = await axios.get(BaseUrl + "/profile/view", {
        withCredentials: true,
      });
      dispatch(setUser(res.data));
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate("/login");
      } else {
        console.error("Error fetching user data:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div>
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Body;
