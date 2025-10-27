import React, { useState, useEffect } from 'react';
import './App.css';
import { initializeDemoUsers } from './utils/initializeDemoUsers';
import AuthScreen from './components/AuthScreen/AuthScreen';
import TeacherDashboard from './components/Dashboards/TeacherDashboard';
import StudentDashboard from './components/Dashboards/StudentDashboard';
import ParentDashboard from './components/Dashboards/ParentDashboard';
import TutorDashboard from './components/Dashboards/TutorDashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    initializeDemoUsers();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('performanceData'); // Clear performance data on logout
    localStorage.removeItem('tutorBookings'); // Clear bookings on logout
    localStorage.removeItem('parentTeacherMeetings'); // Clear meetings on logout
    localStorage.removeItem('reports'); // Clear reports on logout
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      {user.role === 'student' && <StudentDashboard user={user} onLogout={handleLogout} />}
      {user.role === 'teacher' && <TeacherDashboard user={user} onLogout={handleLogout} />}
      {user.role === 'parent' && <ParentDashboard user={user} onLogout={handleLogout} />}
      {user.role === 'tutor' && <TutorDashboard user={user} onLogout={handleLogout} />}
      {user.role === 'admin' && <AdminDashboard user={user} onLogout={handleLogout} />}
    </div>
  );
}

export default App;
