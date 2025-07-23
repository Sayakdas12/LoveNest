import React, { useEffect } from 'react';
import axios from 'axios';
import { BaseUrl } from '../utils/constance';
import { useDispatch, useSelector } from 'react-redux';
import { addConnections } from '../utils/connectionSlice';

const Connections = () => {
  const connections = useSelector((store) => store.connection);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BaseUrl}/user/connections`, {
        withCredentials: true,
      });
      console.log('Fetched connections:', res.data.data); // ✅ log response
      dispatch(addConnections(res.data.data));
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  console.log('connections', connections)
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-Red-800">My Connections</h1>

      {!connections || connections.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">No connections found.</div>
      ) : (
        <div className="flex flex-col gap-5">
          {connections.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 p-5 border border-gray-200 rounded-lg shadow hover:shadow-lg transition bg-white"
            >
              <img
                src={user.photoUrl || 'https://via.placeholder.com/64'}
                alt={user.firstName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-sm text-gray-600">{user.About || 'No bio available.'}</p>

                <div className="text-sm text-gray-500 mt-1">
                  Age: {user.age || 'N/A'} | Gender: {user.gender || 'N/A'}
                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default Connections;
