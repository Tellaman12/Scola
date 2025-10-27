import React, { useState, useEffect } from 'react';
import '../App.css';

function CalendarView({ user, role }) {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventType, setNewEventType] = useState('assignment');

  useEffect(() => {
    loadEvents();
    setNewEventDate(formatDate(selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEvents = () => {
    const eventsData = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    setEvents(eventsData);
  };

  const addEvent = (title, date, time, type) => {
    const event = {
      id: Date.now(),
      title,
      date,
      time,
      type,
      createdBy: user.name,
      createdAt: new Date().toISOString()
    };

    const updatedEvents = [...events, event];
    setEvents(updatedEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
  };

  const getEventsForDate = (date) => {
    return events.filter(e => e.date === date.toISOString().split('T')[0]);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'assignment': return '#ffc107';
      case 'test': return '#dc3545';
      case 'meeting': return '#28a745';
      case 'exam': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="btn-secondary"
            >
              ←
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="btn-secondary"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="btn-secondary"
            >
              →
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#e1e8ed' }}>
          {dayNames.map(day => (
            <div key={day} style={{ 
              padding: '12px', 
              background: '#f8f9fa', 
              textAlign: 'center', 
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {day}
            </div>
          ))}
          
          {days.map((day, idx) => {
            if (!day) {
              return <div key={idx} style={{ padding: '20px', background: 'white' }}></div>;
            }
            
            const dayEvents = getEventsForDate(day);
            const isToday = formatDate(day) === formatDate(new Date());
            const isSelected = formatDate(day) === formatDate(selectedDate);
            
            return (
              <div 
                key={idx} 
                style={{ 
                  padding: '8px', 
                  background: 'white', 
                  minHeight: '80px',
                  border: isToday ? '2px solid #667eea' : '1px solid #e1e8ed',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#e3f2fd' : 'white'
                }}
                onClick={() => setSelectedDate(day)}
              >
                <div style={{ 
                  fontWeight: isToday ? '600' : 'normal',
                  color: isToday ? '#667eea' : '#333',
                  marginBottom: '4px'
                }}>
                  {day.getDate()}
                </div>
                <div style={{ fontSize: '10px' }}>
                  {dayEvents.slice(0, 2).map(event => (
                    <div 
                      key={event.id}
                      style={{ 
                        background: getEventColor(event.type),
                        color: 'white',
                        padding: '2px 4px',
                        borderRadius: '2px',
                        marginBottom: '2px',
                        fontSize: '10px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEventDetails = () => {
    const selectedEvents = getEventsForDate(selectedDate);
    
    return (
      <div className="card">
        <h3>Events for {selectedDate.toLocaleDateString()}</h3>
        {selectedEvents.length > 0 ? (
          <div>
            {selectedEvents.map((event, idx) => (
              <div key={idx} style={{ 
                padding: '12px', 
                marginBottom: '8px', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                borderLeft: `4px solid ${getEventColor(event.type)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{event.title}</strong>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {event.time} | {event.type}
                    </div>
                  </div>
                  <span style={{ 
                    padding: '4px 8px', 
                    background: getEventColor(event.type), 
                    color: 'white', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No events scheduled for this date</p>
        )}
      </div>
    );
  };

  const renderAddEvent = () => {
    const handleAddEvent = () => {
      if (!newEventTitle || !newEventDate || !newEventTime) {
        alert('Please fill in all fields.');
        return;
      }

      addEvent(newEventTitle, newEventDate, newEventTime, newEventType);
      setNewEventTitle('');
      setNewEventTime('');
      setNewEventType('assignment');
      setNewEventDate(formatDate(selectedDate));
      alert('Event added successfully!');
    };

    return (
      <div className="card">
        <h3>Add Event</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Event Title</label>
            <input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="e.g., Math Test, Parent Meeting"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Event Type</label>
            <select
              value={newEventType}
              onChange={(e) => setNewEventType(e.target.value)}
            >
              <option value="assignment">Assignment</option>
              <option value="test">Test</option>
              <option value="exam">Exam</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <button onClick={handleAddEvent} className="btn-primary">
            Add Event
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="content-section">
      <h2>📅 Calendar</h2>
      
      {renderCalendar()}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {renderEventDetails()}
        {renderAddEvent()}
      </div>
    </div>
  );
}

export default CalendarView;
