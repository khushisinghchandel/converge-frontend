import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "https://converge-backend-vq5a.onrender.com" // Points to your backend
});

export const AuthProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            const request = await client.post("/register", { name, username, password });
            if (request.status === 201) {
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    };

    const handleLogin = async (username, password) => {
    try {
        const request = await client.post("/login", { username, password });
        if (request.status === 200) {
            localStorage.setItem("token", request.data.token);
            
            // FIX: Set the userData state here!
            setUserData({ name: username }); 
            
            router("/home");
        }
    } catch (err) {
        throw err;
    }
};

    const getHistory = async () => {
        try {
            const response = await client.get("/get_all_activity", {
                params: { token: localStorage.getItem("token") }
            });
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const addToHistory = async (meetingCode) => {
        try {
            await client.post("/add_to_history", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
        } catch (err) {
            throw err;
        }
    };

    const data = {
        userData, setUserData, handleRegister, handleLogin, getHistory, addToHistory
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};