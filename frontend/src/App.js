// src/App.jsx
import React,{useState,useEffect} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoleSelectionPage from "./components/RoleSelectionPage";
import NameInputPage from "./components/NameInputPage";
import StudentDashboard from "./components/StudentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import TeacherPoll from "./components/TeacherPoll";
import KickedPage from "./components/KickedPage";
import { socket } from "./socket/socket";
import PollHistoryPage from "./components/PollHistoryPage";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log("Stored user from localStorage:", storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (socket && user) {
      console.log("User from localStorage:", user);
      console.log("Emitting set_name with user:", user);
      socket.emit('set_name', {
        name: user.name,
        role: user.role
      });
      socket.emit('get_current_poll');
      socket.emit('get_result');
    }
  }, [user]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelectionPage />} />
        <Route path="/enter-name" element={<NameInputPage/>} />
        <Route path="/student" element={<StudentDashboard/>} />
        <Route path="/teacher" element={<TeacherDashboard/>} />
        <Route path="/teacher/poll" element={<TeacherPoll/>} />
        <Route path="/kicked" element={<KickedPage />} />
        <Route path="/poll-history" element={<PollHistoryPage />} />
      </Routes>
    </Router>
  );
};

export default App;
