import React, { useState, useEffect } from 'react';
import '../../App.css';
import logo from '../../images/logo.svg';

function TutorDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [profile, setProfile] = useState({
    qualification: '',
    subjects: '',
    rate: '',
    availability: '',
    bio: ''
  });
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadProfile();
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = () => {
    const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
    const tutorProfile = tutors.find(t => t.email === user.email);
    if (tutorProfile) {
      setProfile({
        qualification: tutorProfile.qualification || '',
        subjects: tutorProfile.subjects || '',
        rate: tutorProfile.rate || '',
        availability: tutorProfile.availability || '',
        bio: tutorProfile.bio || ''
      });
    }
  };

  const loadBookings = () => {
    const bookingsData = JSON.parse(localStorage.getItem('tutorBookings') || '[]');
    const myBookings = bookingsData.filter(b => b.tutorEmail === user.email);
    setBookings(myBookings);
  };

  const updateProfile = () => {
    const tutors = JSON.parse(localStorage.getItem('tutors') || '[]');
    const tutorExists = tutors.find(t => t.email === user.email);
    
    let updatedTutors;
    if (tutorExists) {
      // Update existing tutor
      updatedTutors = tutors.map(t => 
        t.email === user.email 
          ? { ...t, ...profile, name: user.name, email: user.email }
          : t
      );
    } else {
      // Add new tutor to registry
      const newTutor = {
        ...profile,
        name: user.name,
        email: user.email,
        id: Date.now(),
        rating: profile.rating || 4.5
      };
      updatedTutors = [...tutors, newTutor];
    }
    
    localStorage.setItem('tutors', JSON.stringify(updatedTutors));
    setProfile(updatedTutors.find(t => t.email === user.email) || profile);
    alert('Profile updated successfully!');
  };

  const handleBookingAction = (bookingId, action) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: action, respondedAt: new Date().toISOString() }
        : booking
    );
    setBookings(updatedBookings);
    
    const allBookings = JSON.parse(localStorage.getItem('tutorBookings') || '[]');
    const updatedAllBookings = allBookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: action, respondedAt: new Date().toISOString() }
        : booking
    );
    localStorage.setItem('tutorBookings', JSON.stringify(updatedAllBookings));
    
    alert(`Booking ${action} successfully!`);
  };

  const renderDashboard = () => {
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const acceptedBookings = bookings.filter(b => b.status === 'accepted');
    const completedBookings = bookings.filter(b => b.status === 'completed');

    return (
      <div className="content-section">
        <h2>👨‍🏫 Tutor Dashboard</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{pendingBookings.length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{acceptedBookings.length}</div>
            <div className="stat-label">Accepted Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completedBookings.length}</div>
            <div className="stat-label">Completed Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${profile.rate || 0}</div>
            <div className="stat-label">Hourly Rate</div>
          </div>
        </div>

        <div className="card">
          <h3>📊 Recent Activity</h3>
          {bookings.length > 0 ? (
            <div>
              {bookings.slice(0, 5).map((booking, idx) => (
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
                    <strong>{booking.studentName}</strong> - {booking.subjects}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Requested: {new Date(booking.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ 
                    padding: '4px 8px', 
                    background: booking.status === 'pending' ? '#ffc107' : 
                               booking.status === 'accepted' ? '#28a745' : '#6c757d', 
                    color: 'white', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No recent bookings</p>
          )}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="content-section">
      <h2>👤 Profile Management</h2>
      
      <div className="card">
        <h3>Edit Profile</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Qualification</label>
            <input
              type="text"
              value={profile.qualification}
              onChange={(e) => setProfile({...profile, qualification: e.target.value})}
              placeholder="e.g., PhD Mathematics, MSc Physics"
            />
          </div>
          
          <div className="form-group">
            <label>Subjects You Teach</label>
            <input
              type="text"
              value={profile.subjects}
              onChange={(e) => setProfile({...profile, subjects: e.target.value})}
              placeholder="e.g., Mathematics, Physics, Chemistry"
            />
          </div>
          
          <div className="form-group">
            <label>Hourly Rate ($)</label>
            <input
              type="number"
              value={profile.rate}
              onChange={(e) => setProfile({...profile, rate: e.target.value})}
              placeholder="e.g., 50"
            />
          </div>
          
          <div className="form-group">
            <label>Availability</label>
            <input
              type="text"
              value={profile.availability}
              onChange={(e) => setProfile({...profile, availability: e.target.value})}
              placeholder="e.g., Mon-Fri 4pm-8pm, Weekends 10am-6pm"
            />
          </div>
          
          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              placeholder="Tell students about your teaching experience and approach..."
              rows="4"
              style={{ 
                padding: '12px 16px', 
                border: '2px solid #e1e8ed', 
                borderRadius: '12px', 
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <button onClick={updateProfile} className="btn-primary">
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => {
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const latestBookings = [...pendingBookings].sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)).slice(0, 10);
    
    return (
      <div className="content-section">
        <h2>🔔 Notifications</h2>
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Booking Requests ({pendingBookings.length})</h3>
            <span style={{ 
              padding: '6px 12px', 
              background: '#ffc107', 
              color: 'white', 
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {pendingBookings.length} New
            </span>
          </div>
          
          {latestBookings.length > 0 ? (
            <div>
              {latestBookings.map((booking, idx) => (
                <div key={idx} style={{ 
                  padding: '16px', 
                  marginBottom: '12px', 
                  background: '#fff3cd', 
                  borderRadius: '12px',
                  border: '2px solid #ffc107'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '16px'
                        }}>
                          {booking.studentName.charAt(0)}
                        </div>
                        <div>
                          <strong>{booking.studentName}</strong>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            📅 {new Date(booking.requestedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                        <strong>Subject:</strong> {booking.subjects}
                      </div>
                      <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                        <strong>Rate:</strong> ${booking.rate}/hour
                      </div>
                      {booking.message && (
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px', fontStyle: 'italic' }}>
                          "{booking.message}"
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
                      <button 
                        onClick={() => handleBookingAction(booking.id, 'accepted')}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                      >
                        ✅ Accept
                      </button>
                      <button 
                        onClick={() => {
                          const newDate = prompt('Enter new date (e.g., 2024-03-20):', new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]);
                          const newTime = prompt('Enter new time (e.g., 2:00 PM):', '2:00 PM');
                          if (newDate && newTime) {
                            const rescheduledBooking = {...booking, status: 'rescheduled', rescheduledDate: newDate, rescheduledTime: newTime};
                            const allBookings = JSON.parse(localStorage.getItem('tutorBookings') || '[]');
                            const updatedBookings = allBookings.map(b => b.id === booking.id ? rescheduledBooking : b);
                            localStorage.setItem('tutorBookings', JSON.stringify(updatedBookings));
                            setBookings(updatedBookings.filter(b => b.tutorEmail === user.email));
                            alert('Booking rescheduled successfully!');
                          }
                        }}
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '13px',
                          background: '#ffc107',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📅 Reschedule
                      </button>
                      <button 
                        onClick={() => handleBookingAction(booking.id, 'declined')}
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '13px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ❌ Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No new booking requests</p>
          )}
        </div>
      </div>
    );
  };

  const renderBookings = () => (
    <div className="content-section">
      <h2>📅 Booking Management</h2>
      
      <div className="card">
        <h3>Booking Requests</h3>
        {bookings.length > 0 ? (
          <div>
            {bookings.map((booking, idx) => (
              <div key={idx} style={{ 
                padding: '16px', 
                marginBottom: '12px', 
                background: '#f8f9fa', 
                borderRadius: '12px',
                border: '1px solid #e1e8ed'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <strong>{booking.studentName}</strong>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                      📚 Subjects: {booking.subjects}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      💰 Rate: ${booking.rate}/hour
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      📧 Contact: {booking.studentEmail}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      📅 Requested: {new Date(booking.requestedAt).toLocaleDateString()}
                    </div>
                    {booking.message && (
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
                        💬 Message: "{booking.message}"
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      padding: '4px 8px', 
                      background: booking.status === 'pending' ? '#ffc107' : 
                                 booking.status === 'accepted' ? '#28a745' : '#6c757d', 
                      color: 'white', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      {booking.status}
                    </div>
                    {booking.status === 'pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button 
                          onClick={() => handleBookingAction(booking.id, 'accepted')}
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                        >
                          ✅ Accept
                        </button>
                        <button 
                          onClick={() => {
                            const newDate = prompt('Enter new date (e.g., 2024-03-20):', new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]);
                            const newTime = prompt('Enter new time (e.g., 2:00 PM):', '2:00 PM');
                            if (newDate && newTime) {
                              const rescheduledBooking = {...booking, status: 'rescheduled', rescheduledDate: newDate, rescheduledTime: newTime};
                              const allBookings = JSON.parse(localStorage.getItem('tutorBookings') || '[]');
                              const updatedBookings = allBookings.map(b => b.id === booking.id ? rescheduledBooking : b);
                              localStorage.setItem('tutorBookings', JSON.stringify(updatedBookings));
                              setBookings(updatedBookings.filter(b => b.tutorEmail === user.email));
                              alert('Booking rescheduled successfully!');
                            }
                          }}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            background: '#ffc107',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          📅 Reschedule
                        </button>
                        <button 
                          onClick={() => handleBookingAction(booking.id, 'declined')}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          ❌ Decline
                        </button>
                      </div>
                    )}
                    {booking.status === 'accepted' && (
                      <button 
                        onClick={() => handleBookingAction(booking.id, 'completed')}
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        ✅ Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No booking requests at the moment</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <img src={logo} alt="SCOLA Logo" />
          <h1>Tutor Dashboard</h1>
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
          <button className={activeView === 'profile' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('profile')}>
            👤 Profile
          </button>
          <button className={activeView === 'bookings' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('bookings')}>
            📅 Bookings
          </button>
          <button className={activeView === 'notifications' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('notifications')}>
            🔔 Notifications
          </button>
        </nav>

        <main className="main-content">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'profile' && renderProfile()}
          {activeView === 'bookings' && renderBookings()}
          {activeView === 'notifications' && renderNotifications()}
        </main>
      </div>
    </div>
  );
}

export default TutorDashboard;
