import React, { useState, useRef, useEffect } from "react";
import "./Message.css";

const Message = ({ id, activeMessageId, setActiveMessageId, user, message, classs, replyTo, setReplyingTo }) => {
  const [showMenu, setShowMenu] = useState(false);
  const messageRef = useRef();
  const menuRef = useRef();

  const isMe = classs === "right";
  const content = isMe ? "You" : user;

  const handleContextMenu = (e) => {
    e.preventDefault();
    setActiveMessageId(id);
  };

  useEffect(() => {
    setShowMenu(activeMessageId === id);
  }, [activeMessageId, id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setActiveMessageId(null);
  };

  const handleReply = () => {
    setReplyingTo({ user: content, message });
    setActiveMessageId(null);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !messageRef.current.contains(e.target)
      ) {
        setActiveMessageId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [setActiveMessageId]);

  return (
    <div
      className={`messageRow ${classs}`}
      ref={messageRef}
      onContextMenu={handleContextMenu}
    >
      <div className={`messageBubble ${classs}`}>
        {/* If this message is a reply, show preview */}
        {replyTo && (
          <div className="replyBubble">
            <small><strong>{replyTo.user}</strong>: {replyTo.message}</small>
          </div>
        )}

        <pre className="messageText">
          <strong>{content}</strong>
          {"\n"}
          {message}
        </pre>
      </div>

      {showMenu && (
        <div className={`dropdownMenu ${classs}`} ref={menuRef}>
          <div className="dropdownItem" onClick={handleCopy}>📋 Copy</div>
          <div className="dropdownItem" onClick={handleReply}>💬 Reply</div>
        </div>
      )}
    </div>
  );
};

export default Message;
