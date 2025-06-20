import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../redux/features/userSlice';
import { socket } from '../socket/socket';
import { useLocation } from 'react-router-dom';

const NameInputPage = () => {
  const [name, setName] = useState('');
  const location = useLocation();
  const { role } = location.state;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!name.trim()) return;

    dispatch(setUser({ name, role }));
    if (!socket.connected) socket.connect();
    socket.emit("set_name", { name, role });
    localStorage.setItem('user', JSON.stringify({ name, role }));

    navigate('/student'); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <div className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full mb-4 font-medium">
        ✨ Intervue Poll
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        Let’s <span className="text-indigo-600">Get Started</span>
      </h1>
      <p className="text-gray-500 mb-8 max-w-md">
        If you’re a student, you’ll be able to <strong>submit your answers</strong>, participate in live polls,
        and see how your responses compare with your classmates
      </p>

      <div className="mb-6 w-full max-w-sm">
        <label htmlFor="name" className="block text-left text-sm font-medium text-gray-700 mb-1">
          Enter your Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Rahul Bajaj"
        />
      </div>

      <button
        onClick={handleContinue}
        className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-2 rounded-full text-sm font-medium"
      >
        Continue
      </button>
    </div>
  );
};

export default NameInputPage;