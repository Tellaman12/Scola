import React, { useState, useEffect } from 'react';
import '../App.css';

function QuizGame({ user }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    quizzesCompleted: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    subjectStats: {}
  });
  const [leaderboard, setLeaderboard] = useState([]);

  const quizDatabase = {
    mathematics: [
      {
        question: "What is 15 + 27?",
        options: ["40", "42", "41", "43"],
        correct: "42",
        points: 10,
        difficulty: "easy"
      },
      {
        question: "Solve for x: 2x + 5 = 15",
        options: ["x = 5", "x = 10", "x = 7", "x = 3"],
        correct: "x = 5",
        points: 15,
        difficulty: "medium"
      },
      {
        question: "What is the area of a circle with radius 7? (π ≈ 3.14)",
        options: ["153.86", "154.86", "152.86", "155.86"],
        correct: "153.86",
        points: 20,
        difficulty: "hard"
      },
      {
        question: "What is the derivative of x²?",
        options: ["2x", "x", "2", "x²"],
        correct: "2x",
        points: 25,
        difficulty: "hard"
      },
      {
        question: "What is 8 × 7?",
        options: ["54", "56", "58", "52"],
        correct: "56",
        points: 10,
        difficulty: "easy"
      }
    ],
    physics: [
      {
        question: "What is the unit of force?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        correct: "Newton",
        points: 15,
        difficulty: "medium"
      },
      {
        question: "What is the speed of light in vacuum?",
        options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10⁹ m/s", "3 × 10⁷ m/s"],
        correct: "3 × 10⁸ m/s",
        points: 20,
        difficulty: "hard"
      },
      {
        question: "What is Newton's first law?",
        options: ["F = ma", "An object at rest stays at rest", "Every action has an equal reaction", "Energy cannot be created"],
        correct: "An object at rest stays at rest",
        points: 15,
        difficulty: "medium"
      },
      {
        question: "What is the formula for kinetic energy?",
        options: ["KE = mv²", "KE = ½mv²", "KE = mgh", "KE = Fd"],
        correct: "KE = ½mv²",
        points: 20,
        difficulty: "hard"
      }
    ],
    english: [
      {
        question: "What is the plural of 'child'?",
        options: ["childs", "children", "childes", "child"],
        correct: "children",
        points: 10,
        difficulty: "easy"
      },
      {
        question: "Which is correct: 'I have went' or 'I have gone'?",
        options: ["I have went", "I have gone", "Both are correct", "Neither"],
        correct: "I have gone",
        points: 15,
        difficulty: "medium"
      },
      {
        question: "What is a metaphor?",
        options: ["A comparison using 'like' or 'as'", "A direct comparison", "An exaggeration", "A sound effect"],
        correct: "A direct comparison",
        points: 20,
        difficulty: "hard"
      },
      {
        question: "What is the past tense of 'run'?",
        options: ["runned", "ran", "run", "running"],
        correct: "ran",
        points: 10,
        difficulty: "easy"
      }
    ],
    science: [
      {
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: "Au",
        points: 15,
        difficulty: "medium"
      },
      {
        question: "What is H₂O?",
        options: ["Hydrogen peroxide", "Water", "Salt", "Sugar"],
        correct: "Water",
        points: 10,
        difficulty: "easy"
      },
      {
        question: "What is the process by which plants make food?",
        options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"],
        correct: "Photosynthesis",
        points: 15,
        difficulty: "medium"
      },
      {
        question: "What is the atomic number of carbon?",
        options: ["6", "12", "14", "8"],
        correct: "6",
        points: 20,
        difficulty: "hard"
      }
    ]
  };

  useEffect(() => {
    loadUserStats();
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentQuiz && timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && currentQuiz) {
      handleTimeUp();
    }
  }, [timeLeft, currentQuiz, quizCompleted]);

  const loadUserStats = () => {
    const stats = JSON.parse(localStorage.getItem(`quizStats-${user.name}`) || '{}');
    if (Object.keys(stats).length === 0) {
      const defaultStats = {
        totalPoints: 0,
        quizzesCompleted: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        subjectStats: {}
      };
      setUserStats(defaultStats);
      localStorage.setItem(`quizStats-${user.name}`, JSON.stringify(defaultStats));
    } else {
      setUserStats(stats);
    }
  };

  const loadLeaderboard = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const leaderboardData = users.map(u => {
      const stats = JSON.parse(localStorage.getItem(`quizStats-${u.name}`) || '{}');
      return {
        name: u.name,
        points: stats.totalPoints || 0,
        quizzes: stats.quizzesCompleted || 0,
        accuracy: stats.totalAnswers > 0 ? ((stats.correctAnswers / stats.totalAnswers) * 100).toFixed(1) : 0
      };
    }).sort((a, b) => b.points - a.points).slice(0, 10);
    
    setLeaderboard(leaderboardData);
  };

  const startQuiz = (subject) => {
    const questions = quizDatabase[subject];
    if (!questions || questions.length === 0) {
      alert('No questions available for this subject yet!');
      return;
    }

    // Shuffle questions and take first 5
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5).slice(0, 5);
    
    setCurrentQuiz({
      subject,
      questions: shuffledQuestions,
      totalQuestions: shuffledQuestions.length
    });
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setQuizCompleted(false);
    setSelectedAnswer('');
    setActiveView('quiz');
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      alert('Please select an answer!');
      return;
    }

    const question = currentQuiz.questions[currentQuestion];
    let pointsEarned = 0;
    
    if (selectedAnswer === question.correct) {
      pointsEarned = question.points;
      setScore(score + pointsEarned);
    }

    // Update stats
    const newStats = { ...userStats };
    newStats.totalAnswers += 1;
    if (selectedAnswer === question.correct) {
      newStats.correctAnswers += 1;
    }
    
    if (!newStats.subjectStats[currentQuiz.subject]) {
      newStats.subjectStats[currentQuiz.subject] = { points: 0, quizzes: 0, correct: 0, total: 0 };
    }
    newStats.subjectStats[currentQuiz.subject].points += pointsEarned;
    newStats.subjectStats[currentQuiz.subject].total += 1;
    if (selectedAnswer === question.correct) {
      newStats.subjectStats[currentQuiz.subject].correct += 1;
    }

    setUserStats(newStats);
    localStorage.setItem(`quizStats-${user.name}`, JSON.stringify(newStats));

    if (currentQuestion + 1 < currentQuiz.totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setTimeLeft(30);
    } else {
      // Quiz completed
      newStats.totalPoints += score;
      newStats.quizzesCompleted += 1;
      newStats.subjectStats[currentQuiz.subject].quizzes += 1;
      
      setUserStats(newStats);
      localStorage.setItem(`quizStats-${user.name}`, JSON.stringify(newStats));
      setQuizCompleted(true);
      loadLeaderboard(); // Update leaderboard
    }
  };

  const handleTimeUp = () => {
    alert('Time\'s up! Moving to next question.');
    if (currentQuestion + 1 < currentQuiz.totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setTimeLeft(30);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setActiveView('dashboard');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setQuizCompleted(false);
    setSelectedAnswer('');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getRankEmoji = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏆';
    }
  };

  const renderDashboard = () => (
    <div className="content-section">
      <h2>🎮 Quiz Game Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{userStats.totalPoints}</div>
          <div className="stat-label">Total Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{userStats.quizzesCompleted}</div>
          <div className="stat-label">Quizzes Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {userStats.totalAnswers > 0 ? ((userStats.correctAnswers / userStats.totalAnswers) * 100).toFixed(1) : 0}%
          </div>
          <div className="stat-label">Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{userStats.totalAnswers}</div>
          <div className="stat-label">Questions Answered</div>
        </div>
      </div>

      <div className="card">
        <h3>🎯 Choose Your Subject</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {Object.keys(quizDatabase).map(subject => {
            const subjectStats = userStats.subjectStats[subject] || { points: 0, quizzes: 0, correct: 0, total: 0 };
            const accuracy = subjectStats.total > 0 ? ((subjectStats.correct / subjectStats.total) * 100).toFixed(1) : 0;
            
            return (
              <div key={subject} style={{ 
                padding: '20px', 
                background: '#f8f9fa', 
                borderRadius: '12px',
                border: '2px solid #e1e8ed',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }} onClick={() => startQuiz(subject)}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                  {subject === 'mathematics' && '🔢'}
                  {subject === 'physics' && '⚛️'}
                  {subject === 'english' && '📚'}
                  {subject === 'science' && '🧪'}
                </div>
                <h4 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{subject}</h4>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  {quizDatabase[subject].length} questions available
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <div>Points: {subjectStats.points}</div>
                  <div>Quizzes: {subjectStats.quizzes}</div>
                  <div>Accuracy: {accuracy}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3>🏆 Leaderboard</h3>
        {leaderboard.length > 0 ? (
          <div>
            {leaderboard.map((player, idx) => (
              <div key={idx} style={{ 
                padding: '12px', 
                marginBottom: '8px', 
                background: idx < 3 ? '#fff3cd' : '#f8f9fa', 
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: idx < 3 ? '2px solid #ffc107' : '1px solid #e1e8ed'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{getRankEmoji(idx)}</span>
                  <div>
                    <strong>{player.name}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {player.quizzes} quizzes | {player.accuracy}% accuracy
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#667eea' }}>
                  {player.points} pts
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No players yet. Be the first to take a quiz!</p>
        )}
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (!currentQuiz) return null;

    const question = currentQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentQuiz.totalQuestions) * 100;

    return (
      <div className="content-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>🎮 {currentQuiz.subject.charAt(0).toUpperCase() + currentQuiz.subject.slice(1)} Quiz</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#667eea' }}>
              Score: {score} pts
            </div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: timeLeft <= 10 ? '#dc3545' : '#28a745',
              background: timeLeft <= 10 ? '#fff5f5' : '#f0fff4',
              padding: '8px 12px',
              borderRadius: '8px',
              border: `2px solid ${timeLeft <= 10 ? '#dc3545' : '#28a745'}`
            }}>
              ⏰ {timeLeft}s
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span>Question {currentQuestion + 1} of {currentQuiz.totalQuestions}</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ 
                  padding: '4px 8px', 
                  background: getDifficultyColor(question.difficulty), 
                  color: 'white', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {question.difficulty}
                </span>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {question.points} pts
                </span>
              </div>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: '#e1e8ed', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${progress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>

          <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>{question.question}</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(option)}
                style={{
                  padding: '16px',
                  border: selectedAnswer === option ? '3px solid #667eea' : '2px solid #e1e8ed',
                  borderRadius: '12px',
                  background: selectedAnswer === option ? '#e3f2fd' : 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                {option}
              </button>
            ))}
          </div>

          <button 
            onClick={handleNextQuestion}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '18px' }}
          >
            {currentQuestion + 1 < currentQuiz.totalQuestions ? 'Next Question' : 'Finish Quiz'}
          </button>
        </div>
      </div>
    );
  };

  const renderQuizComplete = () => (
    <div className="content-section">
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ color: '#28a745', marginBottom: '16px' }}>Quiz Completed!</h2>
        <div style={{ fontSize: '24px', fontWeight: '600', color: '#667eea', marginBottom: '8px' }}>
          Final Score: {score} points
        </div>
        <div style={{ fontSize: '18px', color: '#666', marginBottom: '24px' }}>
          Subject: {currentQuiz.subject.charAt(0).toUpperCase() + currentQuiz.subject.slice(1)}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ padding: '16px', background: '#f0fff4', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#28a745' }}>
              {currentQuiz.totalQuestions}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Questions</div>
          </div>
          <div style={{ padding: '16px', background: '#e3f2fd', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#1976d2' }}>
              {score}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Points Earned</div>
          </div>
          <div style={{ padding: '16px', background: '#fff3cd', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#ffc107' }}>
              {userStats.totalPoints}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Points</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button onClick={resetQuiz} className="btn-primary">
            🏠 Back to Dashboard
          </button>
          <button 
            onClick={() => startQuiz(currentQuiz.subject)} 
            style={{
              padding: '12px 24px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {activeView === 'dashboard' && renderDashboard()}
      {activeView === 'quiz' && !quizCompleted && renderQuiz()}
      {activeView === 'quiz' && quizCompleted && renderQuizComplete()}
    </div>
  );
}

export default QuizGame;
