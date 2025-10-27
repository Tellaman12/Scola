import React, { useState, useEffect } from 'react';
import '../../App.css';
import logo from '../../images/logo.svg';
import MessagingSystem from '../MessagingSystem';
import CalendarView from '../CalendarView';

function ParentDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [childDetails, setChildDetails] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSubject, setSearchSubject] = useState('');

  useEffect(() => {
    loadChildDetails();
    loadMeetings();
    loadUpcomingTests();
    loadAssignments();
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadChildDetails = () => {
    // For demo purposes, we'll use the student data
    const performanceData = JSON.parse(localStorage.getItem('performanceData') || '[]');
    const studentRecords = performanceData.filter(d => d.studentName === 'Alice Johnson'); // Demo student
    
    if (studentRecords.length > 0) {
      const avgScore = studentRecords.reduce((sum, d) => sum + parseFloat(d.score), 0) / studentRecords.length;
      const strugglingSubjects = studentRecords.filter(d => parseFloat(d.score) < 50);
      const strongSubjects = studentRecords.filter(d => parseFloat(d.score) >= 80);
      
      setChildDetails({
        name: 'Alice Johnson',
        studentNumber: 'STU001',
        grade: 'Grade 10',
        avgScore: avgScore.toFixed(1),
        totalTests: studentRecords.length,
        strugglingSubjects: [...new Set(strugglingSubjects.map(d => d.subject))],
        strongSubjects: [...new Set(strongSubjects.map(d => d.subject))],
        recentPerformance: studentRecords.slice(-10).reverse(),
        riskLevel: avgScore < 50 ? 'High Risk' : avgScore < 70 ? 'Medium Risk' : 'Low Risk',
        attendance: {
          present: 45,
          absent: 3,
          late: 2
        }
      });
    }
  };

  const loadMeetings = () => {
    const meetingsData = JSON.parse(localStorage.getItem('parentTeacherMeetings') || '[]');
    setMeetings(meetingsData);
  };

  const loadUpcomingTests = () => {
    // Demo upcoming tests
    const tests = [
      {
        id: 1,
        subject: 'Mathematics',
        topic: 'Algebra',
        date: '2024-03-20',
        time: '10:00 AM',
        type: 'Test'
      },
      {
        id: 2,
        subject: 'Physics',
        topic: 'Mechanics',
        date: '2024-03-25',
        time: '2:00 PM',
        type: 'Exam'
      },
      {
        id: 3,
        subject: 'English',
        topic: 'Literature Analysis',
        date: '2024-03-28',
        time: '9:00 AM',
        type: 'Assignment Due'
      }
    ];
    setUpcomingTests(tests);
  };

  const loadAssignments = () => {
    // Demo assignments
    const assignmentsData = [
      {
        id: 1,
        title: 'Math Problem Set',
        subject: 'Mathematics',
        dueDate: '2024-03-18',
        status: 'completed',
        score: 85,
        submittedDate: '2024-03-17'
      },
      {
        id: 2,
        title: 'Physics Lab Report',
        subject: 'Physics',
        dueDate: '2024-03-22',
        status: 'pending',
        score: null,
        submittedDate: null
      },
      {
        id: 3,
        title: 'English Essay',
        subject: 'English',
        dueDate: '2024-03-25',
        status: 'completed',
        score: 92,
        submittedDate: '2024-03-24'
      }
    ];
    setAssignments(assignmentsData);
  };

  const loadReports = () => {
    // Demo reports
    const reportsData = [
      {
        id: 1,
        title: 'Term 1 Report Card',
        grade: 'Grade 10',
        term: 'Term 1',
        year: '2024',
        status: 'released',
        downloadUrl: '#',
        releasedDate: '2024-03-15'
      },
      {
        id: 2,
        title: 'Mid-Year Progress Report',
        grade: 'Grade 10',
        term: 'Mid-Year',
        year: '2024',
        status: 'released',
        downloadUrl: '#',
        releasedDate: '2024-02-28'
      },
      {
        id: 3,
        title: 'Previous Year Report',
        grade: 'Grade 9',
        term: 'Final',
        year: '2023',
        status: 'released',
        downloadUrl: '#',
        releasedDate: '2023-12-15'
      }
    ];
    setReports(reportsData);
  };

  const acceptMeeting = (meetingId) => {
    const updatedMeetings = meetings.map(meeting => 
      meeting.id === meetingId 
        ? { ...meeting, status: 'accepted', parentApprovedAt: new Date().toISOString() }
        : meeting
    );
    setMeetings(updatedMeetings);
    localStorage.setItem('parentTeacherMeetings', JSON.stringify(updatedMeetings));
    alert('Meeting accepted! You will receive a confirmation email.');
  };

  const bookTutor = (subject, tutor = null) => {
    if (!tutor) {
      const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
      const availableTutors = tutors.filter(t => 
        t.subjects.toLowerCase().includes(subject.toLowerCase())
      );

      if (availableTutors.length === 0) {
        alert(`No tutors available for ${subject} at the moment.`);
        return;
      }
      tutor = availableTutors[0];
    }

    const booking = {
      id: Date.now(),
      studentName: childDetails?.name || 'Student',
      parentName: user.name,
      parentEmail: user.email,
      tutorName: tutor.name,
      tutorEmail: tutor.email,
      subjects: subject,
      rate: tutor.rate,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      message: `Hi ${tutor.name}, I'd like to book tutoring sessions for my child ${childDetails?.name || 'Student'} in ${subject}.`
    };
    
    const bookings = JSON.parse(localStorage.getItem('tutorBookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('tutorBookings', JSON.stringify(bookings));
    
    alert(`Tutoring request sent to ${tutor.name} for ${subject}!`);
  };

  const downloadReport = (reportId) => {
    // In a real app, this would download the actual PDF
    alert('Report download started! (Demo: This would download the actual PDF file)');
  };

  const renderDashboard = () => {
    if (!childDetails) {
      return (
        <div className="content-section">
          <h2>👨‍👩‍👧‍👦 Parent Dashboard</h2>
          <div className="card">
            <p className="empty-state">No child data available yet. Please contact your child's teacher.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="content-section">
        <h2>👨‍👩‍👧‍👦 Parent Dashboard</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{childDetails.avgScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{childDetails.totalTests}</div>
            <div className="stat-label">Tests Taken</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{childDetails.attendance.present}</div>
            <div className="stat-label">Days Present</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{childDetails.attendance.absent}</div>
            <div className="stat-label">Days Absent</div>
          </div>
        </div>

        <div className="card">
          <h3>👶 Child Details: {childDetails.name}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <strong>Student Number:</strong> {childDetails.studentNumber}<br/>
              <strong>Grade:</strong> {childDetails.grade}<br/>
              <strong>Risk Level:</strong> 
              <span style={{ 
                color: childDetails.riskLevel === 'High Risk' ? '#dc3545' : 
                       childDetails.riskLevel === 'Medium Risk' ? '#ffc107' : '#28a745',
                fontWeight: '600',
                marginLeft: '8px'
              }}>
                {childDetails.riskLevel}
              </span>
            </div>
          </div>
          
          {childDetails.strugglingSubjects.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ color: '#dc3545' }}>⚠️ Struggling in:</strong>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {childDetails.strugglingSubjects.map((subject, idx) => (
                  <span key={idx} style={{ 
                    padding: '6px 12px', 
                    background: '#fff5f5', 
                    borderRadius: '16px', 
                    fontSize: '14px',
                    color: '#dc3545',
                    border: '1px solid #dc3545'
                  }}>
                    {subject}
                    <button 
                      onClick={() => bookTutor(subject)}
                      style={{ 
                        marginLeft: '8px', 
                        padding: '2px 8px', 
                        fontSize: '12px', 
                        background: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Book Tutor
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {childDetails.strongSubjects.length > 0 && (
            <div>
              <strong style={{ color: '#28a745' }}>⭐ Strong in:</strong>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {childDetails.strongSubjects.map((subject, idx) => (
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
          {childDetails.recentPerformance.length > 0 ? (
            <div>
              {childDetails.recentPerformance.map((test, idx) => (
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
      </div>
    );
  };

  const renderUpcomingTests = () => (
    <div className="content-section">
      <h2>📅 Upcoming Tests & Assignments</h2>
      
      <div className="card">
        <h3>📝 Upcoming Tests & Exams</h3>
        {upcomingTests.length > 0 ? (
          <div>
            {upcomingTests.map((test, idx) => (
              <div key={idx} style={{ 
                padding: '16px', 
                marginBottom: '12px', 
                background: '#fff3cd', 
                borderRadius: '12px',
                border: '1px solid #ffc107'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{test.subject}</strong> - {test.topic}
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      📅 {test.date} at {test.time}
                    </div>
                  </div>
                  <span style={{ 
                    padding: '4px 8px', 
                    background: '#ffc107', 
                    color: 'white', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {test.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No upcoming tests scheduled</p>
        )}
      </div>

      <div className="card">
        <h3>📋 Assignment Status</h3>
        {assignments.length > 0 ? (
          <div>
            {assignments.map((assignment, idx) => (
              <div key={idx} style={{ 
                padding: '16px', 
                marginBottom: '12px', 
                background: assignment.status === 'completed' ? '#d4edda' : '#f8d7da', 
                borderRadius: '12px',
                border: `1px solid ${assignment.status === 'completed' ? '#28a745' : '#dc3545'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{assignment.title}</strong> ({assignment.subject})
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      📅 Due: {assignment.dueDate}
                      {assignment.submittedDate && (
                        <span> | ✅ Submitted: {assignment.submittedDate}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      padding: '4px 8px', 
                      background: assignment.status === 'completed' ? '#28a745' : '#dc3545', 
                      color: 'white', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>
                      {assignment.status}
                    </div>
                    {assignment.score && (
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>
                        Score: {assignment.score}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No assignments available</p>
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="content-section">
      <h2>📄 Academic Reports</h2>
      
      <div className="card">
        <h3>📊 Available Reports</h3>
        {reports.length > 0 ? (
          <div className="reports-grid">
            {reports.map((report, idx) => (
              <div key={idx} style={{ 
                padding: '20px', 
                background: '#f8f9fa', 
                borderRadius: '12px',
                border: '1px solid #e1e8ed'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>{report.title}</h4>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                  <div><strong>Grade:</strong> {report.grade}</div>
                  <div><strong>Term:</strong> {report.term}</div>
                  <div><strong>Year:</strong> {report.year}</div>
                  <div><strong>Released:</strong> {report.releasedDate}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    background: '#28a745', 
                    color: 'white', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {report.status}
                  </span>
                  <button 
                    onClick={() => downloadReport(report.id)}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    📥 Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No reports available yet</p>
        )}
      </div>
    </div>
  );

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
                          const subject = prompt('Enter the subject you need tutoring for:', tutor.subjects.split(',')[0]);
                          if (subject) {
                            bookTutor(subject, tutor);
                          }
                        }}
                        className="btn-primary"
                        style={{ padding: '10px 20px', fontSize: '15px' }}
                      >
                        📅 Book Tutor for {childDetails ? childDetails.name : 'Child'}
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

  const renderMeetings = () => (
    <div className="content-section">
      <h2>🤝 Teacher Meetings</h2>
      
      <div className="card">
        <h3>📅 Meeting Requests</h3>
        {meetings.length > 0 ? (
          <div>
            {meetings.map((meeting, idx) => (
              <div key={idx} style={{ 
                padding: '16px', 
                marginBottom: '12px', 
                background: meeting.status === 'scheduled' ? '#fff3cd' : '#d4edda', 
                borderRadius: '12px',
                border: `1px solid ${meeting.status === 'scheduled' ? '#ffc107' : '#28a745'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <strong>Meeting with {meeting.teacherName}</strong>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      📅 {meeting.date} at {meeting.time}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      📝 Topic: {meeting.topic}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      padding: '4px 8px', 
                      background: meeting.status === 'scheduled' ? '#ffc107' : '#28a745', 
                      color: 'white', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      {meeting.status}
                    </div>
                    {meeting.status === 'scheduled' && (
                      <button 
                        onClick={() => acceptMeeting(meeting.id)}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        ✅ Accept Meeting
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No meeting requests at the moment</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <img src={logo} alt="SCOLA Logo" />
          <h1>Parent Dashboard</h1>
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
          <button className={activeView === 'upcoming' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('upcoming')}>
            📅 Upcoming Tests
          </button>
          <button className={activeView === 'reports' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('reports')}>
            📄 Reports
          </button>
          <button className={activeView === 'meetings' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('meetings')}>
            🤝 Meetings
          </button>
          <button className={activeView === 'messaging' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('messaging')}>
            💬 Messages
          </button>
          <button className={activeView === 'calendar' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('calendar')}>
            📅 Calendar
          </button>
          <button className={activeView === 'findtutor' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('findtutor')}>
            👨‍🏫 Find Tutor
          </button>
        </nav>

        <main className="main-content">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'upcoming' && renderUpcomingTests()}
          {activeView === 'reports' && renderReports()}
          {activeView === 'meetings' && renderMeetings()}
          {activeView === 'messaging' && <MessagingSystem user={user} role="parent" />}
          {activeView === 'calendar' && <CalendarView user={user} role="parent" />}
          {activeView === 'findtutor' && renderFindTutor()}
        </main>
      </div>
    </div>
  );
}

export default ParentDashboard;
