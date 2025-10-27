import React, { useState, useEffect } from 'react';
import '../App.css';

function MessagingSystem({ user, role }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    loadMessages();
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMessages = () => {
    const messagesData = JSON.parse(localStorage.getItem('messages') || '[]');
    setMessages(messagesData);
  };

  const loadConversations = () => {
    const messagesData = JSON.parse(localStorage.getItem('messages') || '[]');
    const userMessages = messagesData.filter(m => 
      m.sender === user.name || m.recipient === user.name
    );
    
    const conversationPartners = [...new Set(
      userMessages.map(m => m.sender === user.name ? m.recipient : m.sender)
    )];
    
    setConversations(conversationPartners);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedRecipient) return;

    const message = {
      id: Date.now(),
      sender: user.name,
      recipient: selectedRecipient,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    
    setNewMessage('');
    loadConversations();
  };

  const getRecipients = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(u => u.name !== user.name);
  };

  const getMessagesWithRecipient = (recipient) => {
    return messages.filter(m => 
      (m.sender === user.name && m.recipient === recipient) ||
      (m.sender === recipient && m.recipient === user.name)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  return (
    <div className="content-section">
      <h2>💬 Messaging System</h2>
      
      <div className="card">
        <h3>Send Message</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Send to</label>
            <select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
            >
              <option value="">Select recipient...</option>
              {getRecipients().map(recipient => (
                <option key={recipient.name} value={recipient.name}>
                  {recipient.name} ({recipient.role})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Message</label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
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
          
          <button onClick={sendMessage} className="btn-primary">
            Send Message
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Conversations</h3>
        {conversations.length > 0 ? (
          <div>
            {conversations.map((partner, idx) => {
              const partnerMessages = getMessagesWithRecipient(partner);
              const lastMessage = partnerMessages[partnerMessages.length - 1];
              
              return (
                <div key={idx} style={{ 
                  padding: '16px', 
                  marginBottom: '12px', 
                  background: '#f8f9fa', 
                  borderRadius: '12px',
                  border: '1px solid #e1e8ed',
                  cursor: 'pointer'
                }} onClick={() => setSelectedRecipient(partner)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{partner}</strong>
                      {lastMessage && (
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                          {lastMessage.content.length > 50 
                            ? lastMessage.content.substring(0, 50) + '...' 
                            : lastMessage.content}
                        </div>
                      )}
                    </div>
                    {lastMessage && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(lastMessage.timestamp).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">No conversations yet</p>
        )}
      </div>

      {selectedRecipient && (
        <div className="card">
          <h3>Messages with {selectedRecipient}</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
            {getMessagesWithRecipient(selectedRecipient).length > 0 ? (
              getMessagesWithRecipient(selectedRecipient).map((message, idx) => (
                <div key={idx} style={{ 
                  padding: '12px', 
                  marginBottom: '8px', 
                  background: message.sender === user.name ? '#e3f2fd' : '#f5f5f5', 
                  borderRadius: '8px',
                  marginLeft: message.sender === user.name ? '20%' : '0',
                  marginRight: message.sender === user.name ? '0' : '20%'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                    {message.sender === user.name ? 'You' : message.sender}
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                    {message.content}
                  </div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No messages with {selectedRecipient} yet
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagingSystem;
