import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../../App.css';
import logo from '../../images/logo.svg';
import AssignmentSystem from '../AssignmentSystem';
import MessagingSystem from '../MessagingSystem';
import AttendanceTracker from '../AttendanceTracker';

function TeacherDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [performanceData, setPerformanceData] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [uploadGrade, setUploadGrade] = useState('');
  const [gradesTaught, setGradesTaught] = useState(['Grade 10']);
  const [subjectsTaught, setSubjectsTaught] = useState(['Mathematics']);

  useEffect(() => {
    loadData();
    // Load teacher's grades and subjects from user data or localStorage
    const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}');
    if (teacherInfo.grades) setGradesTaught(teacherInfo.grades);
    if (teacherInfo.subjects) setSubjectsTaught(teacherInfo.subjects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem('performanceData') || '[]');
    setPerformanceData(data);
    if (data.length > 0) {
      setStats(calculateStats(data));
    }
  };

  const getAvailableGrades = () => {
    const data = JSON.parse(localStorage.getItem('performanceData') || '[]');
    const grades = [...new Set(data.map(d => d.grade))].sort();
    return ['All Grades', ...grades];
  };

  const getFilteredData = () => {
    if (selectedGrade === 'All Grades') {
      return performanceData;
    }
    return performanceData.filter(d => d.grade === selectedGrade);
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      return {
        totalStudents: 0,
        totalRecords: 0,
        strugglingCount: 0,
        excellingCount: 0,
        subjectStats: {}
      };
    }

    const students = [...new Set(data.map(d => d.studentName))];
    const studentsStruggling = [...new Set(data.filter(d => parseFloat(d.score) < 50).map(d => d.studentName))];
    const studentsExcelling = [...new Set(data.filter(d => parseFloat(d.score) >= 80).map(d => d.studentName))];

    const subjectStats = {};
    Object.keys(data.reduce((acc, d) => ({ ...acc, [d.subject]: true }), {})).forEach(subject => {
      const subjectData = data.filter(d => d.subject === subject);
      const avg = subjectData.reduce((sum, d) => sum + parseFloat(d.score), 0) / subjectData.length;
      subjectStats[subject] = {
        average: avg.toFixed(1),
        struggling: subjectData.filter(d => parseFloat(d.score) < 50).length,
        moderate: subjectData.filter(d => parseFloat(d.score) >= 50 && parseFloat(d.score) < 70).length,
        excelling: subjectData.filter(d => parseFloat(d.score) >= 80).length
      };
    });

    return {
      totalStudents: students.length,
      totalRecords: data.length,
      strugglingCount: studentsStruggling.length,
      excellingCount: studentsExcelling.length,
      studentsStruggling: studentsStruggling,
      studentsExcelling: studentsExcelling,
      subjectStats
    };
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!uploadGrade) {
      alert('Please select a grade for this upload first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Process the data
        const processedData = jsonData.map(row => ({
          studentName: row.studentName || row['Student Name'] || '',
          studentNumber: row.studentNumber || row['Student Number'] || '',
          subject: row.subject || row.Subject || '',
          topic: row.topic || row.Topic || '',
          score: parseFloat(row.score || row.Score || 0),
          grade: uploadGrade, // Use selected grade
          term: row.term || row.Term || '',
          year: row.year || row.Year || new Date().getFullYear(),
          date: row.date || row.Date || new Date().toISOString().split('T')[0]
        }));

        // Store in localStorage
        const existingData = JSON.parse(localStorage.getItem('performanceData') || '[]');
        const updatedData = [...existingData, ...processedData];
        localStorage.setItem('performanceData', JSON.stringify(updatedData));

        // Update state
        setPerformanceData(updatedData);
        setStats(calculateStats(updatedData));

        alert(`Successfully uploaded ${processedData.length} records for ${uploadGrade}!`);
        setUploadGrade(''); // Reset grade selection
      } catch (error) {
        alert('Error processing file. Please check the format.');
        console.error('Upload error:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadStats = () => {
    if (!stats) {
      alert('No stats available to download. Please upload student data first.');
      return;
    }

    try {
      // Create a more comprehensive stats sheet
      const statsArray = [
        { Metric: 'Total Students', Value: stats.totalStudents },
        { Metric: 'Total Records', Value: stats.totalRecords },
        { Metric: 'Students Struggling', Value: stats.strugglingCount },
        { Metric: 'Top Performers', Value: stats.excellingCount }
      ];

      const ws = XLSX.utils.json_to_sheet(statsArray);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Statistics');
      XLSX.writeFile(wb, 'teacher-stats.xlsx');
      alert('Statistics downloaded successfully!');
    } catch (error) {
      console.error('Error downloading stats:', error);
      alert('Error downloading statistics. Please try again.');
    }
  };

  const getStrugglingStudents = (data = null) => {
    const currentData = data || performanceData;
    if (!stats || !currentData) return [];
    return stats.studentsStruggling.map(studentName => {
      const studentData = currentData.filter(d => d.studentName === studentName);
      const weakSubjects = studentData
        .filter(d => d.score < 50)
        .map(d => ({ subject: d.subject, score: d.score, topic: d.topic }));
      
      // Get unique weak subjects with their worst scores
      const uniqueSubjects = {};
      weakSubjects.forEach(ws => {
        if (!uniqueSubjects[ws.subject] || ws.score < uniqueSubjects[ws.subject].score) {
          uniqueSubjects[ws.subject] = ws;
        }
      });

      // Get past performance (all scores for this student)
      const pastPerformance = studentData.map(d => ({
        subject: d.subject,
        topic: d.topic,
        score: d.score,
        date: d.date || 'N/A'
      }));

      // Find recommended tutors for weak subjects
      const allTutors = JSON.parse(localStorage.getItem('tutors') || '[]');
      const recommendedTutors = allTutors.filter(tutor => {
        const tutorSubjects = typeof tutor.subjects === 'string' ? tutor.subjects : (tutor.subjects || []);
        const tutorSubjectList = typeof tutorSubjects === 'string' ? tutorSubjects.split(',').map(s => s.trim()) : tutorSubjects;
        return Object.keys(uniqueSubjects).some(weakSubj => 
          tutorSubjectList.some(tutorSubj => tutorSubj.toLowerCase().includes(weakSubj.toLowerCase()))
        );
      }).slice(0, 3); // Limit to 3 tutors

      return {
        studentName,
        studentNumber: studentData[0]?.studentNumber || 'N/A',
        grade: studentData[0]?.grade || 'Unknown',
        weakSubjects: Object.values(uniqueSubjects),
        avgScore: studentData.reduce((sum, d) => sum + parseFloat(d.score), 0) / studentData.length,
        pastPerformance,
        recommendedTutors
      };
    });
  };

  const getExcellingStudents = (data = null) => {
    const currentData = data || performanceData;
    if (!stats || !currentData) return [];
    return stats.studentsExcelling.map(studentName => {
      const studentData = currentData.filter(d => d.studentName === studentName);
      const strongSubjects = studentData
        .filter(d => d.score >= 80)
        .map(d => ({ subject: d.subject, score: d.score, topic: d.topic }));
      
      // Get unique strong subjects with their best scores
      const uniqueSubjects = {};
      strongSubjects.forEach(ws => {
        if (!uniqueSubjects[ws.subject] || ws.score > uniqueSubjects[ws.subject].score) {
          uniqueSubjects[ws.subject] = ws;
        }
      });

      return {
        studentName,
        studentNumber: studentData[0]?.studentNumber || 'N/A',
        grade: studentData[0]?.grade || 'Unknown',
        strongSubjects: Object.values(uniqueSubjects),
        avgScore: studentData.reduce((sum, d) => sum + parseFloat(d.score), 0) / studentData.length
      };
    });
  };

  const getTopicsPerformance = (data = null) => {
    const currentData = data || performanceData;
    const topicStats = {};
    currentData.forEach(data => {
      if (!topicStats[data.topic]) {
        topicStats[data.topic] = {
          subject: data.subject,
          total: 0,
          count: 0,
          scores: []
        };
      }
      topicStats[data.topic].total += parseFloat(data.score);
      topicStats[data.topic].count += 1;
      topicStats[data.topic].scores.push(parseFloat(data.score));
    });
    return Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      subject: stats.subject,
      average: (stats.total / stats.count).toFixed(1)
    }));
  };

  const renderDashboard = () => {
    return (
      <div className="content-section">
        <h2>📊 Teacher Dashboard</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats?.totalStudents || 0}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalRecords || 0}</div>
            <div className="stat-label">Performance Records</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.strugglingCount || 0}</div>
            <div className="stat-label">Students Struggling</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.excellingCount || 0}</div>
            <div className="stat-label">Top Performers</div>
          </div>
        </div>

        <div className="card">
          <h3>📚 Subjects You Teach</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {subjectsTaught.map((subject, idx) => (
              <span key={idx} style={{ 
                padding: '8px 16px', 
                background: '#e3f2fd', 
                borderRadius: '20px', 
                fontSize: '14px',
                color: '#1976d2'
              }}>
                {subject}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>🎓 Grades You Teach</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {gradesTaught.map((grade, idx) => (
              <span key={idx} style={{ 
                padding: '8px 16px', 
                background: '#f3e5f5', 
                borderRadius: '20px', 
                fontSize: '14px',
                color: '#7b1fa2'
              }}>
                {grade}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUpload = () => (
    <div className="content-section">
      <h2>📤 Upload Performance Data</h2>
      <div className="card">
        <h3>Upload Excel/CSV File</h3>
        <p>Upload student performance data from Excel or CSV files.</p>
        
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Select Grade for Upload:
            </label>
            <select
              value={uploadGrade}
              onChange={(e) => setUploadGrade(e.target.value)}
              style={{ 
                padding: '12px', 
                border: '2px solid #e1e8ed', 
                borderRadius: '12px', 
                width: '200px',
                fontSize: '16px'
              }}
            >
              <option value="">Choose Grade...</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>
          
          <div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              style={{ marginBottom: '16px' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: '#f5f7fa', borderRadius: '12px' }}>
          <h4>Expected Format:</h4>
          <p>Your file should contain columns: studentName, studentNumber, subject, topic, score, term, year</p>
          <p><strong>Note:</strong> The grade will be automatically set to the grade you selected above.</p>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const filteredData = getFilteredData();
    const topicsPerformance = getTopicsPerformance(filteredData);
    const strugglingStudents = getStrugglingStudents(filteredData);

    // Calculate stats for filtered data
    const filteredStats = filteredData.length > 0 ? calculateStats(filteredData) : null;

    // Prepare data for charts
    const subjectChartData = filteredStats ? Object.entries(filteredStats.subjectStats).map(([subject, data]) => ({
      name: subject,
      Average: parseFloat(data.average),
      Struggling: data.struggling,
      Moderate: data.moderate,
      Excelling: data.excelling
    })) : [];

    const topicChartData = topicsPerformance.slice(0, 10).map(topic => ({
      name: topic.topic.length > 15 ? topic.topic.substring(0, 15) + '...' : topic.topic,
      average: parseFloat(topic.average)
    }));

    return (
      <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>📊 Subject Performance Overview</h3>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                style={{ 
                  padding: '8px 12px', 
                  border: '2px solid #e1e8ed', 
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {getAvailableGrades().map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            {subjectChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Average" fill="#667eea" />
                  <Bar dataKey="Excelling" fill="#28a745" />
                  <Bar dataKey="Moderate" fill="#ffc107" />
                  <Bar dataKey="Struggling" fill="#dc3545" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                No data available for {selectedGrade === 'All Grades' ? 'any grade' : selectedGrade}
              </p>
            )}
          </div>

        {topicChartData.length > 0 && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>📊 Topic Performance (Top 10)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="average" fill="#764ba2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>📊 Topic Performance</h3>
            <button onClick={downloadStats} className="btn-primary">Download Stats</button>
          </div>
          <div style={{ marginTop: '24px' }}>
            {topicsPerformance.map((topic, idx) => (
              <div key={idx} style={{ padding: '16px', marginBottom: '12px', background: '#f5f7fa', borderRadius: '12px' }}>
                <strong>{topic.topic}</strong> ({topic.subject}) - Average: {topic.average}%
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>⚠️ Students Struggling {selectedGrade !== 'All Grades' && `(${selectedGrade})`}</h3>
          {strugglingStudents.length > 0 ? (
            <div>
              {strugglingStudents.map((student, idx) => (
                <div key={idx} style={{ padding: '16px', marginBottom: '12px', background: '#fff5f5', borderRadius: '12px', border: '2px solid #dc3545' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <strong>{student.studentName}</strong> ({student.studentNumber})
                      <div style={{ fontSize: '14px', color: '#666' }}>{student.grade}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#dc3545' }}>Avg: {student.avgScore.toFixed(1)}%</div>
                  </div>
                  <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                    <strong style={{ color: '#dc3545' }}>Struggling in:</strong>
                    {student.weakSubjects.map((ws, i) => (
                      <div key={i} style={{ marginLeft: '16px', marginTop: '6px', fontSize: '14px' }}>
                        📚 {ws.subject} - {ws.topic}: {ws.score}%
                      </div>
                    ))}
                  </div>
                  {student.recommendedTutors && student.recommendedTutors.length > 0 && (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#e3f2fd', borderRadius: '8px' }}>
                      <strong style={{ fontSize: '14px' }}>💡 Recommended Tutors:</strong>
                      {student.recommendedTutors.map((tutor, i) => (
                        <div key={i} style={{ fontSize: '13px', marginTop: '4px' }}>
                          👨‍🏫 {tutor.name} - {tutor.qualification || 'Tutor'} (${tutor.rate || 50}/hr)
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const meetingDate = prompt('Enter meeting date (e.g., 2024-03-15):', new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]);
                        const meetingTime = prompt('Enter meeting time (e.g., 3:00 PM):', '3:00 PM');
                        const topic = prompt('Meeting topic (e.g., Student Performance):', 'Student Performance');

                        if (meetingDate && meetingTime) {
                          const meeting = {
                            id: Date.now(),
                            studentName: student.studentName,
                            studentNumber: student.studentNumber,
                            parentName: `${student.studentName.split(' ')[0]} Parent`,
                            teacherName: user.name,
                            date: meetingDate,
                            time: meetingTime,
                            topic: topic,
                            status: 'scheduled',
                            createdAt: new Date().toISOString(),
                            needsParentApproval: true
                          };

                          const meetings = JSON.parse(localStorage.getItem('parentTeacherMeetings') || '[]');
                          meetings.push(meeting);
                          localStorage.setItem('parentTeacherMeetings', JSON.stringify(meetings));

                          alert(`Meeting scheduled with ${student.studentName}'s parents on ${meetingDate} at ${meetingTime}. Parent will receive the request.`);
                        }
                      }}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}
                    >
                      📅 Schedule Meeting
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No students currently struggling 🎉</p>
          )}
        </div>

        <div className="card">
          <h3>⭐ Top Performers {selectedGrade !== 'All Grades' && `(${selectedGrade})`}</h3>
          {filteredStats?.studentsExcelling && getExcellingStudents(filteredData).length > 0 ? (
            <div>
              {getExcellingStudents(filteredData).map((student, idx) => (
                <div key={idx} style={{ padding: '16px', marginBottom: '12px', background: '#f0fff4', borderRadius: '12px', border: '2px solid #28a745' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <strong>{student.studentName}</strong> ({student.studentNumber})
                      <div style={{ fontSize: '14px', color: '#666' }}>{student.grade}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#28a745' }}>Avg: {student.avgScore.toFixed(1)}%</div>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <strong style={{ color: '#28a745' }}>Strong Subjects:</strong>
                    {student.strongSubjects.map((ss, i) => (
                      <div key={i} style={{ marginLeft: '16px', marginTop: '6px', fontSize: '14px' }}>
                        ⭐ {ss.subject} ({ss.topic}): {ss.score}%
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No top performers yet</p>
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
          <h1>Teacher Dashboard</h1>
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
          <button className={activeView === 'upload' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('upload')}>
            📤 Upload Data
          </button>
          <button className={activeView === 'analytics' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('analytics')}>
            📈 Analytics
          </button>
          <button className={activeView === 'assignments' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('assignments')}>
            📝 Assignments
          </button>
          <button className={activeView === 'attendance' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('attendance')}>
            📅 Attendance
          </button>
          <button className={activeView === 'messaging' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('messaging')}>
            💬 Messages
          </button>
          <button className={activeView === 'meetings' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('meetings')}>
            🤝 Meetings
          </button>
        </nav>

        <main className="main-content">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'upload' && renderUpload()}
          {activeView === 'analytics' && renderAnalytics()}
          {activeView === 'assignments' && <AssignmentSystem user={user} role="teacher" />}
          {activeView === 'attendance' && <AttendanceTracker user={user} />}
          {activeView === 'messaging' && <MessagingSystem user={user} role="teacher" />}
          {activeView === 'meetings' && (
            <div className="content-section">
              <h2>📅 Parent-Teacher Meetings</h2>
              <div className="card">
                <h3>Schedule Meeting with Parents</h3>
                <div style={{ padding: '16px', background: '#f5f7fa', borderRadius: '12px', marginBottom: '24px' }}>
                  <p>Use the "Schedule Meeting" button next to struggling students to automatically schedule meetings with their parents.</p>
                </div>
                <p className="empty-state">Meetings will appear here once scheduled.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default TeacherDashboard;
