import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket/socket';

const RoleSelectionPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRole) return;
    if (selectedRole == "Student"){
      navigate('/enter-name', {
        state: { role: selectedRole }
      });
    }
    if(selectedRole == "Teacher"){
      if (!socket.connected) socket.connect();
      socket.emit('set_name', { name : 'Teacher', role: selectedRole })
      localStorage.setItem('user', JSON.stringify({ name:'Teacher', role:selectedRole }));
      navigate('/teacher');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <div className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full mb-4 font-medium">
        ✨ Intervue Poll
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        Welcome to the <span className="text-indigo-600">Live Polling System</span>
      </h1>
      <p className="text-gray-500 mb-8 max-w-md">
        Please select the role that best describes you to begin using the live polling system
      </p>

      <div className="flex gap-6 mb-6 flex-wrap justify-center">
        <button
          onClick={() => setSelectedRole('Student')}
          className={`p-6 rounded-xl border-2 w-64 text-left transition-all duration-200 ${
            selectedRole === 'Student'
              ? 'border-indigo-600 shadow-lg'
              : 'border-gray-200 hover:border-indigo-400'
          }`}
        >
          <h2 className="font-semibold text-lg mb-1">I’m a Student</h2>
          <p className="text-gray-500 text-sm">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry
          </p>
        </button>

        <button
          onClick={() => setSelectedRole('Teacher')}
          className={`p-6 rounded-xl border-2 w-64 text-left transition-all duration-200 ${
            selectedRole === 'Teacher'
              ? 'border-indigo-600 shadow-lg'
              : 'border-gray-200 hover:border-indigo-400'
          }`}
        >
          <h2 className="font-semibold text-lg mb-1">I’m a Teacher</h2>
          <p className="text-gray-500 text-sm">
            Submit answers and view live poll results in real-time.
          </p>
        </button>
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

export default RoleSelectionPage;
