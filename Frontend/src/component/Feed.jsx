import axios from 'axios'
import React from 'react'
import { BaseUrl } from '../utils/constance'
import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
import { setFeed } from '../utils/feedSlice'
import { useEffect } from 'react'
import Usercard from './Usercard'

const Feed = () => {

    const feed = useSelector((state) => state.feed);

    const dispatch = useDispatch();

    const getFeedData = async () => {
        if (feed) return; // If feed is already set, no need to fetch again
       try{ const res = await axios.get(BaseUrl + "/feed", {
            withCredentials: true,});
        dispatch(setFeed(res?.data?.data)); 
       } catch (error) {
              console.error("Error fetching feed data:", error);
         }
    };
    useEffect(() => {
        getFeedData();
    }, []);
  return ( 
    feed && (
    <div className='flex flex-col items-center justify-center mt-10'>
        <Usercard  user={feed[0]} />
    </div>
  )
)};  
 
export default Feed;