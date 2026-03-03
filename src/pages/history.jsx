import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import withAuth from '../utils/withAuth'
import { Card, CardContent, Typography, IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import "../App.css";

function History() {
    const { getHistory } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getHistory();
                setMeetings(data);
            } catch (err) {
                console.error("Failed to fetch history:", err);
            }
        }
        fetchHistory();
    }, []);

    // Helper to format the MongoDB date
    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    return (
        <div className="historyContainer">
            <div className="historyHeader">
                <IconButton onClick={() => navigate("/home")}>
                    <ArrowBackIcon />
                </IconButton>
                <h2>Meeting History</h2>
            </div>

            <div className="historyList">
                {meetings.length > 0 ? (
                    meetings.map((meeting, index) => (
                        <Card key={index} className="historyCard" variant="outlined">
                            <CardContent>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    Meeting Code: <strong>{meeting.meetingCode}</strong>
                                </Typography>
                                <Typography variant="h6" component="div">
                                    {formatDate(meeting.date)}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="noHistory">
                        <p>No meeting history found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default withAuth(History);