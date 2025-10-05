import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "./Join.css";

const Join = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const sendUser = () => {
    localStorage.setItem('name', name);
    localStorage.setItem('room', room);
  };

  // Detect screen resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 💻 Layout for Desktop
  const DesktopLayout = (
    <div className="JoinPage">
      <h1 className="header">ChatNest</h1>
      <div className="JoinContainer">
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          placeholder="Enter Your Name"
          type="text"
          id="joinInput"
        />
        <input
          onChange={(e) => setRoom(e.target.value)}
          value={room}
          placeholder="Enter Room ID"
          type="text"
          id="joinRoom"
        />
        <Link
          onClick={(event) =>
            (!name || !room) ? event.preventDefault() : sendUser()
          }
          to="/chat"
        >
          <button className="joinbtn">Join Room</button>
        </Link>
      </div>
    </div>
  );

  // 📱 Layout for Mobile
  const MobileLayout = (
    <div className="JoinPage">
      <div className="JoinContainer">
        <div className="JoinContent">
          <h1 className="header">ChatNest</h1>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder="Enter Your Name"
            type="text"
            id="joinInput"
          />
          <input
            onChange={(e) => setRoom(e.target.value)}
            value={room}
            placeholder="Enter Room ID"
            type="text"
            id="joinRoom"
          />
          <Link
            onClick={(event) =>
              (!name || !room) ? event.preventDefault() : sendUser()
            }
            to="/chat"
          >
            <button className="joinbtn" >Join Room</button>
          </Link>
        </div>
      </div>
    </div>
  );

  return isMobile ? MobileLayout : DesktopLayout;
};

export default Join;
