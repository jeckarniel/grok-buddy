/* 
   ChatInterface Component
   Primary UI component managing the chat state, message history, 
   and navigation menu.
*/
import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = () => {
  /* UI State: Tracks if AI is typing, the current text input, and menu visibility */
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  
  /* Data State: Stores conversation history */
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", isAi: true },
    { id: 2, text: "I need help with some code.", isAi: false }
  ]);

  return (
    <div className="chat-wrapper">
      {/* 
          Application Header: Contains the AI branding and navigation menu 
      */}
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
      </div>

      {/* 
          Message History: Iterates through messages and applies participant icons 
      */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.isAi ? 'ai-row' : 'user-row'}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
      </div>

      {/* 
          Input Controls: Handles typing, file uploads (all types), and sending 
      */}
      <div className="input-row-container">
        <div className="typing-area">
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