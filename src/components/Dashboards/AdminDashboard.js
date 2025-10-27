import React, { useState, useEffect } from 'react';
import '../../App.css';
import logo from '../../images/logo.svg';

function AdminDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({
    title: '',
    grade: '',
    term: '',
    year: new Date().getFullYear(),
    description: ''
  });

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadReports = () => {
    const reportsData = JSON.parse(localStorage.getItem('reports') || '[]');
    setReports(reportsData);
  };

  const publishReport = () => {
    if (!newReport.title || !newReport.grade || !newReport.term) {
      alert('Please fill in all required fields.');
      return;
    }

    const report = {
      id: Date.now(),
      ...newReport,
      status: 'released',
      publishedAt: new Date().toISOString(),
      publishedBy: user.name
    };

    const updatedReports = [...reports, report];
    setReports(updatedReports);
    localStorage.setItem('reports', JSON.stringify(updatedReports));

    setNewReport({
      title: '',
      grade: '',
      term: '',
      year: new Date().getFullYear(),
      description: ''
    });

    alert('Report published successfully!');
  };

  const renderDashboard = () => {
    const performanceData = JSON.parse(localStorage.getItem('performanceData') || '[]');
    const totalStudents = [...new Set(performanceData.map(d => d.studentName))].length;
    const totalRecords = performanceData.length;
    const publishedReports = reports.filter(r => r.status === 'released').length;

    return (
      <div className="content-section">
        <h2>👨‍💼 Admin Dashboard</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalRecords}</div>
            <div className="stat-label">Performance Records</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{publishedReports}</div>
            <div className="stat-label">Published Reports</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{reports.length}</div>
            <div className="stat-label">Total Reports</div>
          </div>
        </div>

        <div className="card">
          <h3>📊 System Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#e3f2fd', borderRadius: '8px' }}>
              <strong>Active Users</strong>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#1976d2', marginTop: '8px' }}>
                {JSON.parse(localStorage.getItem('users') || '[]').length}
              </div>
            </div>
            <div style={{ padding: '16px', background: '#f3e5f5', borderRadius: '8px' }}>
              <strong>Available Tutors</strong>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#7b1fa2', marginTop: '8px' }}>
                {JSON.parse(localStorage.getItem('tutors') || '[]').length}
              </div>
            </div>
            <div style={{ padding: '16px', background: '#e8f5e8', borderRadius: '8px' }}>
              <strong>Pending Meetings</strong>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#28a745', marginTop: '8px' }}>
                {JSON.parse(localStorage.getItem('parentTeacherMeetings') || '[]').filter(m => m.status === 'scheduled').length}
              </div>
            </div>
            <div style={{ padding: '16px', background: '#fff3cd', borderRadius: '8px' }}>
              <strong>Pending Bookings</strong>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#ffc107', marginTop: '8px' }}>
                {JSON.parse(localStorage.getItem('tutorBookings') || '[]').filter(b => b.status === 'pending').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => (
    <div className="content-section">
      <h2>📄 Report Management</h2>
      
      <div className="card">
        <h3>Publish New Report</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Report Title</label>
            <input
              type="text"
              value={newReport.title}
              onChange={(e) => setNewReport({...newReport, title: e.target.value})}
              placeholder="e.g., Term 1 Report Card"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Grade</label>
              <select
                value={newReport.grade}
                onChange={(e) => setNewReport({...newReport, grade: e.target.value})}
              >
                <option value="">Select Grade</option>
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
            
            <div className="form-group">
              <label>Term</label>
              <select
                value={newReport.term}
                onChange={(e) => setNewReport({...newReport, term: e.target.value})}
              >
                <option value="">Select Term</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
                <option value="Term 4">Term 4</option>
                <option value="Mid-Year">Mid-Year</option>
                <option value="Final">Final</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              value={newReport.year}
              onChange={(e) => setNewReport({...newReport, year: parseInt(e.target.value)})}
              min="2020"
              max="2030"
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newReport.description}
              onChange={(e) => setNewReport({...newReport, description: e.target.value})}
              placeholder="Brief description of the report..."
              rows="3"
              style={{ 
                padding: '12px 16px', 
                border: '2px solid #e1e8ed', 
                borderRadius: '12px', 
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <button onClick={publishReport} className="btn-primary">
            📤 Publish Report
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Published Reports</h3>
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
                  <div><strong>Published:</strong> {new Date(report.publishedAt).toLocaleDateString()}</div>
                  <div><strong>By:</strong> {report.publishedBy}</div>
                </div>
                {report.description && (
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                    {report.description}
                  </div>
                )}
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
                    onClick={() => alert('Report download started! (Demo: This would download the actual PDF file)')}
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
          <p className="empty-state">No reports published yet</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <img src={logo} alt="SCOLA Logo" />
          <h1>Admin Dashboard</h1>
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
          <button className={activeView === 'reports' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveView('reports')}>
            📄 Reports
          </button>
        </nav>

        <main className="main-content">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'reports' && renderReports()}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
