import React, { useEffect, useState } from 'react';
import socketIO from "socket.io-client";
import "./Chat.css";
import sendLogo from "../../assets/send.png";
import Message from "../Message/Message";
import ReactScrollToBottom from "react-scroll-to-bottom";

let socket;
const ENDPOINT = "https://chatnest-backend.onrender.com";

const Chat = () => {
  const [id, setId] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingMessage, setTypingMessage] = useState("");
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    socket = socketIO(ENDPOINT, { transports: ['websocket'] });

    socket.on('connect', () => setId(socket.id));

    const room = localStorage.getItem('room');
    const user = localStorage.getItem('name');

    socket.emit('join-room', { room, user });

    socket.on('welcome', (data) => setMessages(prev => [...prev, data]));
    socket.on('userJoined', (data) => setMessages(prev => [...prev, data]));
    socket.on('leave', (data) => setMessages(prev => [...prev, data]));
    socket.on('showTyping', (msg) => setTypingMessage(msg));
    socket.on('hideTyping', () => setTypingMessage(""));
    socket.on('previousMessages', (prevMessages) => setMessages(prevMessages));

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, []);

  useEffect(() => {
    socket.on('sendMessage', (data) => setMessages(prev => [...prev, data]));
    return () => socket.off('sendMessage');
  }, []);

  let typingTimeout;
  const handleTyping = () => {
    const room = localStorage.getItem('room');
    socket.emit('typing', room);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket.emit('stopTyping', room), 2000);
  };

  const send = () => {
    const textarea = document.getElementById('chatInput');
    const message = textarea.value.trim();
    if (!message) return;

    const room = localStorage.getItem('room');
    socket.emit('message', {
      message,
      room,
      replyTo: replyingTo
    });

    socket.emit('stopTyping', room);
    textarea.value = "";
    setReplyingTo(null); // clear after sending
  };

  return (
    <div className="chatPage">
      <div className="chatContainer">

        <ReactScrollToBottom className="chatBox">
          {messages.map((item, i) => (
            <Message
              key={i}
              id={i}
              activeMessageId={activeMessageId}
              setActiveMessageId={setActiveMessageId}
              user={item.id === id ? '' : item.user}
              message={item.message}
              replyTo={item.replyTo}
              classs={item.id === id ? 'right' : 'left'}
              setReplyingTo={setReplyingTo}
            />
          ))}

          {typingMessage && (
            <div className="messageBubble left typingIndicator">
              <em>{typingMessage}</em>
            </div>
          )}
        </ReactScrollToBottom>

        {/* Reply preview above input */}
        {replyingTo && (
          <div className="replyPreview">
            <span><strong>{replyingTo.user || "You"}</strong>: {replyingTo.message}</span>
            <button onClick={() => setReplyingTo(null)}>✖</button>
          </div>
        )}

        <div className="inputBox">

          
          <textarea
            id="chatInput"
            rows="2"
            placeholder="Type a message..."
            autoFocus  
            onChange={handleTyping}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
          />

          <button onClick={send} className="sendBtn">
            <img src={sendLogo} alt="Send" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Chat;
