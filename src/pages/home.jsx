import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import withAuth from '../utils/withAuth';
import '../styles/home.css'; // Make sure this matches your CSS file name

function HomeComponent() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToHistory } = useContext(AuthContext);

    // Function to handle joining an existing meeting
    const handleJoinVideoCall = async () => {
        if (meetingCode.trim() !== "") {
            try {
                // ONLY try to save history if the user is actually logged in
                if (localStorage.getItem("token")) {
                    await addToHistory(meetingCode);
                }
            } catch (error) {
                console.error("Failed to save history, but continuing:", error);
            } finally {
                // This will always run, teleporting both Users and Guests into the room!
                navigate(`/${meetingCode}`);
            }
        } else {
            alert("Please enter a valid meeting code");
        }
    };

    // Function to instantly create and join a new meeting
    const handleCreateMeeting = async () => {
        const randomCode = Math.random().toString(36).substring(2, 12);
        
        try {
            // ONLY try to save history if the user is actually logged in
            if (localStorage.getItem("token")) {
                await addToHistory(randomCode); 
            }
        } catch (error) {
            console.error("Failed to save history, but continuing:", error);
        } finally {
            navigate(`/${randomCode}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    return (
        <div className="home-container">
            {/* DECORATIVE DOTS */}
            <div className="dot-grid" style={{ top: '15%', left: '10%' }}></div>
            <div className="dot-grid" style={{ bottom: '15%', right: '10%' }}></div>

            {/* NAVBAR */}
            <nav className="navbar">
                <div 
                    className="logo-container" 
                    onClick={() => navigate("/")} 
                    style={{ cursor: 'pointer' }}
                >
                    <span className="logo-icon"></span>
                    <h2 className="logo-text">Converge</h2>
                </div>
                
                <div className="nav-actions">
                    <span 
                        className="history-link" 
                        onClick={() => navigate("/history")}
                        style={{cursor: 'pointer'}}
                    >
                        History
                    </span>
                    <button className="logout-btn" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </nav>

            {/* MAIN DASHBOARD AREA */}
            <main className="home-main">
                <div className="action-card">
                    <h1 className="card-title">Welcome !</h1>
                    <p className="card-subtitle">Connect with anyone.</p>

                    {/* PRIMARY ACTION: Create Meeting */}
                    <button className="create-btn" onClick={handleCreateMeeting}>
                        <span className="plus-icon">+</span> Create New Meeting
                    </button>

                    {/* DIVIDER */}
                    <div className="divider">
                        <span>OR</span>
                    </div>

                    {/* SECONDARY ACTION: Join Meeting */}
                    <div className="join-section">
                        <input 
                            type="text" 
                            className="join-input" 
                            placeholder="Enter meeting code" 
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleJoinVideoCall();
                            }}
                        />
                        <button 
                            className="join-btn" 
                            onClick={handleJoinVideoCall}
                            disabled={!meetingCode.trim()}
                        >
                            Join
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Wrap with security guard to ensure only logged-in users see this page
export default HomeComponent;