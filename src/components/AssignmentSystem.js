import React, { useState, useEffect } from 'react';
import '../App.css';

function AssignmentSystem({ user, role }) {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    description: '',
    dueDate: '',
    points: 100
  });

  useEffect(() => {
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAssignments = () => {
    const assignmentsData = JSON.parse(localStorage.getItem('assignments') || '[]');
    setAssignments(assignmentsData);
  };

  const createAssignment = () => {
    if (!newAssignment.title || !newAssignment.subject || !newAssignment.dueDate) {
      alert('Please fill in all required fields.');
      return;
    }

    const assignment = {
      id: Date.now(),
      ...newAssignment,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
      submissions: []
    };

    const updatedAssignments = [...assignments, assignment];
    setAssignments(updatedAssignments);
    localStorage.setItem('assignments', JSON.stringify(updatedAssignments));

    setNewAssignment({
      title: '',
      subject: '',
      description: '',
      dueDate: '',
      points: 100
    });

    alert('Assignment created successfully!');
  };

  const submitAssignment = (assignmentId) => {
    const submission = {
      id: Date.now(),
      assignmentId,
      studentName: user.name,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      grade: null,
      feedback: ''
    };

    const updatedAssignments = assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        const existingSubmission = assignment.submissions.find(s => s.studentName === user.name);
        if (existingSubmission) {
          return {
            ...assignment,
            submissions: assignment.submissions.map(s => 
              s.studentName === user.name ? { ...s, ...submission } : s
            )
          };
        } else {
          return {
            ...assignment,
            submissions: [...assignment.submissions, submission]
          };
        }
      }
      return assignment;
    });

    setAssignments(updatedAssignments);
    localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
    alert('Assignment submitted successfully!');
  };

  const gradeAssignment = (assignmentId, studentName, grade, feedback) => {
    const updatedAssignments = assignments.map(assignment => {
      if (assignment.id === assignmentId) {
        return {
          ...assignment,
          submissions: assignment.submissions.map(submission => 
            submission.studentName === studentName 
              ? { ...submission, grade, feedback, gradedAt: new Date().toISOString() }
              : submission
          )
        };
      }
      return assignment;
    });

    setAssignments(updatedAssignments);
    localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
    alert('Grade submitted successfully!');
  };

  const renderTeacherView = () => (
    <div className="content-section">
      <h2>📝 Assignment Management</h2>
      
      <div className="card">
        <h3>Create New Assignment</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Assignment Title</label>
            <input
              type="text"
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
              placeholder="e.g., Math Problem Set 5"
            />
          </div>
          
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={newAssignment.subject}
              onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
              placeholder="e.g., Mathematics"
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
              placeholder="Assignment instructions and requirements..."
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Points</label>
              <input
                type="number"
                value={newAssignment.points}
                onChange={(e) => setNewAssignment({...newAssignment, points: parseInt(e.target.value)})}
                min="1"
                max="1000"
              />
            </div>
          </div>
          
          <button onClick={createAssignment} className="btn-primary">
            Create Assignment
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Assignment Submissions</h3>
        {assignments.length > 0 ? (
          <div>
            {assignments.map((assignment, idx) => (
              <div key={idx} style={{ 
                padding: '16px', 
                marginBottom: '12px', 
                background: '#f8f9fa', 
                borderRadius: '12px',
                border: '1px solid #e1e8ed'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0' }}>{assignment.title}</h4>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      <strong>Subject:</strong> {assignment.subject} | 
                      <strong> Due:</strong> {new Date(assignment.dueDate).toLocaleDateString()} | 
                      <strong> Points:</strong> {assignment.points}
                    </div>
                    {assignment.description && (
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        {assignment.description}
                      </div>
                    )}
                  </div>
                </div>
                
                {assignment.submissions.length > 0 ? (
                  <div>
                    <h5 style={{ margin: '0 0 8px 0' }}>Submissions ({assignment.submissions.length})</h5>
                    {assignment.submissions.map((submission, subIdx) => (
                      <div key={subIdx} style={{ 
                        padding: '12px', 
                        marginBottom: '8px', 
                        background: 'white', 
                        borderRadius: '8px',
                        border: '1px solid #e1e8ed'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{submission.studentName}</strong>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {submission.grade !== null ? (
                              <span style={{ 
                                padding: '4px 8px', 
                                background: '#28a745', 
                                color: 'white', 
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                Grade: {submission.grade}%
                              </span>
                            ) : (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <input
                                  type="number"
                                  placeholder="Grade"
                                  min="0"
                                  max="100"
                                  style={{ width: '60px', padding: '4px', fontSize: '12px' }}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      const grade = parseInt(e.target.value);
                                      const feedback = prompt('Enter feedback (optional):') || '';
                                      gradeAssignment(assignment.id, submission.studentName, grade, feedback);
                                    }
                                  }}
                                />
                                <button 
                                  onClick={() => {
                                    const grade = parseInt(prompt('Enter grade (0-100):'));
                                    const feedback = prompt('Enter feedback (optional):') || '';
                                    if (!isNaN(grade) && grade >= 0 && grade <= 100) {
                                      gradeAssignment(assignment.id, submission.studentName, grade, feedback);
                                    }
                                  }}
                                  className="btn-primary"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                >
                                  Grade
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {submission.feedback && (
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
                            Feedback: {submission.feedback}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No submissions yet</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No assignments created yet</p>
        )}
      </div>
    </div>
  );

  const renderStudentView = () => (
    <div className="content-section">
      <h2>📝 My Assignments</h2>
      
      <div className="card">
        <h3>Assignment List</h3>
        {assignments.length > 0 ? (
          <div>
            {assignments.map((assignment, idx) => {
              const submission = assignment.submissions.find(s => s.studentName === user.name);
              const isOverdue = new Date(assignment.dueDate) < new Date() && !submission;
              
              return (
                <div key={idx} style={{ 
                  padding: '16px', 
                  marginBottom: '12px', 
                  background: isOverdue ? '#fff5f5' : submission ? '#f0fff4' : '#f8f9fa', 
                  borderRadius: '12px',
                  border: `1px solid ${isOverdue ? '#dc3545' : submission ? '#28a745' : '#e1e8ed'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0' }}>{assignment.title}</h4>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        <strong>Subject:</strong> {assignment.subject} | 
                        <strong> Due:</strong> {new Date(assignment.dueDate).toLocaleDateString()} | 
                        <strong> Points:</strong> {assignment.points}
                      </div>
                      {assignment.description && (
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                          {assignment.description}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        padding: '4px 8px', 
                        background: isOverdue ? '#dc3545' : submission ? '#28a745' : '#ffc107', 
                        color: 'white', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        {isOverdue ? 'Overdue' : submission ? 'Submitted' : 'Pending'}
                      </div>
                      {submission && submission.grade !== null && (
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#28a745' }}>
                          Grade: {submission.grade}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!submission && !isOverdue && (
                    <button 
                      onClick={() => submitAssignment(assignment.id)}
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      📤 Submit Assignment
                    </button>
                  )}
                  
                  {submission && submission.feedback && (
                    <div style={{ 
                      marginTop: '12px', 
                      padding: '12px', 
                      background: '#e3f2fd', 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}>
                      <strong>Teacher Feedback:</strong> {submission.feedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">No assignments available</p>
        )}
      </div>
    </div>
  );

  return role === 'teacher' ? renderTeacherView() : renderStudentView();
}

export default AssignmentSystem;
