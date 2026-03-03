import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 1. Added useNavigate
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar, Alert } from '@mui/material';
import styles from '../styles/Auth.module.css';

export default function Authentication() {
    const navigate = useNavigate(); // 2. Initialized navigate
    const location = useLocation(); 
    const [formState, setFormState] = useState(location.state?.isRegister ? 1 : 0); 
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    
    // Alert states
    const [alertMessage, setAlertMessage] = useState(""); // Renamed from 'error' to be more accurate
    const [alertSeverity, setAlertSeverity] = useState("error"); // 3. New state to explicitly control color
    const [open, setOpen] = useState(false); 

    const { handleLogin, handleRegister } = useContext(AuthContext);

    const handleAuth = async (e) => {
        e.preventDefault(); 
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            } else {
                // --- SUCCESSFUL REGISTRATION PATH ---
                const result = await handleRegister(name, username, password);
                
                setAlertMessage(result || "Registration successful!");
                setAlertSeverity("success"); // Forces the Alert to be green with a checkmark
                setOpen(true);

                // Wait 1.5 seconds so the user can actually read the success message, then redirect to Landing
                setTimeout(() => {
                    navigate("/");
                }, 1500);
            }
        } catch (err) {
            // --- ERROR PATH ---
            const message = err.response?.data?.message || "Something went wrong";
            setAlertMessage(message);
            setAlertSeverity("error"); // Forces the Alert to be red
            setOpen(true);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles['dot-grid']} style={{ top: '10%', left: '10%' }}></div>
            <div className={styles['dot-grid']} style={{ bottom: '10%', right: '10%' }}></div>

            <div className={styles['auth-card']}>
                <div className={styles.brand}>
                    <span></span>
                    <h1 className={styles.title}>{formState === 0 ? "Welcome Back !" : "Create Account"}</h1>
                    <p className={styles.subtitle}>
                        {formState === 0 ? "Log in to continue" : "Join Converge and start connecting today"}
                    </p>
                </div>

                <form className={styles.form} onSubmit={handleAuth}>
                    {formState === 1 && (
                        <div className={styles['input-group']}>
                            <label className={styles.label}>Full Name</label>
                            <input 
                                type="text" 
                                className={styles.input} 
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={formState === 1} 
                            />
                        </div>
                    )}

                    <div className={styles['input-group']}>
                        <label className={styles.label}>Email / Username</label>
                        <input 
                            type="text" 
                            className={styles.input} 
                            placeholder="hello@converge.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </div>

                    <div className={styles['input-group']}>
                        <label className={styles.label}>Password</label>
                        <input 
                            type="password" 
                            className={styles.input} 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <button type="submit" className={styles['submit-btn']}>
                        {formState === 0 ? "Log In" : "Sign Up"}
                    </button>
                </form>

                <p className={styles['footer-text']}>
                    {formState === 0 ? "Don't have an account? " : "Already have an account? "}
                    <span 
                        className={styles['toggle-link']} 
                        onClick={() => setFormState(formState === 0 ? 1 : 0)}
                    >
                        {formState === 0 ? "Register here" : "Log in here"}
                    </span>
                </p>
            </div>

            {/* Notification Alert */}
            <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
                {/* 4. Now using the explicit alertSeverity state */}
                <Alert onClose={() => setOpen(false)} severity={alertSeverity} sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}