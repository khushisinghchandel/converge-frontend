import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css'; // Make sure this path points to your CSS file

export default function LandingPage() {
    const navigate = useNavigate();

    const handleGuestJoin = () => {
        // You can replace this with your actual guest room logic, 
        // or just navigate them straight to the Home dashboard
        navigate('/home'); 
    };

    return (
        <div className="container">
            {/* DECORATIVE DOTS */}
            <div className="dot-grid" style={{ top: '10%', left: '30%' }}></div>
            <div className="dot-grid" style={{ bottom: '10%', left: '5%' }}></div>

            {/* NAVBAR */}
          {/* NAVBAR */}
            <nav className="navbar">
                <div className="logo-container">
                    <span className="logo-icon"></span>
                    <h2 className="logo-text">Converge</h2>
                </div>
                
                <div className="nav-actions">
                    <span onClick={handleGuestJoin} className="guest-link" style={{cursor: 'pointer'}}>
                        Join as Guest
                    </span>
                    
                    {/* Pass state to default to Login (0) */}
                    <Link to="/auth" state={{ isRegister: false }} className="login-link">
                        Log In
                    </Link>
                    
                    {/* Pass state to default to Register (1) */}
                    <button onClick={() => navigate('/auth', { state: { isRegister: true } })} className="register-btn">
                        Register
                    </button>
                </div>
            </nav>

            {/* MAIN HERO SECTION */}
            <main className="hero-section">
                
                {/* LEFT CONTENT */}
                <div className="left-content">
                    <h1 className="main-heading">
                        CONNECT<br />
                        <span className="heading-highlight">WITH THE WORLD</span>
                    </h1>
                    
                    <p className="description">
                        Coverge distance with Converge Video Calls. Break down language barriers in real-time and join immersive video calls with live translated subtitles.
                    </p>

                    {/* CTA Button defaults to Register (1) */}
                    <button className="cta-button" onClick={() => navigate('/auth', { state: { isRegister: true } })}>
                        GET STARTED <span className="arrow">&gt;</span>
                    </button>
                </div>

                {/* RIGHT CONTENT (Image Area) */}
                <div className="right-content">
                    <div className="image-wrapper">
                        {/* Make sure mobile.jpg is inside your 'public' folder */}
                        <img 
                            src="/mobile.jpg" 
                            alt="Mobile UI" 
                            className="hero-image"
                        />
                        <div className="image-overlay"></div>
                    </div>
                </div>

            </main>
        </div>
    );
}