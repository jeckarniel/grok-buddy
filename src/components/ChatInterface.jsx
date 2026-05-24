import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Close menu when clicking outside
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

      {/* Chat Area - Implementation specific */}
      <div className="chat-messages">
        {/* Messages would be mapped here */}
        <div className="message-empty-state">
          Start a conversation with Vibe AI
        </div>
      </div>

      {/* Input Area with Upload and Preview */}
      <div className="input-row-container">
        {previewUrl && (
          <div className="image-preview-box">
            <img src={previewUrl} alt="preview" />
            <button className="close-preview" onClick={removePreview}>×</button>
          </div>
        )}
        
        <div className="typing-area">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
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