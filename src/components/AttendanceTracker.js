import React, { useState, useEffect } from 'react';
import '../App.css';

function AttendanceTracker({ user }) {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('Grade 10');

  useEffect(() => {
    loadStudents();
    loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = () => {
    // Demo students - in a real app, this would come from the database
    const demoStudents = [
      { id: 1, name: 'Alice Johnson', studentNumber: 'STU001', grade: 'Grade 10' },
      { id: 2, name: 'Bob Smith', studentNumber: 'STU002', grade: 'Grade 10' },
      { id: 3, name: 'Carol Davis', studentNumber: 'STU003', grade: 'Grade 10' },
      { id: 4, name: 'David Wilson', studentNumber: 'STU004', grade: 'Grade 10' },
      { id: 5, name: 'Eve Brown', studentNumber: 'STU005', grade: 'Grade 10' }
    ];
    setStudents(demoStudents);
  };

  const loadAttendance = () => {
    const attendanceData = JSON.parse(localStorage.getItem('attendance') || '[]');
    setAttendance(attendanceData);
  };

  const markAttendance = (studentId, status) => {
    const existingRecord = attendance.find(a => 
      a.studentId === studentId && a.date === selectedDate
    );

    let updatedAttendance;
    if (existingRecord) {
      updatedAttendance = attendance.map(a => 
        a.studentId === studentId && a.date === selectedDate
          ? { ...a, status, markedBy: user.name, markedAt: new Date().toISOString() }
          : a
      );
    } else {
      const newRecord = {
        id: Date.now(),
        studentId,
        studentName: students.find(s => s.id === studentId)?.name || 'Unknown',
        date: selectedDate,
        status,
        markedBy: user.name,
        markedAt: new Date().toISOString()
      };
      updatedAttendance = [...attendance, newRecord];
    }

    setAttendance(updatedAttendance);
    localStorage.setItem('attendance', JSON.stringify(updatedAttendance));
  };

  const getAttendanceForDate = (date) => {
    return attendance.filter(a => a.date === date);
  };

  const getAttendanceStats = () => {
    const todayAttendance = getAttendanceForDate(selectedDate);
    const present = todayAttendance.filter(a => a.status === 'present').length;
    const absent = todayAttendance.filter(a => a.status === 'absent').length;
    const late = todayAttendance.filter(a => a.status === 'late').length;
    const total = students.length;

    return { present, absent, late, total };
  };

  const exportAttendance = () => {
    const todayAttendance = getAttendanceForDate(selectedDate);
    const csvContent = [
      ['Student Name', 'Student Number', 'Status', 'Date', 'Marked By'],
      ...todayAttendance.map(a => [
        a.studentName,
        students.find(s => s.id === a.studentId)?.studentNumber || 'N/A',
        a.status,
        a.date,
        a.markedBy
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = getAttendanceStats();

  return (
    <div className="content-section">
      <h2>📅 Attendance Tracker</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.present}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.absent}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.late}</div>
          <div className="stat-label">Late</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Students</div>
        </div>
      </div>

      <div className="card">
        <h3>Mark Attendance</h3>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>
          <button onClick={exportAttendance} className="btn-primary">
            📥 Export CSV
          </button>
        </div>

        <div>
          {students.map((student, idx) => {
            const studentAttendance = attendance.find(a => 
              a.studentId === student.id && a.date === selectedDate
            );
            const currentStatus = studentAttendance?.status || 'not-marked';

            return (
              <div key={idx} style={{ 
                padding: '16px', 
                marginBottom: '12px', 
                background: '#f8f9fa', 
                borderRadius: '12px',
                border: '1px solid #e1e8ed',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{student.name}</strong>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {student.studentNumber} | {student.grade}
                  </div>
                  {studentAttendance && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Marked by {studentAttendance.markedBy} at {new Date(studentAttendance.markedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => markAttendance(student.id, 'present')}
                    style={{
                      padding: '8px 16px',
                      background: currentStatus === 'present' ? '#28a745' : '#f8f9fa',
                      color: currentStatus === 'present' ? 'white' : '#28a745',
                      border: '2px solid #28a745',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    ✅ Present
                  </button>
                  <button
                    onClick={() => markAttendance(student.id, 'late')}
                    style={{
                      padding: '8px 16px',
                      background: currentStatus === 'late' ? '#ffc107' : '#f8f9fa',
                      color: currentStatus === 'late' ? 'white' : '#ffc107',
                      border: '2px solid #ffc107',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    ⏰ Late
                  </button>
                  <button
                    onClick={() => markAttendance(student.id, 'absent')}
                    style={{
                      padding: '8px 16px',
                      background: currentStatus === 'absent' ? '#dc3545' : '#f8f9fa',
                      color: currentStatus === 'absent' ? 'white' : '#dc3545',
                      border: '2px solid #dc3545',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    ❌ Absent
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3>Recent Attendance Records</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {attendance.length > 0 ? (
            <div>
              {attendance.slice(-10).reverse().map((record, idx) => (
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
                    <strong>{record.studentName}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {record.date} | Marked by {record.markedBy}
                    </div>
                  </div>
                  <span style={{ 
                    padding: '4px 8px', 
                    background: record.status === 'present' ? '#28a745' : 
                               record.status === 'late' ? '#ffc107' : '#dc3545', 
                    color: 'white', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No attendance records yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendanceTracker;
