import React, { useState, useEffect } from 'react';
import '../App.css';

function PeerChat({ user }) {
  const [activeGroup, setActiveGroup] = useState('math-group');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const groups = [
    { id: 'math-group', name: 'Mathematics Study Group', members: ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'] },
    { id: 'science-group', name: 'Science Study Group', members: ['Alice Johnson', 'Eve Brown', 'Frank Miller', 'Grace Lee'] },
    { id: 'english-group', name: 'English Literature Group', members: ['Bob Smith', 'Henry Taylor', 'Ivy Chen', 'Jack Anderson'] }
  ];

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup]);

  const loadMessages = () => {
    const storedMessages = JSON.parse(localStorage.getItem(`chat-${activeGroup}`) || '[]');
    setMessages(storedMessages);
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: user.name,
      content: message.trim(),
      timestamp: new Date().toISOString(),
      group: activeGroup
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`chat-${activeGroup}`, JSON.stringify(updatedMessages));
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const currentGroup = groups.find(g => g.id === activeGroup);

  return (
    <div className="content-section">
      <h2>💬 Peer Learning Chat</h2>
      
      <div className="peer-chat-container">
        <div className="chat-main">
          <div className="chat-sidebar">
            <h4>Study Groups</h4>
            <div className="member-list">
              {groups.map(group => (
                <div
                  key={group.id}
                  className={activeGroup === group.id ? 'member-item active' : 'member-item'}
                  onClick={() => setActiveGroup(group.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {group.name}
                </div>
              ))}
            </div>
          </div>

          <div className="chat-window">
            <div style={{ padding: '16px', borderBottom: '1px solid #e1e8ed', background: '#f8f9fa' }}>
              <h4 style={{ margin: 0, color: '#333' }}>{currentGroup?.name}</h4>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Members: {currentGroup?.members.join(', ')}
              </div>
            </div>

            <div className="messages-display">
              {messages.length > 0 ? (
                messages.map(msg => (
                  <div key={msg.id} className={`message-item ${msg.sender === user.name ? 'sent' : 'received'}`}>
                    <div className="message-bubble">
                      <div className="message-sender">{msg.sender}</div>
                      <p>{msg.content}</p>
                      <div className="message-timestamp">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>

            <div className="message-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeerChat;
