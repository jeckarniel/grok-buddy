// Import React hooks for state, refs, and lifecycle management
import React, { useState, useRef, useEffect } from 'react';
// Import component-specific styling
import './ChatInterface.css';

// Component: ChatInterface - The primary user interface for the AI chat application
const ChatInterface = () => {
  // State for tracking AI typing animation, message input, and menu visibility
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // State for file uploads and message history
  const [uploadData, setUploadData] = useState({ url: null, name: null, type: null });
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", isAi: true },
    { id: 2, text: "I need help with some code.", isAi: false }
  ]);

  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Handles the selection of any file type (images or documents)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (uploadData.url) URL.revokeObjectURL(uploadData.url);
      setUploadData({
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type
      });
    }
  };

  // Cleans up the file preview and resets the input
  const removeUpload = () => {
    if (uploadData.url) URL.revokeObjectURL(uploadData.url);
    setUploadData({ url: null, name: null, type: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Effect to close the dropdown menu when clicking anywhere else on the screen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Main Render Logic
  return (
    <div className="chat-wrapper">
      {/* Header with Menu and Logout */}
      <div className="chat-header">
        <div className="ai-brand">
          <div className={`ai-head-container ${isTyping ? 'ai-shining' : ''}`}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="unique-ai-svg">
              <path d="M12 2L14.85 8.65L22 9.24L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.24L9.15 8.65L12 2Z" fill="#6366f1"/>
              <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <span className="ai-name">Vibe AI</span>
        </div>

        <div className="menu-wrapper" ref={menuRef}>
          <button className="icon-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
          {menuOpen && (
            <div className="menu-dropdown">
              <button className="menu-item" onClick={() => setMenuOpen(false)}>Account</button>
              <button className="menu-item" onClick={() => setMenuOpen(false)}>Settings</button>
              <hr className="menu-divider" />
              <button className="menu-item logout-btn" onClick={() => { console.log('Logout'); setMenuOpen(false); }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat History: Displays a list of messages with distinct icons for AI and User */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.isAi ? 'ai-row' : 'user-row'}`}>
            {msg.isAi && (
              // AI Message Icon: Unique star/sparkle icon
              <div className="msg-icon ai-msg-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L14.85 8.65L22 9.24L16.5 13.97L18.18 21L12 17.27L5.82 21L7.5 13.97L2 9.24L9.15 8.65L12 2Z" fill="#6366f1"/>
                </svg>
              </div>
            )}
            {/* Message Text Bubble */}
            <div className="message-bubble">{msg.text}</div>
            {!msg.isAi && (
              // User Message Icon: Person icon for human messages
              <div className="msg-icon user-msg-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area: Handles file attachments, message entry, and submission */}
      <div className="input-row-container">
        {uploadData.name && (
          <div className="upload-preview-box">
            {uploadData.type.startsWith('image/') ? (
              <img src={uploadData.url} alt="preview" />
            ) : (
              <div className="file-icon-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <span className="file-name-text">{uploadData.name}</span>
              </div>
            )}
            <button className="close-preview" onClick={removeUpload}>×</button>
          </div>
        )}
        
        <div className="typing-area">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <button className="icon-btn" onClick={() => fileInputRef.current.click()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
          </button>
          
          <input 
            type="text" 
            className="message-input" 
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
          />
          
          <button className="send-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;