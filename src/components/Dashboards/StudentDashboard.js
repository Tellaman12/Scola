import React, { useState, useEffect } from 'react';
import '../../App.css';
import logo from '../../images/logo.svg';
import PeerChat from '../PeerChat';
import AssignmentSystem from '../AssignmentSystem';
import MessagingSystem from '../MessagingSystem';
import CalendarView from '../CalendarView';
import QuizGame from '../QuizGame';

function StudentDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [studentData, setStudentData] = useState(null);
  const [recommendedTutors, setRecommendedTutors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSubject, setSearchSubject] = useState('');

  useEffect(() => {
    loadStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudentData = () => {
    const performanceData = JSON.parse(localStorage.getItem('performanceData') || '[]');
    const studentRecords = performanceData.filter(d => d.studentName === user.name);
    
    if (studentRecords.length > 0) {
      const avgScore = studentRecords.reduce((sum, d) => sum + parseFloat(d.score), 0) / studentRecords.length;
      const strugglingSubjects = studentRecords.filter(d => parseFloat(d.score) < 50);
      const strongSubjects = studentRecords.filter(d => parseFloat(d.score) >= 80);
      
      setStudentData({
        avgScore: avgScore.toFixed(1),
        totalTests: studentRecords.length,
        strugglingSubjects: [...new Set(strugglingSubjects.map(d => d.subject))],
        strongSubjects: [...new Set(strongSubjects.map(d => d.subject))],
        recentPerformance: studentRecords.slice(-5).reverse(),
        riskLevel: avgScore < 50 ? 'High Risk' : avgScore < 70 ? 'Medium Risk' : 'Low Risk'
      });

      // Get recommended tutors based on struggling subjects
      const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
      const recommended = tutors.filter(tutor => {
        const tutorSubjects = typeof tutor.subjects === 'string' ? tutor.subjects.split(',').map(s => s.trim()) : tutor.subjects || [];
        return strugglingSubjects.some(struggling => 
          tutorSubjects.some(tutorSubj => tutorSubj.toLowerCase().includes(struggling.subject.toLowerCase()))
        );
      }).slice(0, 3);
      
      setRecommendedTutors(recommended);
    }
  };

  const renderDashboard = () => {
    if (!studentData) {
      return (
        <div className="content-section">
          <h2>📚 Student Dashboard</h2>
          <div className="card">
            <p className="empty-state">No performance data available yet. Ask your teacher to upload your test results!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="content-section">
        <h2>📚 Student Dashboard</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{studentData.avgScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{studentData.totalTests}</div>
            <div className="stat-label">Tests Taken</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{studentData.strugglingSubjects.length}</div>
            <div className="stat-label">Subjects Struggling</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{studentData.strongSubjects.length}</div>
            <div className="stat-label">Strong Subjects</div>
          </div>
        </div>

        <div className="card">
          <h3>🎯 Performance Overview</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <strong>Risk Level:</strong> 
              <span style={{ 
                color: studentData.riskLevel === 'High Risk' ? '#dc3545' : 
                       studentData.riskLevel === 'Medium Risk' ? '#ffc107' : '#28a745',
                fontWeight: '600',
                marginLeft: '8px'
              }}>
                {studentData.riskLevel}
              </span>
            </div>
          </div>
          
          {studentData.strugglingSubjects.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#dc3545' }}>⚠️ Struggling in:</strong>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {studentData.strugglingSubjects.map((subject, idx) => (
                  <span key={idx} style={{ 
                    padding: '6px 12px', 
                    background: '#fff5f5', 
                    borderRadius: '16px', 
                    fontSize: '14px',
                    color: '#dc3545',
                    border: '1px solid #dc3545'
                  }}>
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}

          {studentData.strongSubjects.length > 0 && (
            <div>
              <strong style={{ color: '#28a745' }}>⭐ Strong in:</strong>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {studentData.strongSubjects.map((subject, idx) => (
                  <span key={idx} style={{ 
                    padding: '6px 12px', 
                    background: '#f0fff4', 
                    borderRadius: '16px', 
                    fontSize: '14px',
                    color: '#28a745',
                    border: '1px solid #28a745'
                  }}>
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3>📊 Recent Performance</h3>
          {studentData.recentPerformance.length > 0 ? (
            <div>
              {studentData.recentPerformance.map((test, idx) => (
                <div key={idx} style={{ 
                  padding: '12px', 
                  marginBottom: '8px', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong>{test.subject}</strong> - {test.topic}
                    <div style={{ fontSize: '12px', color: '#666' }}>{test.date || 'No date'}</div>
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: test.score >= 80 ? '#28a745' : test.score >= 50 ? '#ffc107' : '#dc3545'
                  }}>
                    {test.score}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No recent test data available</p>
          )}
        </div>

        {recommendedTutors.length > 0 && (
          <div className="card">
            <h3>👨‍🏫 Recommended Tutors</h3>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Based on your performance, here are tutors who can help you improve:
            </p>
            <div>
              {recommendedTutors.map((tutor, idx) => (
                <div key={idx} style={{ 
                  padding: '16px', 
                  marginBottom: '12px', 
                  background: '#e3f2fd', 
                  borderRadius: '12px',
                  border: '1px solid #2196f3'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong>{tutor.name}</strong>
                    <span style={{ fontSize: '14px', color: '#1976d2' }}>${tutor.rate}/hr</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    {tutor.qualification}
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: '12px' }}>
                    <strong>Subjects:</strong> {tutor.subjects}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                    {tutor.bio}
                  </div>
                  <button 
                    onClick={() => {
                      const booking = {
                        id: Date.now(),
                        studentName: user.name,
                        studentEmail: user.email,
                        tutorName: tutor.name,
                        tutorEmail: tutor.email,
                        subjects: tutor.subjects,
                        rate: tutor.rate,
                        status: 'pending',
                        requestedAt: new Date().toISOString(),
                        message: `Hi ${tutor.name}, I'd like to book a tutoring session for ${tutor.subjects}.`
                      };
                      
                      const bookings = JSON.parse(localStorage.getItem('tutorBookings') || '[]');
                      bookings.push(booking);
                      localStorage.setItem('tutorBookings', JSON.stringify(bookings));
                      
                      alert(`Booking request sent to ${tutor.name}! They will review and respond to your request.`);
                    }}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    📅 Book Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFindTutor = () => {
    const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
    
    const filteredTutors = tutors.filter(tutor => {
      const matchesSearch = searchTerm === '' || tutor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = searchSubject === '' || (typeof tutor.subjects === 'string' && tutor.subjects.toLowerCase().includes(searchSubject.toLowerCase()));
      return matchesSearch && matchesSubject;
    });

    return (
      <div className="content-section">
        <h2>👨‍🏫 Find a Tutor</h2>
        
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Search by Name</label>
              <input
                type="text"
                placeholder="Search tutors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Filter by Subject</label>
              <input
                type="text"
                placeholder="e.g., Mathematics, Physics..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Available Tutors ({filteredTutors.length})</h3>
          {filteredTutors.length > 0 ? (
            <div>
              {filteredTutors.map((tutor, idx) => (
                <div key={idx} style={{ 
                  padding: '20px', 
                  marginBottom: '16px', 
                  background: '#f8f9fa', 
                  borderRadius: '12px',
                  border: '2px solid #e1e8ed'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '20px'
                        }}>
                          {tutor.name.charAt(0)}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, color: '#333' }}>{tutor.name}</h4>
                          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{tutor.qualification}</p>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Subjects:</strong> {tutor.subjects}
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Hourly Rate:</strong> ${tutor.rate}/hour
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Availability:</strong> {tutor.availability}
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <strong>Rating:</strong> {'⭐'.repeat(Math.floor(tutor.rating || 4))} {tutor.rating || 4}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                        {tutor.bio}
                      </div>
                      
                      <button 
                        onClick={() => {
                          const booking = {
                            id: Date.now(),
                            studentName: user.name,
                            studentEmail: user.email,
                            tutorName: tutor.name,
                            tutorEmail: tutor.email,
                            subjects: tutor.subjects,
                            rate: tutor.rate,
                            status: 'pending',
                            requestedAt: new Date().toISOString(),
                            message: `Hi ${tutor.name}, I'd like to book a tutoring session.`
                          };
                          
                          const bookings = JSON.parse(localStorage.getItem('tutorBookings') || '[]');
                          bookings.push(booking);
                          localStorage.setItem('tutorBookings', JSON.stringify(bookings));
                          
                          alert(`Booking request sent to ${tutor.name}! They will review and respond.`);
                        }}
                        className="btn-primary"
                        style={{ padding: '10px 20px', fontSize: '15px' }}
                      >
                        📅 Book Session
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No tutors found. Try adjusting your search criteria.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <img src={logo} alt="SCOLA Logo" />
          <h1>Student Dashboard</h1>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            {user.name.charAt(0)}
          </div>
          <span>{user.name}</span>
          <button onClick={onLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-body">
        <nav className="sidebar">
          <button className={activeView === 'dashboard' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('dashboard')}>
            📊 Dashboard
          </button>
          <button className={activeView === 'assignments' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('assignments')}>
            📝 Assignments
          </button>
          <button className={activeView === 'peerchat' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('peerchat')}>
            💬 Peer Learning
          </button>
          <button className={activeView === 'messaging' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('messaging')}>
            📨 Messages
          </button>
          <button className={activeView === 'calendar' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('calendar')}>
            📅 Calendar
          </button>
          <button className={activeView === 'quiz' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('quiz')}>
            🎮 Quiz Game
          </button>
          <button className={activeView === 'findtutor' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('findtutor')}>
            👨‍🏫 Find Tutor
          </button>
        </nav>

        <main className="main-content">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'assignments' && <AssignmentSystem user={user} role="student" />}
          {activeView === 'peerchat' && <PeerChat user={user} />}
          {activeView === 'messaging' && <MessagingSystem user={user} role="student" />}
          {activeView === 'calendar' && <CalendarView user={user} role="student" />}
          {activeView === 'quiz' && <QuizGame user={user} />}
          {activeView === 'findtutor' && renderFindTutor()}
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
